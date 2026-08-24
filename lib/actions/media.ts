"use server";

import { getAdminSession } from "@/lib/services/admin-auth";
import { uploadRestaurantImage } from "@/lib/services/media";

export async function uploadRestaurantImageAction(
  folder: "branding" | "promotions" | "categories",
  formData: FormData
): Promise<string> {
  const session = await getAdminSession();
  if (!session) throw new Error("No autorizado");
  const file = formData.get("file") as File;
  if (!file || file.size === 0) throw new Error("Archivo inválido");
  return uploadRestaurantImage(session.restaurantId, folder, file);
}
