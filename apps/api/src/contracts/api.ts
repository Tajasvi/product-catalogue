import type {
  Category,
  CategoryProducts,
  Product,
} from "../domain/catalogue.js";
import type { EnquiryReceipt } from "../domain/enquiry.js";

export interface ApiEnvelope<T> {
  data: T;
  meta?: {
    query: string;
    total: number;
  };
}

export interface ApiValidationDetail {
  field: string;
  message: string;
}

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "PRODUCT_PROVIDER_FAILED"
  | "EMAIL_DELIVERY_FAILED"
  | "INTERNAL_ERROR";

export interface ApiError {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: ApiValidationDetail[];
  };
}

export type FeaturedProductsResponse = ApiEnvelope<Product[]>;
export type CategoriesResponse = ApiEnvelope<Category[]>;
export type CategoryProductsResponse = ApiEnvelope<CategoryProducts>;
export type SearchProductsResponse = ApiEnvelope<Product[]>;
export type ProductResponse = ApiEnvelope<Product>;
export type EnquiryResponse = ApiEnvelope<EnquiryReceipt>;

