"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/services/admin-auth";
import { createAllergen, createTag } from "@/lib/services/taxonomy";
import { slugify } from "@/lib/slugify";

export async function createTagAction(name: string, icon: string) {
  const session = await getAdminSession();
  if (!session) throw new Error("No autorizado");
  const tag = await createTag(session.restaurantId, name, slugify(name), icon || null);
  revalidatePath("/admin/products");
  return tag;
}

export async function createAllergenAction(name: string, icon: string) {
  const session = await getAdminSession();
  if (!session) throw new Error("No autorizado");
  const allergen = await createAllergen(session.restaurantId, name, icon || null);
  revalidatePath("/admin/products");
  return allergen;
}
