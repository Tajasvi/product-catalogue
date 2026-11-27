import { Link } from "react-router-dom";
import type { Product } from "../types.js";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card__link">
        <div className="product-card__image-wrap">
          <img
            className="product-card__image"
            src={product.image}
            alt={product.title}
            loading="lazy"
          />
        </div>
        <div className="product-card__body">
          <p className="eyebrow">{product.category}</p>
          <h3>{product.title}</h3>
          <p className="product-card__rating" aria-label={`Rated ${product.rating.rate} out of 5`}>
            <span aria-hidden="true">★</span> {product.rating.rate}
            <span> ({product.rating.count})</span>
          </p>
          <p className="product-card__price">${product.price.toFixed(2)}</p>
          <span className="text-link">View details →</span>
        </div>
      </Link>
    </article>
  );
}

