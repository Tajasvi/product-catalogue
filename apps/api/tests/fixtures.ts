import type { Product } from "../src/domain/catalogue.js";

export function product(
  id: number,
  overrides: Partial<Product> = {},
): Product {
  return {
    id,
    title: `Product ${id}`,
    price: id * 10,
    description: `Description for product ${id}`,
    category: "electronics",
    image: `https://example.test/product-${id}.png`,
    rating: { rate: 3.5, count: id * 10 },
    ...overrides,
  };
}

export function sampleProducts(): Product[] {
  return [
    product(1, {
      title: "Wireless Headphones",
      category: "electronics",
      rating: { rate: 4.9, count: 100 },
    }),
    product(2, {
      title: "Leather Wallet",
      category: "accessories",
      rating: { rate: 4.5, count: 80 },
    }),
    product(3, {
      title: "Travel Backpack",
      category: "accessories",
      rating: { rate: 4.8, count: 50 },
    }),
    product(4, {
      title: "USB Keyboard",
      category: "electronics",
      rating: { rate: 4.6, count: 60 },
    }),
    product(5, {
      title: "Desk Lamp",
      category: "home",
      rating: { rate: 4.1, count: 30 },
    }),
    product(6, {
      title: "Wired Mouse",
      category: "electronics",
      rating: { rate: 4.9, count: 100 },
    }),
  ];
}

