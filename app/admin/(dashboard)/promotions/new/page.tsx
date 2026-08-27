import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminSession } from "@/lib/services/admin-auth";
import { getAllProductsForAdmin } from "@/lib/services/products";
import { getRestaurantSettings } from "@/lib/services/restaurant";
import { PromotionForm } from "@/components/admin/promotion-form";

export const metadata: Metadata = { title: "Nueva promoción — Panel administrativo" };

export default async function NewPromotionPage() {
  const session = await getAdminSession();
  const [products, settings] = await Promise.all([
    getAllProductsForAdmin(session!.restaurantId),
    getRestaurantSettings(session!.restaurantId),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/promotions" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Volver a promociones
      </Link>
      <h1 className="font-heading text-2xl font-bold sm:text-3xl">Nueva promoción</h1>
      <div className="mt-6">
        <PromotionForm
          products={products.map((p) => ({ id: p.id, name: p.name, price: p.price }))}
          currency={settings?.currency ?? "COP"}
          locale={settings?.locale ?? "es"}
        />
      </div>
    </div>
  );
}
