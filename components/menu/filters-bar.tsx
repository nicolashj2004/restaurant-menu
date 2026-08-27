"use client";

import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { QuickFilter } from "@/lib/menu-utils";

const FILTERS: { value: QuickFilter; label: string }[] = [
  { value: "recomendado", label: "⭐ Recomendados" },
  { value: "mas-vendido", label: "🔥 Más vendidos" },
  { value: "nuevo", label: "🆕 Nuevos" },
  { value: "vegetariano", label: "🌱 Vegetariano" },
  { value: "vegano", label: "🌿 Vegano" },
  { value: "sin-gluten", label: "Sin gluten" },
  { value: "picante", label: "🌶 Picante" },
];

export function FiltersBar({
  activeFilter,
  onFilterChange,
  priceRange,
  onPriceRangeChange,
  maxPrice,
  formatPrice,
  showQuickFilters = true,
}: {
  activeFilter: QuickFilter | null;
  onFilterChange: (filter: QuickFilter | null) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice: number;
  formatPrice: (amount: number) => string;
  /** Quick filter chips (Recomendados/Más vendidos/etc). Category pages hide these, keeping only the price slider. */
  showQuickFilters?: boolean;
}) {
  return (
    <div className="space-y-3 px-4 sm:px-0">
      {showQuickFilters && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => onFilterChange(null)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              activeFilter === null
                ? "border-transparent bg-foreground text-background"
                : "border-border hover:bg-muted"
            )}
          >
            Todo
          </button>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => onFilterChange(activeFilter === f.value ? null : f.value)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                activeFilter === f.value
                  ? "border-transparent bg-foreground text-background"
                  : "border-border hover:bg-muted"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {maxPrice > 0 && (
        <div className="flex items-center gap-3 pt-1">
          <span className="whitespace-nowrap text-xs text-muted-foreground">{formatPrice(priceRange[0])}</span>
          <Slider
            min={0}
            max={maxPrice}
            step={1000}
            value={priceRange}
            onValueChange={(v) => onPriceRangeChange(v as [number, number])}
            className="max-w-xs"
          />
          <span className="whitespace-nowrap text-xs text-muted-foreground">{formatPrice(priceRange[1])}</span>
        </div>
      )}
    </div>
  );
}
