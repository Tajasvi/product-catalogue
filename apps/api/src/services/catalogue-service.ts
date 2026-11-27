import type { Category, CategoryProducts, Product } from "../domain/catalogue.js";
import { AppError } from "../errors/app-error.js";
import type { ProductProvider } from "../ports/product-provider.js";
import { assertFeaturedProducts } from "../contracts/featured-products.js";

export function categorySlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export class CatalogueService {
  constructor(
    private readonly provider: ProductProvider,
    private readonly featuredProductIds: readonly number[],
  ) {}

  async getFeatured(): Promise<Product[]> {
    return assertFeaturedProducts(this.featuredProductIds, await this.provider.getProducts());
  }

  async getCategories(): Promise<Category[]> {
    const names = [...new Set((await this.provider.getProducts()).map(({ category }) => category))];
    return names.sort((left, right) => left.localeCompare(right)).map((name) => ({
      name,
      slug: categorySlug(name),
    }));
  }

  async getCategoryProducts(slug: string): Promise<CategoryProducts> {
    const categories = await this.getCategories();
    const category = categories.find((candidate) => candidate.slug === slug);
    if (!category) {
      throw new AppError(404, "NOT_FOUND", "Category not found.");
    }

    const products = (await this.provider.getProductsByCategory(category.name)).sort(
      compareProducts,
    );
    const leader = products[0];
    if (!leader) {
      return { category, topRated: [], additional: [] };
    }

    const topRated = products.filter(
      ({ rating }) =>
        rating.rate === leader.rating.rate && rating.count === leader.rating.count,
    );
    const topRatedIds = new Set(topRated.map(({ id }) => id));

    return {
      category,
      topRated,
      additional: products.filter(({ id }) => !topRatedIds.has(id)),
    };
  }

  async search(term: string): Promise<Product[]> {
    const query = term.trim().toLocaleLowerCase();
    if (!query) {
      throw new AppError(400, "VALIDATION_ERROR", "Enter a search term.");
    }
    return (await this.provider.getProducts()).filter((product) =>
      [product.title, product.description, product.category].some((value) =>
        value.toLocaleLowerCase().includes(query),
      ),
    );
  }

  async getProduct(id: number): Promise<Product> {
    const product = await this.provider.getProduct(id);
    if (!product) {
      throw new AppError(404, "NOT_FOUND", "Product not found.");
    }
    return product;
  }
}

function compareProducts(left: Product, right: Product): number {
  return (
    right.rating.rate - left.rating.rate ||
    right.rating.count - left.rating.count ||
    left.id - right.id
  );
}

