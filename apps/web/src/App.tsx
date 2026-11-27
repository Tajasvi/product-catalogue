import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout.js";
import { CategoryPage } from "./pages/CategoryPage.js";
import { HomePage } from "./pages/HomePage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { ProductPage } from "./pages/ProductPage.js";
import { SearchPage } from "./pages/SearchPage.js";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="categories/:slug" element={<CategoryPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="products/:id" element={<ProductPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

