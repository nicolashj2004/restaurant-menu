import { describe, expect, test } from "vitest";
import {
  applyDiscount,
  applyQuickFilter,
  formatCurrency,
  getActiveDiscount,
  getRelatedProducts,
  groupByParent,
  isRestaurantOpenNow,
  searchProducts,
  seededShuffle,
  todaysHoursLabel,
  type ProductDiscount,
} from "@/lib/menu-utils";
import type { Category, ProductWithRelations, PromotionWithProducts, RestaurantSettings } from "@/lib/types/domain";

function makeProduct(overrides: Partial<ProductWithRelations> = {}): ProductWithRelations {
  return {
    id: "product-1",
    restaurant_id: "restaurant-1",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    name: "Producto",
    slug: "producto",
    price: 20000,
    category_id: "category-1",
    short_description: null,
    description: null,
    is_available: true,
    is_bestseller: false,
    is_chef_recommendation: false,
    is_featured: false,
    is_new: false,
    spice_level: 0,
    sort_order: 0,
    status: "published",
    category: { id: "category-1", name: "Categoría", slug: "categoria" },
    images: [],
    ingredients: [],
    tags: [],
    allergens: [],
    options: [],
    ...overrides,
  };
}

function makePromotion(overrides: Partial<PromotionWithProducts> = {}): PromotionWithProducts {
  return {
    id: "promo-1",
    restaurant_id: "restaurant-1",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    title: "Promoción",
    slug: "promocion",
    description: null,
    image_url: null,
    starts_at: null,
    ends_at: null,
    status: "active",
    display_type: "banner",
    discount_type: null,
    discount_value: null,
    products: [],
    ...overrides,
  };
}

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: "category-1",
    restaurant_id: "restaurant-1",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    name: "Categoría",
    slug: "categoria",
    description: null,
    icon: null,
    image_url: null,
    is_active: true,
    parent_id: null,
    sort_order: 0,
    ...overrides,
  };
}

describe("getActiveDiscount", () => {
  test("returns null when no promotion includes the product", () => {
    const promotions = [makePromotion({ discount_type: "percentage", discount_value: 20, products: [] })];
    expect(getActiveDiscount("product-1", promotions)).toBeNull();
  });

  test("returns null when the promotion includes the product but has no discount configured", () => {
    const promotions = [
      makePromotion({ discount_type: null, discount_value: null, products: [{ id: "product-1", name: "P", slug: "p", price: 1000 }] }),
    ];
    expect(getActiveDiscount("product-1", promotions)).toBeNull();
  });

  test("returns the discount info for the first matching promotion", () => {
    const promotions = [
      makePromotion({
        title: "20% en el festival",
        slug: "festival",
        discount_type: "percentage",
        discount_value: 20,
        products: [{ id: "product-1", name: "P", slug: "p", price: 1000 }],
      }),
    ];
    expect(getActiveDiscount("product-1", promotions)).toEqual({
      type: "percentage",
      value: 20,
      promotionTitle: "20% en el festival",
      promotionSlug: "festival",
    });
  });

  test("a product with discount_value 0 is treated as having no discount (falsy)", () => {
    const promotions = [
      makePromotion({ discount_type: "fixed_amount", discount_value: 0, products: [{ id: "product-1", name: "P", slug: "p", price: 1000 }] }),
    ];
    expect(getActiveDiscount("product-1", promotions)).toBeNull();
  });
});

describe("applyDiscount", () => {
  test("returns the price unchanged when there is no discount", () => {
    expect(applyDiscount(10000, null)).toBe(10000);
  });

  test("applies a percentage discount and rounds", () => {
    const discount: ProductDiscount = { type: "percentage", value: 20, promotionTitle: "x", promotionSlug: null };
    expect(applyDiscount(9999, discount)).toBe(7999); // 9999 * 0.8 = 7999.2 -> rounds to 7999
  });

  test("applies a fixed-amount discount", () => {
    const discount: ProductDiscount = { type: "fixed_amount", value: 3000, promotionTitle: "x", promotionSlug: null };
    expect(applyDiscount(10000, discount)).toBe(7000);
  });

  test("clamps to 0 instead of going negative", () => {
    const discount: ProductDiscount = { type: "fixed_amount", value: 50000, promotionTitle: "x", promotionSlug: null };
    expect(applyDiscount(10000, discount)).toBe(0);
  });
});

