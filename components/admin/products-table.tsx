"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { MoreHorizontal, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  archiveProductAction,
  deleteProductAction,
  duplicateProductAction,
  toggleAvailabilityAction,
} from "@/lib/actions/products";
import type { ProductWithRelations } from "@/lib/types/domain";
import { formatCurrency } from "@/lib/menu-utils";

type StatusFilter = "all" | "published" | "draft" | "archived" | "unavailable";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  published: { label: "🟢 Publicado", className: "" },
  draft: { label: "⚪ Borrador", className: "" },
  archived: { label: "🗄 Archivado", className: "" },
};

export function ProductsTable({
  products,
  currency,
  locale,
}: {
  products: ProductWithRelations[];
  currency: string;
  locale: string;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    let result = products;
    if (filter === "unavailable") result = result.filter((p) => !p.is_available);
    else if (filter !== "all") result = result.filter((p) => p.status === filter);

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.category?.name.toLowerCase().includes(q));
    }
    return result;
  }, [products, filter, query]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar producto..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="published">Publicados</TabsTrigger>
            <TabsTrigger value="draft">Borradores</TabsTrigger>
            <TabsTrigger value="unavailable">Agotados</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No hay productos que coincidan.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {filtered.map((product) => (
            <ProductRow key={product.id} product={product} currency={currency} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductRow({
  product,
  currency,
  locale,
}: {
  product: ProductWithRelations;
  currency: string;
  locale: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [available, setAvailable] = useState(product.is_available);
  const image = product.images.find((i) => i.is_primary) ?? product.images[0];
  const status = STATUS_LABEL[product.status];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 sm:flex-row sm:items-center">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
        {image ? (
          <Image src={image.url} alt={product.name} fill className="object-cover" sizes="64px" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Sin foto</div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{product.name}</p>
        <p className="truncate text-sm text-muted-foreground">
          {product.category?.name ?? "Sin categoría"} · {formatCurrency(product.price, currency, locale)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {status && <Badge variant="outline">{status.label}</Badge>}
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Switch
            checked={available}
            disabled={isPending}
            onCheckedChange={(checked) => {
              setAvailable(checked);
              startTransition(async () => {
                await toggleAvailabilityAction(product.id, checked);
                toast.success(checked ? "Marcado como disponible" : "Marcado como agotado");
              });
            }}
          />
          {available ? "Disponible" : "Agotado"}
        </label>
      </div>

      <div className="flex items-center gap-1">
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/products/${product.id}`}>Editar</Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Más acciones">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => startTransition(async () => { await duplicateProductAction(product.id); })}
            >
              Duplicar
            </DropdownMenuItem>
            {product.status !== "archived" && (
              <DropdownMenuItem
                onSelect={() =>
                  startTransition(async () => {
                    await archiveProductAction(product.id);
                    toast.success("Producto archivado");
                  })
                }
              >
                Archivar
              </DropdownMenuItem>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  Eliminar definitivamente
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Seguro que deseas eliminar este producto?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. &ldquo;{product.name}&rdquo; se eliminará permanentemente del
                    menú, junto con sus fotos y opciones. Si prefieres conservarlo oculto, usa &ldquo;Archivar&rdquo;
                    en su lugar.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      startTransition(async () => {
                        await deleteProductAction(product.id);
                        toast.success("Producto eliminado");
                      })
                    }
                  >
                    Sí, eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
