"use client";

import { useMenu } from "@/components/menu/restaurant-provider";
import { SectionHeading } from "@/components/menu/section-heading";
import { HorizontalCarousel } from "@/components/menu/horizontal-carousel";
import { ProductCard } from "@/components/menu/product-card";

export function FeaturedCarousel() {
  const { products } = useMenu();
  const featured = products.filter((p) => p.is_available && (p.is_featured || p.is_bestseller));

  if (featured.length === 0) return null;

  return (
    <section className="py-6">
      <SectionHeading icon="🔥" title="Los favoritos" subtitle="Lo que más piden nuestros comensales" />
      <HorizontalCarousel>
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </HorizontalCarousel>
    </section>
  );
}
