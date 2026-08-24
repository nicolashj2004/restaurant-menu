"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/services/admin-auth";
import {
  archiveProduct,
  createProduct,
  deleteProduct,
  duplicateProduct,
  findOrCreateIngredient,
  setProductAllergens,
  setProductAvailability,
  setProductIngredients,
  setProductTags,
  updateProduct,
} from "@/lib/services/products";
import { replaceProductOptions } from "@/lib/services/product-options";
import {
  deleteProductImage,
  reorderProductImages,
  setPrimaryProductImage,
  uploadProductImage,
} from "@/lib/services/product-images";
import { productFormSchema } from "@/lib/validation/product";

async function requireSession() {
  const session = await getAdminSession();
  if (!session) throw new Error("No autorizado");
  return session;
}

function parseProductForm(formData: FormData) {
  const raw = {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    short_description: String(formData.get("short_description") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: Number(formData.get("price") ?? 0),
    category_id: (formData.get("category_id") as string) || null,
    status: String(formData.get("status") ?? "draft"),
    is_available: formData.get("is_available") === "on",
    is_featured: formData.get("is_featured") === "on",
    is_new: formData.get("is_new") === "on",
    is_bestseller: formData.get("is_bestseller") === "on",
    is_chef_recommendation: formData.get("is_chef_recommendation") === "on",
    spice_level: Number(formData.get("spice_level") ?? 0),
    ingredients: JSON.parse(String(formData.get("ingredients") ?? "[]")),
    tag_ids: JSON.parse(String(formData.get("tag_ids") ?? "[]")),
    allergen_ids: JSON.parse(String(formData.get("allergen_ids") ?? "[]")),
    options: JSON.parse(String(formData.get("options") ?? "[]")),
  };
  return productFormSchema.parse(raw);
}

export async function createProductAction(formData: FormData) {
  const session = await requireSession();
  const values = parseProductForm(formData);

  const product = await createProduct({
    restaurant_id: session.restaurantId,
    category_id: values.category_id,
    name: values.name,
    slug: values.slug,
    short_description: values.short_description,
    description: values.description,
    price: values.price,
    status: values.status,
    is_available: values.is_available,
    is_featured: values.is_featured,
    is_new: values.is_new,
    is_bestseller: values.is_bestseller,
    is_chef_recommendation: values.is_chef_recommendation,
    spice_level: values.spice_level,
  });

  const ingredientIds = await Promise.all(
    values.ingredients.map(async (name) => (await findOrCreateIngredient(session.restaurantId, name)).id)
  );
  await setProductIngredients(product.id, ingredientIds);
  await setProductTags(product.id, values.tag_ids);
  await setProductAllergens(product.id, values.allergen_ids);
  await replaceProductOptions(product.id, values.options);

  revalidatePath("/admin/products");
  revalidatePath("/menu");
  redirect(`/admin/products/${product.id}`);
}

export async function updateProductAction(productId: string, formData: FormData) {
  const session = await requireSession();
  const values = parseProductForm(formData);

  await updateProduct(productId, {
    category_id: values.category_id,
    name: values.name,
    slug: values.slug,
    short_description: values.short_description,
    description: values.description,
    price: values.price,
    status: values.status,
    is_available: values.is_available,
    is_featured: values.is_featured,
    is_new: values.is_new,
    is_bestseller: values.is_bestseller,
    is_chef_recommendation: values.is_chef_recommendation,
    spice_level: values.spice_level,
  });

  const ingredientIds = await Promise.all(
    values.ingredients.map(async (name) => (await findOrCreateIngredient(session.restaurantId, name)).id)
  );
  await setProductIngredients(productId, ingredientIds);
  await setProductTags(productId, values.tag_ids);
  await setProductAllergens(productId, values.allergen_ids);
  await replaceProductOptions(productId, values.options);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/menu");
}

export async function toggleAvailabilityAction(productId: string, isAvailable: boolean) {
  await requireSession();
  await setProductAvailability(productId, isAvailable);
  revalidatePath("/admin/products");
  revalidatePath("/menu");
}

export async function archiveProductAction(productId: string) {
  await requireSession();
  await archiveProduct(productId);
  revalidatePath("/admin/products");
  revalidatePath("/menu");
}

export async function deleteProductAction(productId: string) {
  await requireSession();
  await deleteProduct(productId);
  revalidatePath("/admin/products");
  revalidatePath("/menu");
}

export async function duplicateProductAction(productId: string) {
  await requireSession();
  const copy = await duplicateProduct(productId);
  revalidatePath("/admin/products");
  redirect(`/admin/products/${copy.id}`);
}

export async function uploadProductImageAction(productId: string, formData: FormData) {
  const session = await requireSession();
  const file = formData.get("file") as File;
  if (!file || file.size === 0) throw new Error("Archivo inválido");
  const image = await uploadProductImage(session.restaurantId, productId, file);
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/menu");
  return image;
}

export async function deleteProductImageAction(productId: string, imageId: string) {
  await requireSession();
  await deleteProductImage(imageId);
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/menu");
}

export async function setPrimaryImageAction(productId: string, imageId: string) {
  await requireSession();
  await setPrimaryProductImage(productId, imageId);
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/menu");
}

export async function reorderProductImagesAction(productId: string, orderedImageIds: string[]) {
  await requireSession();
  await reorderProductImages(orderedImageIds);
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/menu");
}
