"use client";

import { useMemo, useState } from "react";
import type { OptionValue, ProductOption } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

type OptionWithValues = ProductOption & { values: OptionValue[] };

export function ProductOptions({
  options,
  basePrice,
  formatPrice,
}: {
  options: OptionWithValues[];
  basePrice: number;
  formatPrice: (amount: number) => string;
}) {
  const [selections, setSelections] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      options.map((opt) => [opt.id, opt.values.filter((v) => v.is_default).map((v) => v.id)])
    )
  );

  const total = useMemo(() => {
    let extra = 0;
    for (const opt of options) {
      const selectedIds = selections[opt.id] ?? [];
      for (const value of opt.values) {
        if (selectedIds.includes(value.id)) extra += Number(value.price_delta);
      }
    }
    return basePrice + extra;
  }, [options, selections, basePrice]);

  if (options.length === 0) return null;

  return (
    <div className="space-y-6">
      {options.map((opt) => (
        <div key={opt.id}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-heading text-base font-semibold">
              {opt.name}
              {opt.is_required && <span className="ml-1 text-sm text-muted-foreground">(obligatorio)</span>}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {opt.values.map((value) => {
              const isSelected = (selections[opt.id] ?? []).includes(value.id);
              return (
                <button
                  key={value.id}
                  type="button"
                  onClick={() =>
                    setSelections((prev) => {
                      const current = prev[opt.id] ?? [];
                      if (opt.selection_type === "single") {
                        return { ...prev, [opt.id]: [value.id] };
                      }
                      const next = current.includes(value.id)
                        ? current.filter((id) => id !== value.id)
                        : [...current, value.id];
                      return { ...prev, [opt.id]: next };
                    })
                  }
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    isSelected
                      ? "border-transparent bg-foreground text-background"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {value.label}
                  {Number(value.price_delta) > 0 && (
                    <span className="ml-1.5 text-xs opacity-75">+{formatPrice(Number(value.price_delta))}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
        <span className="text-sm font-medium text-muted-foreground">Total estimado</span>
        <span className="text-lg font-semibold">{formatPrice(total)}</span>
      </div>
    </div>
  );
}
