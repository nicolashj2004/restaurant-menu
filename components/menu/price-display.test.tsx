import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { PriceDisplay } from "@/components/menu/price-display";
import type { ProductDiscount } from "@/lib/menu-utils";

// Avoids depending on locale/ICU formatting behavior — just needs to be deterministic.
const formatPrice = (n: number) => `$${n}`;

describe("PriceDisplay", () => {
  test("renders a plain price with no discount", () => {
    render(<PriceDisplay price={20000} discount={null} formatPrice={formatPrice} />);
    expect(screen.getByText("$20000")).toBeInTheDocument();
  });

  test("renders the struck-through original price alongside the discounted price", () => {
    const discount: ProductDiscount = { type: "percentage", value: 20, promotionTitle: "x", promotionSlug: null };
    render(<PriceDisplay price={20000} discount={discount} formatPrice={formatPrice} />);
    expect(screen.getByText("$20000")).toBeInTheDocument();
    expect(screen.getByText("$16000")).toBeInTheDocument();
  });

  test("shows a percentage badge for percentage discounts", () => {
    const discount: ProductDiscount = { type: "percentage", value: 20, promotionTitle: "x", promotionSlug: null };
    render(<PriceDisplay price={20000} discount={discount} formatPrice={formatPrice} />);
    expect(screen.getByText("-20%")).toBeInTheDocument();
  });

  test("does not show a percentage badge for fixed-amount discounts", () => {
    const discount: ProductDiscount = { type: "fixed_amount", value: 3000, promotionTitle: "x", promotionSlug: null };
    render(<PriceDisplay price={20000} discount={discount} formatPrice={formatPrice} />);
    expect(screen.queryByText(/^-.*%$/)).not.toBeInTheDocument();
    expect(screen.getByText("$17000")).toBeInTheDocument();
  });
});
