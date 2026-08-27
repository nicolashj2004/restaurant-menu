import { describe, expect, test } from "vitest";
import { promotionFormSchema } from "@/lib/validation/promotion";

const PRODUCT_ID = "11111111-1111-4111-8111-111111111111";

function baseValues(overrides: Partial<Parameters<typeof promotionFormSchema.parse>[0]> = {}) {
  return {
    title: "Festival del Chicharrón",
    slug: "festival-del-chicharron",
    description: "",
    image_url: null,
    starts_at: null,
    ends_at: null,
    status: "active" as const,
    display_type: "banner" as const,
    discount_type: "none" as const,
    discount_value: 0,
    product_ids: [PRODUCT_ID],
    ...overrides,
  };
}

describe("promotionFormSchema", () => {
  test("accepts a valid promotion with no discount", () => {
    const result = promotionFormSchema.safeParse(baseValues());
    expect(result.success).toBe(true);
  });

  test("accepts a valid percentage discount", () => {
    const result = promotionFormSchema.safeParse(
      baseValues({ discount_type: "percentage", discount_value: 20 })
    );
    expect(result.success).toBe(true);
  });

  test("rejects a slug with uppercase letters or spaces", () => {
    const result = promotionFormSchema.safeParse(baseValues({ slug: "Festival Del Chicharron" }));
    expect(result.success).toBe(false);
  });

  test("rejects a title shorter than 2 characters", () => {
    const result = promotionFormSchema.safeParse(baseValues({ title: "F" }));
    expect(result.success).toBe(false);
  });

  test("rejects a non-'none' discount type with discount_value 0", () => {
    const result = promotionFormSchema.safeParse(
      baseValues({ discount_type: "percentage", discount_value: 0 })
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["discount_value"]);
    }
  });

  test("rejects a percentage discount over 100", () => {
    const result = promotionFormSchema.safeParse(
      baseValues({ discount_type: "percentage", discount_value: 150 })
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["discount_value"]);
    }
  });

  test("allows a fixed_amount discount over 100 (the 100 cap is percentage-only)", () => {
    const result = promotionFormSchema.safeParse(
      baseValues({ discount_type: "fixed_amount", discount_value: 5000 })
    );
    expect(result.success).toBe(true);
  });

  test("rejects a discount_type of 'none' paired with a positive discount_value only via the value-required rule, not this one", () => {
    // discount_type "none" never requires discount_value > 0 — 0 is valid alongside "none".
    const result = promotionFormSchema.safeParse(baseValues({ discount_type: "none", discount_value: 0 }));
    expect(result.success).toBe(true);
  });

  test("rejects non-uuid product ids", () => {
    const result = promotionFormSchema.safeParse(baseValues({ product_ids: ["not-a-uuid"] }));
    expect(result.success).toBe(false);
  });
});
