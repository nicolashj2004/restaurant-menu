import { describe, expect, test } from "vitest";
import { productFormSchema, productOptionSchema } from "@/lib/validation/product";

const CATEGORY_ID = "22222222-2222-4222-8222-222222222222";
const TAG_ID = "33333333-3333-4333-8333-333333333333";

function baseValues(overrides: Partial<Parameters<typeof productFormSchema.parse>[0]> = {}) {
  return {
    name: "Volcán de Chocolate",
    slug: "volcan-de-chocolate",
    short_description: "Bizcocho tibio con centro líquido",
    description: "",
    price: 18000,
    category_id: CATEGORY_ID,
    status: "published" as const,
    is_available: true,
    is_featured: false,
    is_new: false,
    is_bestseller: false,
    is_chef_recommendation: false,
    spice_level: 0,
    ingredients: ["Chocolate", "Harina"],
    tag_ids: [TAG_ID],
    allergen_ids: [],
    options: [],
    ...overrides,
  };
}

describe("productFormSchema", () => {
  test("accepts a valid product", () => {
    expect(productFormSchema.safeParse(baseValues()).success).toBe(true);
  });

  test("rejects a negative price", () => {
    expect(productFormSchema.safeParse(baseValues({ price: -100 })).success).toBe(false);
  });

  test("rejects a spice_level outside 0-3", () => {
    expect(productFormSchema.safeParse(baseValues({ spice_level: 4 })).success).toBe(false);
    expect(productFormSchema.safeParse(baseValues({ spice_level: -1 })).success).toBe(false);
  });

  test("allows a null category_id (uncategorized product)", () => {
    expect(productFormSchema.safeParse(baseValues({ category_id: null })).success).toBe(true);
  });

  test("rejects a short_description over 160 characters", () => {
    expect(
      productFormSchema.safeParse(baseValues({ short_description: "x".repeat(161) })).success
    ).toBe(false);
  });

  test("rejects a slug with underscores or uppercase letters", () => {
    expect(productFormSchema.safeParse(baseValues({ slug: "Volcan_De_Chocolate" })).success).toBe(false);
  });
});

describe("productOptionSchema", () => {
  test("accepts a valid option group with at least one value", () => {
    const result = productOptionSchema.safeParse({
      name: "Tamaño",
      selection_type: "single",
      is_required: true,
      values: [{ label: "Grande", price_delta: 3000, is_default: false }],
    });
    expect(result.success).toBe(true);
  });

  test("rejects an option group with no values", () => {
    const result = productOptionSchema.safeParse({
      name: "Tamaño",
      selection_type: "single",
      is_required: true,
      values: [],
    });
    expect(result.success).toBe(false);
  });

  test("rejects a negative price_delta", () => {
    const result = productOptionSchema.safeParse({
      name: "Tamaño",
      selection_type: "multiple",
      is_required: false,
      values: [{ label: "Grande", price_delta: -500, is_default: false }],
    });
    expect(result.success).toBe(false);
  });
});
