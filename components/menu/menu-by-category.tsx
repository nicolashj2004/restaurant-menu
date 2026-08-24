"use client";

import { useMenu } from "@/components/menu/restaurant-provider";
import { SectionHeading } from "@/components/menu/section-heading";
import { ProductCard } from "@/components/menu/product-card";

export function MenuByCategory() {
  const { categories, products } = useMenu();

  return (
    <section className="py-6">
      <SectionHeading icon="🍽" title="Menú completo" />
      <div className="space-y-10">
        {categories.map((category) => {
          const items = products.filter((p) => p.category_id === category.id);
          if (items.length === 0) return null;
          return (
            <div key={category.id} id={category.slug}>
              <h3 className="mb-3 px-4 font-heading text-lg font-semibold sm:px-0">
                {category.icon} {category.name}
              </h3>
              <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:px-0 lg:grid-cols-4">
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
