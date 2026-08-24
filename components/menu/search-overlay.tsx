"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMenu } from "@/components/menu/restaurant-provider";
import { searchProducts } from "@/lib/menu-utils";
import { ProductCard } from "@/components/menu/product-card";

export function SearchOverlay({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { products } = useMenu();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchProducts(
      products.filter((p) => p.is_available),
      query
    );
  }, [products, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-0 flex h-dvh max-h-dvh w-full max-w-full translate-y-0 flex-col gap-0 rounded-none border-0 p-0 sm:top-[10%] sm:h-auto sm:max-h-[80vh] sm:max-w-2xl sm:translate-y-0 sm:rounded-3xl sm:border"
      >
        <DialogTitle className="sr-only">Buscar en el menú</DialogTitle>
        <div className="flex items-center gap-2 border-b p-4">
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="¿Qué quieres comer? Ej: pollo, picante, vegano..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0 text-base"
          />
          <button
            type="button"
            aria-label="Cerrar búsqueda"
            onClick={() => onOpenChange(false)}
            className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {query.trim() === "" ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Busca por nombre, ingrediente o categoría.
            </p>
          ) : results.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No encontramos platos que coincidan con &ldquo;{query}&rdquo;.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {results.map((product) => (
                <div key={product.id} onClick={() => onOpenChange(false)}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
