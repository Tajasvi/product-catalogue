import type {
  ApiErrorResponse,
  Category,
  CategoryProducts,
  EnquiryInput,
  Product,
} from "../types.js";

interface Envelope<T> {
  data: T;
  meta?: {
    query: string;
    total: number;
  };
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      accept: "application/json",
      ...(init?.body === undefined ? {} : { "content-type": "application/json" }),
      ...init?.headers,
    },
  });

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const apiError = body as ApiErrorResponse | null;
    const fields = Object.fromEntries(
      (apiError?.error.details ?? []).map(({ field, message }) => [
        field,
        message,
      ]),
    );
    throw new ApiClientError(
      apiError?.error.message ?? "The request could not be completed.",
      response.status,
      fields,
    );
  }
  return body as T;
}

export const api = {
  getCategories: async () =>
    (await request<Envelope<Category[]>>("/api/categories")).data,
  getFeaturedProducts: async () =>
    (await request<Envelope<Product[]>>("/api/products/featured")).data,
  getCategoryProducts: async (slug: string) =>
    (await request<Envelope<CategoryProducts>>(
      `/api/categories/${encodeURIComponent(slug)}/products`,
    )).data,
  searchProducts: async (query: string) => {
    const response = await request<Envelope<Product[]>>(
      `/api/products?q=${encodeURIComponent(query)}`,
    );
    return { products: response.data, query: response.meta?.query ?? query };
  },
  getProduct: async (id: number) =>
    (await request<Envelope<Product>>(`/api/products/${id}`)).data,
  submitEnquiry: async (input: EnquiryInput) =>
    (await request<Envelope<{ message: string }>>("/api/enquiries", {
      method: "POST",
      body: JSON.stringify(input),
    })).data,
};

