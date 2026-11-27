import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { AsyncContent } from "../components/AsyncContent.js";
import { ProductGrid } from "../components/ProductGrid.js";
import { useApi } from "../hooks/use-api.js";

export function CategoryPage() {
  const { slug = "" } = useParams();
  const result = useApi(() => api.getCategoryProducts(slug), [slug]);

  return (
    <section className="section shell">
      <Link className="back-link" to="/">← All featured products</Link>
      <AsyncContent {...result}>
        {(categoryProducts) => (
          <>
            <header className="page-heading">
              <p className="eyebrow">Category</p>
              <h1>{categoryProducts.category.name}</h1>
              <p>Top-rated selections first, followed by the full category range.</p>
            </header>
            <section aria-labelledby="top-rated-heading">
              <h2 id="top-rated-heading">Top rated</h2>
              <ProductGrid
                products={categoryProducts.topRated}
                emptyMessage="There are no rated products in this category."
              />
            </section>
            <section className="section" aria-labelledby="additional-heading">
              <h2 id="additional-heading">More in this category</h2>
              <ProductGrid
                products={categoryProducts.additional}
                emptyMessage="There are no additional products in this category."
              />
            </section>
          </>
        )}
      </AsyncContent>
    </section>
  );
}