describe("groupByParent", () => {
  test("splits top-level categories from children", () => {
    const parent = makeCategory({ id: "p1", parent_id: null });
    const child1 = makeCategory({ id: "c1", parent_id: "p1" });
    const child2 = makeCategory({ id: "c2", parent_id: "p1" });
    const other = makeCategory({ id: "p2", parent_id: null });
    const { topLevel, childrenOf } = groupByParent([parent, child1, child2, other]);

    expect(topLevel.map((c) => c.id)).toEqual(["p1", "p2"]);
    expect(childrenOf("p1").map((c) => c.id)).toEqual(["c1", "c2"]);
    expect(childrenOf("p2")).toEqual([]);
  });
});

describe("seededShuffle", () => {
  test("is deterministic for the same seed", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const a = seededShuffle(items, "product-123");
    const b = seededShuffle(items, "product-123");
    expect(a).toEqual(b);
  });

  test("differs between different seeds (statistically, not a hard guarantee)", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const a = seededShuffle(items, "seed-a");
    const b = seededShuffle(items, "seed-b");
    expect(a).not.toEqual(b);
  });

  test("does not mutate the input array", () => {
    const items = [1, 2, 3];
    const original = [...items];
    seededShuffle(items, "seed");
    expect(items).toEqual(original);
  });

  test("preserves the same set of elements", () => {
    const items = [1, 2, 3, 4, 5];
    const shuffled = seededShuffle(items, "seed");
    expect([...shuffled].sort()).toEqual([...items].sort());
  });

  test("returns an equal-length empty result for an empty array", () => {
    expect(seededShuffle([], "seed")).toEqual([]);
  });
});

describe("searchProducts", () => {
  const products = [
    makeProduct({ id: "1", name: "Ceviche de camarón", short_description: "Fresco y cítrico" }),
    makeProduct({ id: "2", name: "Lomo saltado", description: "Con papas fritas" }),
    makeProduct({ id: "3", name: "Limonada", tags: [{ id: "t1", restaurant_id: "r1", name: "Vegano", slug: "vegano", icon: null }] }),
  ];

  test("returns all products for an empty/blank query", () => {
    expect(searchProducts(products, "   ")).toEqual(products);
  });

  test("matches by name, case-insensitively", () => {
    expect(searchProducts(products, "CEVICHE").map((p) => p.id)).toEqual(["1"]);
  });

  test("matches by short_description and description", () => {
    expect(searchProducts(products, "cítrico").map((p) => p.id)).toEqual(["1"]);
    expect(searchProducts(products, "papas").map((p) => p.id)).toEqual(["2"]);
  });

  test("matches by tag name", () => {
    expect(searchProducts(products, "vegano").map((p) => p.id)).toEqual(["3"]);
  });

  test("returns an empty array when nothing matches", () => {
    expect(searchProducts(products, "sushi")).toEqual([]);
  });
});

describe("getRelatedProducts", () => {
  test("excludes the viewed product and unavailable products", () => {
    const viewed = makeProduct({ id: "viewed", category_id: "cat-a" });
    const unavailable = makeProduct({ id: "unavailable", category_id: "cat-a", is_available: false });
    const other = makeProduct({ id: "other", category_id: "cat-a" });
    const result = getRelatedProducts(viewed, [viewed, unavailable, other], 6);
    expect(result.map((p) => p.id)).toEqual(["other"]);
  });

  test("round-robins across categories, prioritizing the viewed product's own category each round", () => {
    const viewed = makeProduct({ id: "viewed", category_id: "cat-a" });
    const a1 = makeProduct({ id: "a1", category_id: "cat-a" });
    const a2 = makeProduct({ id: "a2", category_id: "cat-a" });
    const b1 = makeProduct({ id: "b1", category_id: "cat-b" });
    const c1 = makeProduct({ id: "c1", category_id: "cat-c" });

    const result = getRelatedProducts(viewed, [viewed, a1, a2, b1, c1], 6);
    // Round 0: cat-a first (a1), then b1, then c1. Round 1: a2 (only cat-a has a 2nd item).
    expect(result.map((p) => p.id)).toEqual(["a1", "b1", "c1", "a2"]);
  });

  test("respects the limit", () => {
    const viewed = makeProduct({ id: "viewed", category_id: "cat-a" });
    const others = Array.from({ length: 10 }, (_, i) => makeProduct({ id: `p${i}`, category_id: "cat-a" }));
    const result = getRelatedProducts(viewed, [viewed, ...others], 3);
    expect(result).toHaveLength(3);
  });

  test("stops early instead of looping forever when fewer products exist than the limit", () => {
    const viewed = makeProduct({ id: "viewed", category_id: "cat-a" });
    const other = makeProduct({ id: "other", category_id: "cat-a" });
    const result = getRelatedProducts(viewed, [viewed, other], 6);
    expect(result.map((p) => p.id)).toEqual(["other"]);
  });
});

