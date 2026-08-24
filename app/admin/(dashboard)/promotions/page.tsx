import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/services/admin-auth";
import { getAllPromotionsForAdmin } from "@/lib/services/promotions";
import { PromotionsList } from "@/components/admin/promotions-list";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Promociones — Panel administrativo" };

export default async function AdminPromotionsPage() {
  const session = await getAdminSession();
  const promotions = await getAllPromotionsForAdmin(session!.restaurantId);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">Promociones</h1>
          <p className="text-sm text-muted-foreground">Crea ofertas y novedades para tu menú.</p>
        </div>
        <Button asChild>
          <Link href="/admin/promotions/new">+ Nueva promoción</Link>
        </Button>
      </div>
      <div className="mt-6">
        <PromotionsList promotions={promotions} />
      </div>
    </div>
  );
}
