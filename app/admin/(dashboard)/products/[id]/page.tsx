import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/services/admin-auth";
import { getCategories } from "@/lib/services/categories";
import { getTags, getAllergens } from "@/lib/services/taxonomy";
import { getProductByIdForAdmin } from "@/lib/services/products";
import { ProductForm } from "@/components/admin/product-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Editar plato — Panel administrativo" };

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getAdminSession();
  const product = await getProductByIdForAdmin(id);
  if (!product || product.restaurant_id !== session!.restaurantId) notFound();

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
      <h1 className="font-heading text-2xl font-bold sm:text-3xl">{product.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Los cambios se reflejan automáticamente en el menú público al guardar.
      </p>
      <div className="mt-6">
        <ProductForm
          mode="edit"
          product={product}
          categories={categories}
          tags={tags}
          allergens={allergens}
          images={product.images}
        />
      </div>
    </div>
  );
}
