"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/services/admin-auth";
import { createPromotion, deletePromotion, updatePromotion } from "@/lib/services/promotions";
import { promotionFormSchema } from "@/lib/validation/promotion";

async function requireSession() {
  const session = await getAdminSession();
  if (!session) throw new Error("No autorizado");
  return session;
}

function parsePromotionForm(formData: FormData) {
  return promotionFormSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    image_url: formData.get("image_url") || null,
    starts_at: formData.get("starts_at") || null,
    ends_at: formData.get("ends_at") || null,
    status: formData.get("status"),
    display_type: formData.get("display_type"),
    product_ids: JSON.parse(String(formData.get("product_ids") ?? "[]")),
  });
}

export async function createPromotionAction(formData: FormData) {
  const session = await requireSession();
  const values = parsePromotionForm(formData);
  await createPromotion(
    {
      restaurant_id: session.restaurantId,
      title: values.title,
      description: values.description,
      image_url: values.image_url ?? null,
      starts_at: values.starts_at ?? null,
      ends_at: values.ends_at ?? null,
      status: values.status,
      display_type: values.display_type,
    },
    values.product_ids
  );
  revalidatePath("/admin/promotions");
  revalidatePath("/menu");
  redirect("/admin/promotions");
}

export async function updatePromotionAction(promotionId: string, formData: FormData) {
  const values = parsePromotionForm(formData);
  await requireSession();
  await updatePromotion(
    promotionId,
    {
      title: values.title,
      description: values.description,
      image_url: values.image_url ?? null,
      starts_at: values.starts_at ?? null,
      ends_at: values.ends_at ?? null,
      status: values.status,
      display_type: values.display_type,
    },
    values.product_ids
  );
  revalidatePath("/admin/promotions");
  revalidatePath("/menu");
}

export async function deletePromotionAction(promotionId: string) {
  await requireSession();
  await deletePromotion(promotionId);
  revalidatePath("/admin/promotions");
  revalidatePath("/menu");
}
