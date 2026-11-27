import type { Product } from "../domain/catalogue.js";

export interface ProductProvider {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | null>;
  getProductsByCategory(category: string): Promise<Product[]>;
}

