import { api } from "../api/client.js";
import { AsyncContent } from "../components/AsyncContent.js";
import { ProductGrid } from "../components/ProductGrid.js";
import { useApi } from "../hooks/use-api.js";

export function HomePage() {
  const products = useApi(() => api.getFeaturedProducts(), []);

  return (
    <>
      <section className="hero">
        <div className="shell hero__content">
          <p className="eyebrow">Curated essentials</p>
          <h1>Remarkable products.<br />A simpler way to enquire.</h1>
          <p className="hero__lede">
            Browse a focused selection and connect directly with the team when
            something catches your eye.
          </p>
        </div>
      </section>
      <section className="section shell" aria-labelledby="featured-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Hand-picked</p>
            <h2 id="featured-heading">Featured products</h2>
          </div>
          <p>Five selections chosen for this catalogue.</p>
        </div>
        <AsyncContent {...products}>
          {(items) => (
            <ProductGrid
              products={items}
              emptyMessage="No featured products have been configured."
            />
          )}
        </AsyncContent>
      </section>
    </>
  );
}

