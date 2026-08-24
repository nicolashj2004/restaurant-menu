import type { Metadata } from "next";
import { getAdminSession } from "@/lib/services/admin-auth";
import { getCategories } from "@/lib/services/categories";
import { CategoriesManager } from "@/components/admin/categories-manager";

export const metadata: Metadata = { title: "Categorías — Panel administrativo" };

export default async function AdminCategoriesPage() {
  const session = await getAdminSession();
  const categories = await getCategories(session!.restaurantId);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold sm:text-3xl">Categorías</h1>
      <p className="text-sm text-muted-foreground">
        Arrastra para reordenar. El orden se refleja en el menú público.
      </p>
      <div className="mt-6">
        <CategoriesManager categories={categories} />
      </div>
    </div>
  );
}
