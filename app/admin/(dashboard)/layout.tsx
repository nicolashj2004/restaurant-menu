import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/services/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const supabase = await createClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name")
    .eq("id", session.restaurantId)
    .single();

  return (
    <AdminShell restaurantName={restaurant?.name ?? "Panel administrativo"} userEmail={session.email}>
      {children}
    </AdminShell>
  );
}
