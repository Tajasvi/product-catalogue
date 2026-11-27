import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { AsyncContent } from "../components/AsyncContent.js";
import { ProductGrid } from "../components/ProductGrid.js";
import { useApi } from "../hooks/use-api.js";

export function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const result = useApi(
    () => api.searchProducts(query),
    [query],
  );

  return (
    <section className="section shell">
      <header className="page-heading">
        <p className="eyebrow">Catalogue search</p>
        <h1>{query ? `Results for “${query}”` : "Search the catalogue"}</h1>
        <p>Matching product titles, descriptions, and categories.</p>
      </header>
      {!query ? (
        <div className="state-card">
          Enter a term in the search bar above to begin.
        </div>
      ) : (
        <AsyncContent {...result} loadingLabel="Searching products…">
          {({ products }) => (
            <>
              <p className="results-count">
                {products.length} {products.length === 1 ? "product" : "products"} found
              </p>
              <ProductGrid
                products={products}
                emptyMessage={`No products matched “${query}”.`}
                action={<Link className="button button--secondary" to="/">Browse featured products</Link>}
              />
            </>
          )}
        </AsyncContent>
      )}
    </section>
  );
}

