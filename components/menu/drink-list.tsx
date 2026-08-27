"use client";

import Link from "next/link";
import Image from "next/image";
import type { ProductWithRelations } from "@/lib/types/domain";
import { useMenu } from "@/components/menu/restaurant-provider";
import { FavoriteButton } from "@/components/menu/favorite-button";
import { PriceDisplay } from "@/components/menu/price-display";
import { getActiveDiscount } from "@/lib/menu-utils";

/**
 * Numbered list layout for drinks (photo + name + description + price), used instead of
 * the regular card grid on the "Bebidas" category and its subcategories — organization
 * inspired by a classic cocktail-menu poster, adapted to the real product data.
 */
export function DrinkList({ products, startNumber = 1 }: { products: ProductWithRelations[]; startNumber?: number }) {
  const { formatPrice, track, promotions } = useMenu();

  return (
    <div className="grid gap-3 px-4 sm:grid-cols-2 sm:gap-x-6 sm:px-0">
      {products.map((product, i) => {
        const primaryImage = product.images.find((img) => img.is_primary) ?? product.images[0];
        const href = `/menu/${product.category?.slug ?? "producto"}/${product.slug}`;
        const discount = getActiveDiscount(product.id, promotions);

        return (
          <Link
            key={product.id}
            href={href}
            onClick={() => track("click_product", { productId: product.id, categoryId: product.category_id ?? undefined })}
            className="group flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-muted"
          >
            <span className="font-heading w-6 shrink-0 text-lg text-muted-foreground">
              {startNumber + i}.
            </span>
            <div className="relative aspect-square size-20 shrink-0 overflow-hidden rounded-full bg-muted">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt_text ?? product.name}
                  fill
                  sizes="80px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                  Sin foto
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold tracking-wide uppercase">{product.name}</h3>
                <FavoriteButton productId={product.id} size="sm" />
              </div>
              {product.short_description && (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{product.short_description}</p>
              )}
              <div className="mt-1 text-sm font-semibold">
                <PriceDisplay price={product.price} discount={discount} formatPrice={formatPrice} />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
