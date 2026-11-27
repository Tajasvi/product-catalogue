import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../App.js";
import type { Product } from "../types.js";

const product: Product = {
  id: 1,
  title: "Wireless Headphones",
  price: 79.99,
  description: "Comfortable wireless headphones for focused listening.",
  category: "electronics",
  image: "https://example.test/headphones.png",
  rating: { rate: 4.9, count: 120 },
};

describe("catalogue UI", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the shell categories and five featured products", async () => {
    stubFetch({
      "/api/categories": { data: [{ name: "Electronics", slug: "electronics" }] },
      "/api/products/featured": {
        data: Array.from({ length: 5 }, (_, index) => ({
          ...product,
          id: index + 1,
          title: `Featured ${index + 1}`,
        })),
      },
    });
    render(<App />);

    expect(await screen.findByRole("heading", { name: "Featured products" })).toBeVisible();
    expect(await screen.findAllByRole("article")).toHaveLength(5);
    expect(await screen.findByRole("link", { name: "Electronics" })).toBeVisible();
  });

  it("submits the search term and renders only returned matches", async () => {
    const requests: string[] = [];
    stubFetch(
      {
        "/api/categories": { data: [] },
        "/api/products/featured": { data: [product] },
        "/api/products?q=headphones": { data: [product] },
      },
      requests,
    );
    render(<App />);

    const user = userEvent.setup();
    await user.type(screen.getByRole("searchbox", { name: "Search products" }), "headphones");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByRole("heading", { name: "Results for “headphones”" })).toBeVisible();
    expect(await screen.findAllByRole("article")).toHaveLength(1);
    expect(requests).toContain("/api/products?q=headphones");
  });

  it("opens a product and submits a valid enquiry", async () => {
    window.history.replaceState({}, "", "/products/1");
    const requests: RequestInit[] = [];
    stubFetch(
      {
        "/api/categories": { data: [] },
        "/api/products/1": { data: product },
        "/api/enquiries": { data: { message: "Thank you." } },
      },
      undefined,
      requests,
    );
    render(<App />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "Enquire" }));
    expect(screen.getByRole("dialog", { name: `Enquire about ${product.title}` })).toBeVisible();
    await user.type(screen.getByLabelText("Name"), "Customer Name");
    await user.type(screen.getByLabelText("Email"), "customer@example.test");
    await user.type(screen.getByLabelText("Message"), "Please send more details.");
    await user.click(screen.getByRole("button", { name: "Submit enquiry" }));

    expect(await screen.findByRole("heading", { name: "Thank you." })).toBeVisible();
    const payload = JSON.parse(String(requests.at(-1)?.body));
    expect(payload).toEqual(
      expect.objectContaining({
        productId: 1,
        email: "customer@example.test",
      }),
    );
  });

  it("validates the enquiry form without submitting invalid input", async () => {
    window.history.replaceState({}, "", "/products/1");
    const requests: string[] = [];
    stubFetch(
      {
        "/api/categories": { data: [] },
        "/api/products/1": { data: product },
      },
      requests,
    );
    render(<App />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "Enquire" }));
    await user.click(screen.getByRole("button", { name: "Submit enquiry" }));

    expect(screen.getByText("Enter your name.")).toBeVisible();
    expect(screen.getByText("Enter a valid email address.")).toBeVisible();
    expect(screen.getByText("Tell us how we can help.")).toBeVisible();
    expect(requests).not.toContain("/api/enquiries");
  });

  it("keeps the form and shows an explicit server delivery failure", async () => {
    window.history.replaceState({}, "", "/products/1");
    stubFetch(
      {
        "/api/categories": { data: [] },
        "/api/products/1": { data: product },
        "/api/enquiries": {
          status: 503,
          body: {
            error: {
              code: "EMAIL_DELIVERY_FAILED",
              message: "We could not send your enquiry. Please try again.",
            },
          },
        },
      },
    );
    render(<App />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "Enquire" }));
    await user.type(screen.getByLabelText("Name"), "Customer Name");
    await user.type(screen.getByLabelText("Email"), "customer@example.test");
    await user.type(screen.getByLabelText("Message"), "Please send more details.");
    await user.click(screen.getByRole("button", { name: "Submit enquiry" }));

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("We could not send your enquiry. Please try again.");
    expect(screen.getByRole("button", { name: "Submit enquiry" })).toBeEnabled();
    expect(screen.queryByRole("heading", { name: "Thank you." })).not.toBeInTheDocument();
  });

  it("closes the enquiry modal and restores access to the product page", async () => {
    window.history.replaceState({}, "", "/products/1");
    stubFetch({
      "/api/categories": { data: [] },
      "/api/products/1": { data: product },
    });
    render(<App />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "Enquire" }));
    expect(screen.getByRole("dialog")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Close enquiry form" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enquire" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Enquire" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

type FetchFixture = Record<string, unknown | { status: number; body: unknown }>;

function stubFetch(
  fixtures: FetchFixture,
  paths?: string[],
  requests?: RequestInit[],
) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const path = String(input);
      paths?.push(path);
      requests?.push(init ?? {});
      const fixture = fixtures[path];
      if (fixture === undefined) {
        return new Response(
          JSON.stringify({ error: { code: "NOT_FOUND", message: `No fixture for ${path}` } }),
          { status: 404, headers: { "content-type": "application/json" } },
        );
      }
      if (
        typeof fixture === "object" &&
        fixture !== null &&
        "status" in fixture &&
        "body" in fixture
      ) {
        return new Response(JSON.stringify(fixture.body), {
          status: fixture.status as number,
          headers: { "content-type": "application/json" },
        });
      }
      return Response.json(fixture);
    }),
  );
}
