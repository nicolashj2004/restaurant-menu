"use client";

import { useEffect } from "react";
import { useMenu } from "@/components/menu/restaurant-provider";
import { CategoryNav } from "@/components/menu/category-nav";
import { FiltersBar } from "@/components/menu/filters-bar";
import { ProductCard } from "@/components/menu/product-card";
import { useProductFilters } from "@/lib/hooks/use-product-filters";
import { groupByParent } from "@/lib/menu-utils";

export function CategoryView({ categorySlug }: { categorySlug: string }) {
  const { categories, products, formatPrice, track } = useMenu();
  const category = categories.find((c) => c.slug === categorySlug);
  const { childrenOf } = groupByParent(categories);
  const children = category && category.parent_id === null ? childrenOf(category.id) : [];
  const categoryProducts = products.filter((p) => p.category_id === category?.id);
  const { filtered, activeFilter, setActiveFilter, priceRange, setPriceRange, maxPrice } =
    useProductFilters(categoryProducts);

  useEffect(() => {
    if (category) track("view_category", { categoryId: category.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category?.id]);

  if (!category) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Esta categoría ya no está disponible.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl pb-8">
      <div className="px-4 pt-4 sm:px-0">
        <CategoryNav />
      </div>

      <div className="px-4 py-5 sm:px-0">
        <h1 className="font-category text-4xl">
          {category.icon} {category.name}
        </h1>
        {category.description && <p className="mt-1 text-muted-foreground">{category.description}</p>}
      </div>

      <FiltersBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        maxPrice={maxPrice}
        formatPrice={formatPrice}
      />

      {filtered.length === 0 && children.length === 0 ? (
        <p className="px-4 py-16 text-center text-muted-foreground sm:px-0">
          No hay platos que coincidan con estos filtros.
        </p>
      ) : (
        <>
          {filtered.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:px-0 lg:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {children.length > 0 && (
            <div className="mt-10 space-y-8">
              {children.map((child) => {
                const childItems = products.filter((p) => p.category_id === child.id);
                if (childItems.length === 0) return null;
                return (
                  <div key={child.id} id={child.slug} className="pl-4 sm:pl-6">
                    <h3 className="mb-3 px-4 font-category text-2xl sm:px-0">
                      {child.icon} {child.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:px-0 lg:grid-cols-4">
                      {childItems.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
