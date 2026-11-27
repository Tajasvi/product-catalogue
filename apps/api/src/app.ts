import express, { type Express } from "express";
import cors from "cors";
import type { ApiConfig } from "./config.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import type { EmailSender } from "./ports/email-sender.js";
import type { ProductProvider } from "./ports/product-provider.js";
import { createApiRouter } from "./routes/api.js";
import { CatalogueService } from "./services/catalogue-service.js";
import { EnquiryService } from "./services/enquiry-service.js";

export interface AppDependencies {
  productProvider: ProductProvider;
  emailSender: EmailSender;
  featuredProductIds: readonly number[];
}

export function createApp(config: ApiConfig, dependencies: AppDependencies): Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({ origin: config.webOrigin }));
  app.use(express.json({ limit: "16kb" }));

  const catalogue = new CatalogueService(
    dependencies.productProvider,
    dependencies.featuredProductIds,
  );
  const enquiries = new EnquiryService(
    dependencies.productProvider,
    dependencies.emailSender,
    config.email,
  );

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });
  app.use("/api", createApiRouter(catalogue, enquiries));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

