import { applyDiscount, type ProductDiscount } from "@/lib/menu-utils";

/**
 * Renders a product's price, or — when it's part of an active discounted
 * promotion — the original price struck through next to the discounted price.
 * Uses `em` units so it inherits whatever font size the caller wraps it in.
 */
export function PriceDisplay({
  price,
  discount,
  formatPrice,
}: {
  price: number;
  discount: ProductDiscount | null;
  formatPrice: (amount: number) => string;
}) {
  if (!discount) {
    return <span className="text-[color:var(--restaurant-accent)]">{formatPrice(price)}</span>;
  }

  const finalPrice = applyDiscount(price, discount);

  return (
    <span className="inline-flex flex-wrap items-baseline gap-1.5">
      <span className="text-[0.7em] text-muted-foreground line-through">{formatPrice(price)}</span>
      <span className="text-[1.05em] font-extrabold text-rose-600 dark:text-rose-400">
        {formatPrice(finalPrice)}
      </span>
      {discount.type === "percentage" && (
        <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
          -{discount.value}%
        </span>
      )}
    </span>
  );
}
