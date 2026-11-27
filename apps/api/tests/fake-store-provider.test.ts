import { describe, expect, it, vi } from "vitest";
import { FakeStoreProvider } from "../src/providers/fake-store-provider.js";
import { AppError } from "../src/errors/app-error.js";
import { sampleProducts } from "./fixtures.js";

describe("FakeStoreProvider", () => {
  it("normalizes products through the provider contract", async () => {
    const fetcher = vi.fn(async () =>
      Response.json(sampleProducts()),
    ) as unknown as typeof fetch;
    const provider = new FakeStoreProvider("https://store.test", 1000, fetcher);

    await expect(provider.getProducts()).resolves.toHaveLength(6);
    expect(fetcher).toHaveBeenCalledWith(
      "https://store.test/products",
      expect.objectContaining({ headers: { accept: "application/json" } }),
    );
  });

  it("returns null for an absent product", async () => {
    const fetcher = vi.fn(async () =>
      new Response(null, { status: 404 }),
    ) as unknown as typeof fetch;
    const provider = new FakeStoreProvider("https://store.test", 1000, fetcher);

    await expect(provider.getProduct(999)).resolves.toBeNull();
  });

  it("maps upstream failures to an explicit provider error", async () => {
    const fetcher = vi.fn(async () => {
      throw new Error("network unavailable");
    }) as unknown as typeof fetch;
    const provider = new FakeStoreProvider("https://store.test", 1000, fetcher);

    await expect(provider.getProducts()).rejects.toMatchObject<AppError>({
      status: 502,
      code: "PRODUCT_PROVIDER_FAILED",
    });
  });

  it("rejects malformed product data", async () => {
    const fetcher = vi.fn(async () =>
      Response.json([{ id: "wrong" }]),
    ) as unknown as typeof fetch;
    const provider = new FakeStoreProvider("https://store.test", 1000, fetcher);

    await expect(provider.getProducts()).rejects.toMatchObject<AppError>({
      status: 502,
      code: "PRODUCT_PROVIDER_FAILED",
    });
  });
});

