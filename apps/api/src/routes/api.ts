import { Router } from "express";
import { z } from "zod";
import { AppError } from "../errors/app-error.js";
import type { EnquiryInput } from "../domain/enquiry.js";
import type { CatalogueService } from "../services/catalogue-service.js";
import type { EnquiryService } from "../services/enquiry-service.js";

const idSchema = z.coerce.number().int().positive();
const enquirySchema = z.object({
  productId: z.number().int().positive(),
  name: z.string().trim().min(1).max(100),
  email: z.email(),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().min(1).max(3000),
}).strict();

export function createApiRouter(
  catalogue: CatalogueService,
  enquiries: EnquiryService,
): Router {
  const router = Router();

  router.get("/products/featured", async (_request, response) => {
    response.json({ data: await catalogue.getFeatured() });
  });

  router.get("/categories", async (_request, response) => {
    response.json({ data: await catalogue.getCategories() });
  });

  router.get("/categories/:slug/products", async (request, response) => {
    const slug = z.string().trim().min(1).max(100).parse(request.params.slug);
    response.json({ data: await catalogue.getCategoryProducts(slug) });
  });

  router.get("/products", async (request, response) => {
    const query = z.string().trim().min(1).max(200).parse(request.query.q);
    const products = await catalogue.search(query);
    response.json({
      data: products,
      meta: { query, total: products.length },
    });
  });

  router.get("/products/:id", async (request, response) => {
    const id = parseId(request.params.id);
    response.json({ data: await catalogue.getProduct(id) });
  });

  router.post("/enquiries", async (request, response) => {
    const result = enquirySchema.safeParse(request.body);
    if (!result.success) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        "The enquiry form is invalid.",
        result.error.issues.map((issue) => ({
          field: issue.path.join(".") || "body",
          message: issue.message,
        })),
      );
    }
    const input: EnquiryInput = {
      productId: result.data.productId,
      name: result.data.name,
      email: result.data.email,
      message: result.data.message,
      ...(result.data.phone === undefined ? {} : { phone: result.data.phone }),
    };
    response.json({ data: await enquiries.submit(input) });
  });

  return router;
}

function parseId(value: unknown): number {
  const result = idSchema.safeParse(value);
  if (!result.success) {
    throw new AppError(400, "VALIDATION_ERROR", "The product ID is invalid.");
  }
  return result.data;
}

