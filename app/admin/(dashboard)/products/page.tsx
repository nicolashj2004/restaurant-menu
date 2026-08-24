import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/services/admin-auth";
import { getAllProductsForAdmin } from "@/lib/services/products";
import { getRestaurantSettings } from "@/lib/services/restaurant";
import { ProductsTable } from "@/components/admin/products-table";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Productos — Panel administrativo" };

export default async function AdminProductsPage() {
  const session = await getAdminSession();
  const [products, settings] = await Promise.all([
    getAllProductsForAdmin(session!.restaurantId),
    getRestaurantSettings(session!.restaurantId),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">Productos</h1>
          <p className="text-sm text-muted-foreground">Gestiona todos los platos de tu menú.</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">+ Crear plato</Link>
        </Button>
      </div>

      <div className="mt-6">
        <ProductsTable
          products={products}
          currency={settings?.currency ?? "COP"}
          locale={settings?.locale ?? "es"}
        />
      </div>
    </div>
  );
}
