import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { AsyncContent } from "../components/AsyncContent.js";
import { EnquiryModal } from "../components/EnquiryModal.js";
import { useApi } from "../hooks/use-api.js";

export function ProductPage() {
  const { id = "" } = useParams();
  const productId = Number(id);
  const result = useApi(
    async () => {
      if (!Number.isInteger(productId) || productId <= 0) {
        throw new Error("This product link is invalid.");
      }
      return api.getProduct(productId);
    },
    [productId],
  );
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const closeEnquiry = useCallback(() => setEnquiryOpen(false), []);

  return (
    <section className="section shell">
      <Link className="back-link" to="/">← Back to catalogue</Link>
      <AsyncContent {...result}>
        {(product) => (
          <div className="product-detail">
            <div className="product-detail__image-wrap">
              <img src={product.image} alt={product.title} className="product-detail__image" />
            </div>
            <div className="product-detail__content">
              <p className="eyebrow">{product.category}</p>
              <h1>{product.title}</h1>
              <p className="product-detail__rating">
                <span aria-hidden="true">★</span> {product.rating.rate} / 5
                <span> from {product.rating.count} ratings</span>
              </p>
              <p className="product-detail__price">${product.price.toFixed(2)}</p>
              <p className="product-detail__description">{product.description}</p>
              <button className="button" type="button" onClick={() => setEnquiryOpen(true)}>
                Enquire
              </button>
            </div>
            {enquiryOpen && (
              <EnquiryModal
                product={product}
                onClose={closeEnquiry}
              />
            )}
          </div>
        )}
      </AsyncContent>
    </section>
  );
}

