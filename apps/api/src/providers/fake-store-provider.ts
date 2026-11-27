import { z } from "zod";
import type { Product } from "../domain/catalogue.js";
import { AppError } from "../errors/app-error.js";
import type { ProductProvider } from "../ports/product-provider.js";

const productSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  price: z.number().nonnegative(),
  description: z.string(),
  category: z.string(),
  image: z.url(),
  rating: z.object({
    rate: z.number(),
    count: z.number().int().nonnegative(),
  }),
});

type Fetcher = typeof fetch;

export class FakeStoreProvider implements ProductProvider {
  constructor(
    private readonly baseUrl: string,
    private readonly timeoutMs: number,
    private readonly fetcher: Fetcher = fetch,
  ) {}

  async getProducts(): Promise<Product[]> {
    const body = await this.request("/products");
    return this.parseProducts(body);
  }

  async getProduct(id: number): Promise<Product | null> {
    const response = await this.request(`/products/${id}`, true);
    if (response === null) {
      return null;
    }
    return this.parseProduct(response);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const body = await this.request(`/products/category/${encodeURIComponent(category)}`);
    return this.parseProducts(body);
  }

  private async request(
    path: string,
    allowNotFound = false,
  ): Promise<unknown | null> {
    let response: Response;
    try {
      response = await this.fetcher(`${this.baseUrl.replace(/\/$/, "")}${path}`, {
        signal: AbortSignal.timeout(this.timeoutMs),
        headers: { accept: "application/json" },
      });
    } catch (cause) {
      throw new AppError(
        502,
        "PRODUCT_PROVIDER_FAILED",
        "The product catalogue is temporarily unavailable.",
        undefined,
        { cause },
      );
    }

    if (allowNotFound && response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new AppError(
        502,
        "PRODUCT_PROVIDER_FAILED",
        "The product catalogue is temporarily unavailable.",
      );
    }

    try {
      return await response.json();
    } catch (cause) {
      throw new AppError(
        502,
        "PRODUCT_PROVIDER_FAILED",
        "The product catalogue returned an invalid response.",
        undefined,
        { cause },
      );
    }
  }

  private parseProduct(body: unknown): Product {
    const result = productSchema.safeParse(body);
    if (!result.success) {
      throw new AppError(
        502,
        "PRODUCT_PROVIDER_FAILED",
        "The product catalogue returned invalid product data.",
      );
    }
    return result.data;
  }

  private parseProducts(body: unknown): Product[] {
    const result = z.array(productSchema).safeParse(body);
    if (!result.success) {
      throw new AppError(
        502,
        "PRODUCT_PROVIDER_FAILED",
        "The product catalogue returned invalid product data.",
      );
    }
    return result.data;
  }
}

