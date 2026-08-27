import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/services/admin-auth";
import { getAllProductsForAdmin } from "@/lib/services/products";
import { getAllPromotionsForAdmin } from "@/lib/services/promotions";
import { getRestaurantSettings } from "@/lib/services/restaurant";
import { PromotionForm } from "@/components/admin/promotion-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Editar promoción — Panel administrativo" };

export default async function EditPromotionPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getAdminSession();
  const [promotions, products, settings] = await Promise.all([
    getAllPromotionsForAdmin(session!.restaurantId),
    getAllProductsForAdmin(session!.restaurantId),
    getRestaurantSettings(session!.restaurantId),
  ]);
  const promotion = promotions.find((p) => p.id === id);
  if (!promotion) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/promotions" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Volver a promociones
      </Link>
      <h1 className="font-heading text-2xl font-bold sm:text-3xl">{promotion.title}</h1>
      <div className="mt-6">
        <PromotionForm
          promotion={promotion}
          products={products.map((p) => ({ id: p.id, name: p.name, price: p.price }))}
          currency={settings?.currency ?? "COP"}
          locale={settings?.locale ?? "es"}
        />
      </div>
    </div>
  );
}
