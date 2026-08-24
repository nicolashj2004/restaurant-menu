"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/services/admin-auth";
import {
  createCategory,
  deleteCategory,
  reorderCategories,
  updateCategory,
} from "@/lib/services/categories";
import { categoryFormSchema } from "@/lib/validation/category";

async function requireSession() {
  const session = await getAdminSession();
  if (!session) throw new Error("No autorizado");
  return session;
}

function parseCategoryForm(formData: FormData) {
  return categoryFormSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? "",
    icon: formData.get("icon") ?? "",
    is_active: formData.get("is_active") === "on",
  });
}

export async function createCategoryAction(formData: FormData) {
  const session = await requireSession();
  const values = parseCategoryForm(formData);
  await createCategory({ restaurant_id: session.restaurantId, ...values });
  revalidatePath("/admin/categories");
  revalidatePath("/menu");
}

export async function updateCategoryAction(categoryId: string, formData: FormData) {
  await requireSession();
  const values = parseCategoryForm(formData);
  await updateCategory(categoryId, values);
  revalidatePath("/admin/categories");
  revalidatePath("/menu");
}

export async function deleteCategoryAction(categoryId: string) {
  await requireSession();
  await deleteCategory(categoryId);
  revalidatePath("/admin/categories");
  revalidatePath("/menu");
}

export async function reorderCategoriesAction(orderedIds: string[]) {
  await requireSession();
  await reorderCategories(orderedIds);
  revalidatePath("/admin/categories");
  revalidatePath("/menu");
}
