import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminSession } from "@/lib/services/admin-auth";
import { getCategories } from "@/lib/services/categories";
import { getTags, getAllergens } from "@/lib/services/taxonomy";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Nuevo plato — Panel administrativo" };

export default async function NewProductPage() {
  const session = await getAdminSession();
  const [categories, tags, allergens] = await Promise.all([
    getCategories(session!.restaurantId),
    getTags(session!.restaurantId),
    getAllergens(session!.restaurantId),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Volver a productos
      </Link>
      <h1 className="font-heading text-2xl font-bold sm:text-3xl">Crear plato</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Completa la información principal. Podrás agregar fotos, ingredientes y opciones después de guardar.
      </p>
      <div className="mt-6">
        <ProductForm mode="create" categories={categories} tags={tags} allergens={allergens} />
      </div>
    </div>
  );
}
