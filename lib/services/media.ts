import { createClient } from "@/lib/supabase/server";

const BUCKET = "menu-images";

/** Uploads a single image to a restaurant-scoped folder (branding, promotions, categories) and returns its public URL. */
export async function uploadRestaurantImage(
  restaurantId: string,
  folder: "branding" | "promotions" | "categories",
  file: File
): Promise<string> {
  const supabase = await createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${restaurantId}/${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return publicUrl;
}
