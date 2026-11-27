import type { Product } from "../domain/catalogue.js";

export const EXPECTED_FEATURED_PRODUCT_COUNT = 5;

export function assertFeaturedProducts(
  configuredIds: readonly number[],
  products: readonly Product[],
): Product[] {
  if (
    configuredIds.length !== EXPECTED_FEATURED_PRODUCT_COUNT ||
    new Set(configuredIds).size !== EXPECTED_FEATURED_PRODUCT_COUNT
  ) {
    throw new Error("Featured configuration must contain exactly five unique IDs.");
  }

  const byId = new Map(products.map((product) => [product.id, product]));
  const configuredProducts = configuredIds.map((id) => byId.get(id));
  const missingIds = configuredIds.filter(
    (id, index) => configuredProducts[index] === undefined,
  );

  if (missingIds.length > 0) {
    throw new Error(`Unknown featured product IDs: ${missingIds.join(", ")}.`);
  }

  return configuredProducts.filter(
    (product): product is Product => product !== undefined,
  );
}

