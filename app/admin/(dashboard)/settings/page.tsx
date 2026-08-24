import type { Metadata } from "next";
import { getAdminSession } from "@/lib/services/admin-auth";
import { getRestaurantSettings } from "@/lib/services/restaurant";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = { title: "Configuración — Panel administrativo" };

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  const supabase = await createClient();
  const [{ data: restaurant }, settings] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", session!.restaurantId).single(),
    getRestaurantSettings(session!.restaurantId),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-2xl font-bold sm:text-3xl">Configuración del restaurante</h1>
      <p className="text-sm text-muted-foreground">
        Personaliza cómo se ve tu menú. Los cambios se aplican de inmediato.
      </p>
      <div className="mt-6">
        <SettingsForm restaurant={restaurant!} settings={settings} />
      </div>
    </div>
  );
}
