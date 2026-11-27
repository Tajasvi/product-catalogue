import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="section shell empty-state">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The page you requested is not in this catalogue.</p>
      <Link className="button" to="/">Return home</Link>
    </section>
  );
}

