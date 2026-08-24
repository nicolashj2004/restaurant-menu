import type { Metadata } from "next";
import { getAdminSession } from "@/lib/services/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { QrCodePanel } from "@/components/admin/qr-code-panel";

export const metadata: Metadata = { title: "Código QR — Panel administrativo" };

export default async function AdminQrPage() {
  const session = await getAdminSession();
  const supabase = await createClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name")
    .eq("id", session!.restaurantId)
    .single();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const menuUrl = `${siteUrl}/menu`;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold sm:text-3xl">Código QR del menú</h1>
      <p className="text-sm text-muted-foreground">
        Imprime este código y colócalo en tus mesas. Siempre apuntará a tu menú actualizado.
      </p>
      <div className="mt-6 max-w-md">
        <QrCodePanel url={menuUrl} restaurantName={restaurant?.name ?? ""} />
      </div>
    </div>
  );
}
