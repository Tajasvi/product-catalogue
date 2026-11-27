import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import type { ApiConfig } from "../src/config.js";
import type { Product } from "../src/domain/catalogue.js";
import type { EmailMessage, EmailSender } from "../src/ports/email-sender.js";
import type { ProductProvider } from "../src/ports/product-provider.js";
import { sampleProducts } from "./fixtures.js";

const config: ApiConfig = {
  port: 3000,
  webOrigin: "http://localhost:5173",
  productProvider: {
    baseUrl: "https://store.test",
    timeoutMs: 1000,
  },
  featuredProductsFile: "featured-products.json",
  email: {
    host: "mailpit",
    port: 1025,
    secure: false,
    from: "catalogue@example.test",
    salesInbox: "sales@example.test",
  },
};

class StubProductProvider implements ProductProvider {
  constructor(public products = sampleProducts()) {}

  async getProducts(): Promise<Product[]> {
    return this.products;
  }

  async getProduct(id: number): Promise<Product | null> {
    return this.products.find((product) => product.id === id) ?? null;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.products.filter((product) => product.category === category);
  }
}

class StubEmailSender implements EmailSender {
  readonly send = vi.fn<(message: EmailMessage) => Promise<void>>(
    async () => undefined,
  );
}

describe("catalogue API", () => {
  let products: StubProductProvider;
  let email: StubEmailSender;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    products = new StubProductProvider();
    email = new StubEmailSender();
    app = createApp(config, {
      productProvider: products,
      emailSender: email,
      featuredProductIds: [1, 2, 3, 4, 5],
    });
  });

  it("returns health and exactly five configured featured products", async () => {
    await request(app).get("/health").expect(200, { status: "ok" });
    const response = await request(app).get("/api/products/featured").expect(200);

    expect(response.body.data.map((product: Product) => product.id)).toEqual([
      1, 2, 3, 4, 5,
    ]);
  });

  it("lists categories", async () => {
    const response = await request(app).get("/api/categories").expect(200);
    expect(response.body.data).toEqual([
      { name: "accessories", slug: "accessories" },
      { name: "electronics", slug: "electronics" },
      { name: "home", slug: "home" },
    ]);
  });

  it("partitions category products without duplication", async () => {
    const response = await request(app)
      .get("/api/categories/electronics/products")
      .expect(200);

    expect(response.body.data.topRated.map((product: Product) => product.id)).toEqual([
      1, 6,
    ]);
    expect(
      response.body.data.additional.map((product: Product) => product.id),
    ).toEqual([4]);
  });

  it("returns 404 for an unknown category", async () => {
    const response = await request(app)
      .get("/api/categories/unknown/products")
      .expect(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  it("searches title, description, and category case-insensitively", async () => {
    const title = await request(app).get("/api/products?q=HEADPHONES").expect(200);
    const description = await request(app).get("/api/products?q=product%206").expect(200);
    const category = await request(app).get("/api/products?q=electronics").expect(200);

    expect(title.body.data.map((product: Product) => product.id)).toEqual([1]);
    expect(description.body.data.map((product: Product) => product.id)).toEqual([6]);
    expect(category.body.data.map((product: Product) => product.id)).toEqual([
      1, 4, 6,
    ]);
    expect(category.body.meta).toEqual({ query: "electronics", total: 3 });
  });

  it("rejects missing and invalid search terms", async () => {
    await request(app).get("/api/products").expect(400);
    await request(app).get("/api/products?q=%20").expect(400);
  });

  it("returns a product and handles invalid or missing product IDs", async () => {
    const response = await request(app).get("/api/products/2").expect(200);
    expect(response.body.data.id).toBe(2);
    await request(app).get("/api/products/not-a-number").expect(400);
    await request(app).get("/api/products/999").expect(404);
  });

  it("validates enquiry input before sending mail", async () => {
    const response = await request(app)
      .post("/api/enquiries")
      .send({ productId: 1, name: "", email: "bad", message: "" })
      .expect(400);

    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(email.send).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON with a structured validation error", async () => {
    const response = await request(app)
      .post("/api/enquiries")
      .set("content-type", "application/json")
      .send('{"productId":')
      .expect(400);

    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(email.send).not.toHaveBeenCalled();
  });

  it("rejects an enquiry for an unknown product", async () => {
    const response = await request(app)
      .post("/api/enquiries")
      .send(validEnquiry(999))
      .expect(400);

    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(email.send).not.toHaveBeenCalled();
  });

  it("sends a plain-text sales enquiry and returns thank-you only after success", async () => {
    const response = await request(app)
      .post("/api/enquiries")
      .send(validEnquiry(1))
      .expect(200);

    expect(email.send).toHaveBeenCalledOnce();
    expect(email.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "sales@example.test",
        from: "catalogue@example.test",
        replyTo: "customer@example.test",
        subject: expect.stringContaining("Wireless Headphones"),
        text: expect.stringContaining("Please call me about this product."),
      }),
    );
    expect(response.body.data.message).toMatch(/^Thank you/);
  });

  it("returns 503 without a thank-you when email delivery fails", async () => {
    email.send.mockRejectedValueOnce(new Error("SMTP unavailable"));
    const response = await request(app)
      .post("/api/enquiries")
      .send(validEnquiry(1))
      .expect(503);

    expect(response.body.error.code).toBe("EMAIL_DELIVERY_FAILED");
    expect(response.body).not.toHaveProperty("data");
  });
});

function validEnquiry(productId: number) {
  return {
    productId,
    name: "Test Customer",
    email: "customer@example.test",
    phone: "+44 7700 900123",
    message: "Please call me about this product.",
  };
}

