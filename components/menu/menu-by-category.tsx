"use client";

import { useMenu } from "@/components/menu/restaurant-provider";
import { SectionHeading } from "@/components/menu/section-heading";
import { ProductCard } from "@/components/menu/product-card";
import { FiltersBar } from "@/components/menu/filters-bar";
import { useProductFilters } from "@/lib/hooks/use-product-filters";
import { groupByParent } from "@/lib/menu-utils";
import type { ProductWithRelations } from "@/lib/types/domain";

function ProductGrid({ products }: { products: ProductWithRelations[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:px-0 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export function MenuByCategory() {
  const { categories, products, formatPrice } = useMenu();
  const { topLevel, childrenOf } = groupByParent(categories);
  const { filtered, activeFilter, setActiveFilter, priceRange, setPriceRange, maxPrice } =
    useProductFilters(products);

  return (
    <section className="py-6">
      <SectionHeading icon="🍽" title="Menú completo" />
      <FiltersBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        maxPrice={maxPrice}
        formatPrice={formatPrice}
      />
      {filtered.length === 0 ? (
        <p className="px-4 py-16 text-center text-muted-foreground sm:px-0">
          No hay platos que coincidan con estos filtros.
        </p>
      ) : (
        <div className="mt-6 space-y-10">
          {topLevel.map((category) => {
            const directItems = filtered.filter((p) => p.category_id === category.id);
            const childSections = childrenOf(category.id)
              .map((child) => ({ child, items: filtered.filter((p) => p.category_id === child.id) }))
              .filter(({ items }) => items.length > 0);
            if (directItems.length === 0 && childSections.length === 0) return null;
            return (
              <div key={category.id} id={category.slug}>
                <h3 className="mb-3 px-4 font-category text-2xl sm:px-0">
                  {category.icon} {category.name}
                </h3>
                {directItems.length > 0 && <ProductGrid products={directItems} />}
                {childSections.map(({ child, items }) => (
                  <div key={child.id} id={child.slug} className="mt-6 pl-4 sm:pl-6">
                    <h4 className="mb-3 px-4 font-category text-xl sm:px-0">
                      {child.icon} {child.name}
                    </h4>
                    <ProductGrid products={items} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
