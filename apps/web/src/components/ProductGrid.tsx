import type { ReactNode } from "react";
import type { Product } from "../types.js";
import { ProductCard } from "./ProductCard.js";

export function ProductGrid({
  products,
  emptyMessage = "No products found.",
  action,
}: {
  products: Product[];
  emptyMessage?: string;
  action?: ReactNode;
}) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <p>{emptyMessage}</p>
        {action}
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard product={product} key={product.id} />
      ))}
    </div>
  );
}

