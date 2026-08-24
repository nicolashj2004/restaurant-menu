"use client";

import { SectionHeading } from "@/components/menu/section-heading";
import { HorizontalCarousel } from "@/components/menu/horizontal-carousel";
import { ProductCard } from "@/components/menu/product-card";
import type { ProductWithRelations } from "@/lib/types/domain";

export function RelatedProducts({
  title,
  icon,
  products,
}: {
  title: string;
  icon?: string;
  products: ProductWithRelations[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="py-6">
      <SectionHeading icon={icon} title={title} />
      <HorizontalCarousel itemClassName="w-[62%] sm:w-[260px]">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </HorizontalCarousel>
    </section>
  );
}
