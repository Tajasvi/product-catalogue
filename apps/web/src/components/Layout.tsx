import { useState, type FormEvent } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useApi } from "../hooks/use-api.js";

export function Layout() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const categories = useApi(() => api.getCategories(), []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    if (term) {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    }
  }

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <div className="shell header-row">
          <Link to="/" className="brand" aria-label="Northstar Catalogue home">
            NORTHSTAR
          </Link>
          <form className="search-form" role="search" onSubmit={submitSearch}>
            <label htmlFor="site-search" className="sr-only">Search products</label>
            <input
              id="site-search"
              type="search"
              placeholder="Search the catalogue"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              required
              minLength={1}
            />
            <button type="submit">Search</button>
          </form>
        </div>
        <nav className="category-nav" aria-label="Product categories">
          <div className="shell category-nav__links">
            <NavLink to="/" end>Featured</NavLink>
            {categories.data?.map((category) => (
              <NavLink key={category.slug} to={`/categories/${category.slug}`}>
                {category.name}
              </NavLink>
            ))}
            {categories.error && (
              <span className="category-nav__warning">Categories unavailable</span>
            )}
          </div>
        </nav>
      </header>
      <main id="main-content">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="shell">
          <strong>Northstar Catalogue</strong>
          <p>A considered selection, with a direct line to our sales team.</p>
        </div>
      </footer>
    </>
  );
}

