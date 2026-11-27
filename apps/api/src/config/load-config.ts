import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import type { ApiConfig, FeaturedProductsConfig } from "../config.js";

const envSchema = z.object({
  API_PORT: z.coerce.number().int().positive().max(65_535).default(3000),
  WEB_ORIGIN: z.url().default("http://localhost:5173"),
  FAKE_STORE_API_URL: z.url().default("https://fakestoreapi.com"),
  FAKE_STORE_TIMEOUT_MS: z.coerce.number().int().positive().max(30_000).default(5000),
  FEATURED_PRODUCTS_FILE: z
    .string()
    .min(1)
    .optional(),
  SMTP_HOST: z.string().min(1).default("mailpit"),
  SMTP_PORT: z.coerce.number().int().positive().max(65_535).default(1025),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  SMTP_FROM: z.email().default("catalogue@example.test"),
  SALES_INBOX: z.email().default("sales@example.test"),
});

const featuredSchema = z.object({
  productIds: z.array(z.number().int().positive()).length(5),
}).superRefine((value, context) => {
  if (new Set(value.productIds).size !== 5) {
    context.addIssue({
      code: "custom",
      path: ["productIds"],
      message: "Featured product IDs must be unique.",
    });
  }
});

export function loadApiConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    throw new Error(`Invalid API configuration: ${z.prettifyError(result.error)}`);
  }

  const parsed = result.data;
  return {
    port: parsed.API_PORT,
    webOrigin: parsed.WEB_ORIGIN,
    productProvider: {
      baseUrl: parsed.FAKE_STORE_API_URL,
      timeoutMs: parsed.FAKE_STORE_TIMEOUT_MS,
    },
    featuredProductsFile:
      parsed.FEATURED_PRODUCTS_FILE === undefined
        ? fileURLToPath(new URL("../../config/featured-products.json", import.meta.url))
        : resolve(parsed.FEATURED_PRODUCTS_FILE),
    email: {
      host: parsed.SMTP_HOST,
      port: parsed.SMTP_PORT,
      secure: parsed.SMTP_SECURE,
      from: parsed.SMTP_FROM,
      salesInbox: parsed.SALES_INBOX,
    },
  };
}

export async function loadFeaturedProductsConfig(
  filePath: string,
): Promise<FeaturedProductsConfig> {
  let content: string;
  try {
    content = await readFile(filePath, "utf8");
  } catch (cause) {
    throw new Error(`Unable to read featured products configuration at ${filePath}.`, {
      cause,
    });
  }

  let json: unknown;
  try {
    json = JSON.parse(content);
  } catch (cause) {
    throw new Error(`Invalid JSON in featured products configuration at ${filePath}.`, {
      cause,
    });
  }

  const result = featuredSchema.safeParse(json);
  if (!result.success) {
    throw new Error(
      `Invalid featured products configuration: ${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

