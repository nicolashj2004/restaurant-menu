"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ProductWithRelations } from "@/lib/types/domain";
import { useMenu } from "@/components/menu/restaurant-provider";
import { FavoriteButton } from "@/components/menu/favorite-button";
import { ProductBadges } from "@/components/menu/product-badges";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: ProductWithRelations;
  priority?: boolean;
  className?: string;
}) {
  const { formatPrice, track } = useMenu();
  const primaryImage = product.images.find((i) => i.is_primary) ?? product.images[0];
  const href = `/menu/${product.category?.slug ?? "producto"}/${product.slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileTap={{ scale: 0.98 }}
      className={cn("group h-full", className)}
    >
      <Link
        href={href}
        onClick={() => track("click_product", { productId: product.id, categoryId: product.category_id ?? undefined })}
        className="flex h-full flex-col overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border/60 transition-shadow hover:shadow-lg"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text ?? product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 320px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              Sin foto
            </div>
          )}

          {!product.is_available && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55">
              <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold tracking-wide text-neutral-900">
                Agotado
              </span>
            </div>
          )}

          <ProductBadges
            tags={product.tags}
            spiceLevel={product.spice_level}
            className="absolute left-2.5 top-2.5 max-w-[80%]"
          />

          <FavoriteButton productId={product.id} size="sm" className="absolute right-2.5 top-2.5" />
        </div>

        <div className="flex flex-1 flex-col gap-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading text-base font-semibold leading-snug text-balance">
              {product.name}
            </h3>
          </div>
          {product.short_description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{product.short_description}</p>
          )}
          <div className="mt-auto pt-2 text-base font-semibold text-[color:var(--restaurant-accent)]">
            {formatPrice(product.price)}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