describe("applyQuickFilter", () => {
  const products = [
    makeProduct({ id: "veg", tags: [{ id: "t1", restaurant_id: "r1", name: "Vegetariano", slug: "vegetariano", icon: null }] }),
    makeProduct({ id: "vegan", tags: [{ id: "t2", restaurant_id: "r1", name: "Vegano", slug: "vegano", icon: null }] }),
    makeProduct({ id: "gluten", allergens: [{ id: "a1", restaurant_id: "r1", name: "Gluten", icon: null }] }),
    makeProduct({ id: "spicy", spice_level: 2 }),
    makeProduct({ id: "bestseller", is_bestseller: true }),
    makeProduct({ id: "featured", is_featured: true }),
    makeProduct({ id: "chef", is_chef_recommendation: true }),
    makeProduct({ id: "new", is_new: true }),
    makeProduct({ id: "plain" }),
  ];

  test("returns all products when the filter is null", () => {
    expect(applyQuickFilter(products, null)).toEqual(products);
  });

  test("vegetariano filters by the vegetariano tag slug", () => {
    expect(applyQuickFilter(products, "vegetariano").map((p) => p.id)).toEqual(["veg"]);
  });

  test("sin-gluten excludes products with a gluten allergen", () => {
    const result = applyQuickFilter(products, "sin-gluten");
    expect(result.map((p) => p.id)).not.toContain("gluten");
    expect(result.map((p) => p.id)).toContain("plain");
  });

  test("picante filters by spice_level > 0", () => {
    expect(applyQuickFilter(products, "picante").map((p) => p.id)).toEqual(["spicy"]);
  });

  test("recomendado matches either is_featured or is_chef_recommendation", () => {
    expect(applyQuickFilter(products, "recomendado").map((p) => p.id).sort()).toEqual(["chef", "featured"]);
  });

  test("nuevo filters by is_new", () => {
    expect(applyQuickFilter(products, "nuevo").map((p) => p.id)).toEqual(["new"]);
  });
});

describe("formatCurrency", () => {
  test("formats using the given currency and locale with no decimals", () => {
    expect(formatCurrency(25000, "COP", "es-CO")).toMatch(/25\.000/);
  });

  test("falls back to a plain '$' format when the locale/currency combination is invalid", () => {
    expect(formatCurrency(1000, "NOT_A_CURRENCY", "es-CO")).toBe("$1,000");
  });
});

describe("isRestaurantOpenNow / todaysHoursLabel", () => {
  test("isRestaurantOpenNow returns false when there are no settings", () => {
    expect(isRestaurantOpenNow(null)).toBe(false);
  });

  test("isRestaurantOpenNow returns false when today has no configured ranges", () => {
    const settings = { opening_hours: {} } as unknown as RestaurantSettings;
    expect(isRestaurantOpenNow(settings)).toBe(false);
  });

  test("isRestaurantOpenNow returns true when now falls inside today's range", () => {
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
    const today = days[new Date().getDay()];
    const settings = {
      opening_hours: { [today]: [{ open: "00:00", close: "23:59" }] },
    } as unknown as RestaurantSettings;
    expect(isRestaurantOpenNow(settings)).toBe(true);
  });

  test("isRestaurantOpenNow returns false when now falls outside today's range", () => {
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
    const today = days[new Date().getDay()];
    const now = new Date();
    const pastHour = String((now.getHours() + 1) % 24).padStart(2, "0");
    const settings = {
      opening_hours: { [today]: [{ open: pastHour, close: pastHour }] },
    } as unknown as RestaurantSettings;
    // A single-minute window in the future/past relative to "now" — only true if now happens
    // to equal that exact hour:00, which we avoid by shifting an hour forward.
    if (now.getHours() !== Number(pastHour)) {
      expect(isRestaurantOpenNow(settings)).toBe(false);
    }
  });

  test("todaysHoursLabel returns null with no settings", () => {
    expect(todaysHoursLabel(null)).toBeNull();
  });

  test("todaysHoursLabel formats today's ranges", () => {
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
    const today = days[new Date().getDay()];
    const settings = {
      opening_hours: { [today]: [{ open: "11:00", close: "22:00" }] },
    } as unknown as RestaurantSettings;
    expect(todaysHoursLabel(settings)).toBe("11:00 – 22:00");
  });
});
