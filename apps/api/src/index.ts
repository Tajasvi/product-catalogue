import "dotenv/config";
import { createApp } from "./app.js";
import { loadApiConfig, loadFeaturedProductsConfig } from "./config/load-config.js";
import { FakeStoreProvider } from "./providers/fake-store-provider.js";
import { SmtpEmailSender } from "./providers/smtp-email-sender.js";
import { assertFeaturedProducts } from "./contracts/featured-products.js";

const config = loadApiConfig();

try {
  const featuredConfig = await loadFeaturedProductsConfig(config.featuredProductsFile);
  const products = new FakeStoreProvider(
    config.productProvider.baseUrl,
    config.productProvider.timeoutMs,
  );
  assertFeaturedProducts(
    featuredConfig.productIds,
    await products.getProducts(),
  );

  const app = createApp(config, {
    productProvider: products,
    emailSender: new SmtpEmailSender(config.email),
    featuredProductIds: featuredConfig.productIds,
  });

  app.listen(config.port, () => {
    console.info(`Product catalogue API listening on port ${config.port}.`);
  });
} catch (error) {
  console.error(
    "Unable to start the product catalogue API:",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
}

