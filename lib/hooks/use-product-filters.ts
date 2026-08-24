"use client";

import { useMemo, useState } from "react";
import type { ProductWithRelations } from "@/lib/types/domain";
import { applyQuickFilter, type QuickFilter } from "@/lib/menu-utils";

export function useProductFilters(products: ProductWithRelations[]) {
  const [activeFilter, setActiveFilter] = useState<QuickFilter | null>(null);
  const maxPrice = useMemo(
    () => Math.max(...products.map((p) => p.price), 0),
    [products]
  );
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);

  const filtered = useMemo(() => {
    let result = applyQuickFilter(products, activeFilter);
    if (priceRange) {
      result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    }
    return result;
  }, [products, activeFilter, priceRange]);

  return {
    filtered,
    activeFilter,
    setActiveFilter,
    priceRange: priceRange ?? [0, maxPrice],
    setPriceRange,
    maxPrice,
  };
}
