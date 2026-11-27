// @ts-expect-error Node.js type declarations are not included in this package's TypeScript config.
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  loadApiConfig,
  loadFeaturedProductsConfig,
} from "../src/config/load-config.js";
import { assertFeaturedProducts } from "../src/contracts/featured-products.js";
import { sampleProducts } from "./fixtures.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  const { rm } = await import("node:fs/promises");
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("configuration", () => {
  it("loads local defaults and validates the five selected products", async () => {
    const config = loadApiConfig({});
    expect(config.port).toBe(3000);
    expect(config.email.host).toBe("mailpit");
    expect(config.featuredProductsFile).toMatch(/featured-products\.json$/);

    const featured = await loadFeaturedProductsConfig(config.featuredProductsFile);
    expect(featured.productIds).toEqual([1, 2, 3, 4, 5]);
    expect(
      assertFeaturedProducts(featured.productIds, sampleProducts()).map(
        ({ id }) => id,
      ),
    ).toEqual([1, 2, 3, 4, 5]);
  });

  it("rejects duplicate featured IDs", async () => {
    const file = await fixtureFile({ productIds: [1, 2, 3, 4, 4] });
    await expect(loadFeaturedProductsConfig(file)).rejects.toThrow(
      /must be unique/i,
    );
  });

  it("rejects featured IDs that do not exist upstream", () => {
    expect(() =>
      assertFeaturedProducts([1, 2, 3, 4, 999], sampleProducts()),
    ).toThrow(/Unknown featured product IDs: 999/);
  });

  it("rejects malformed feature configuration", async () => {
    const file = await fixtureFile("{not-json", true);
    await expect(loadFeaturedProductsConfig(file)).rejects.toThrow(
      /Invalid JSON/,
    );
  });
});

async function fixtureFile(content: unknown, raw = false): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "catalogue-config-"));
  temporaryDirectories.push(directory);
  const path = join(directory, "featured.json");
  await writeFile(path, raw ? String(content) : JSON.stringify(content));
  return path;
}

