import { createClient } from "@/lib/supabase/server";
import type { ProductImage } from "@/lib/types/domain";

const BUCKET = "menu-images";

export async function uploadProductImage(
  restaurantId: string,
  productId: string,
  file: File
): Promise<ProductImage> {
  const supabase = await createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${restaurantId}/products/${productId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      url: publicUrl,
      alt_text: file.name.replace(/\.[^.]+$/, ""),
      is_primary: (count ?? 0) === 0,
      sort_order: count ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProductImage(imageId: string): Promise<void> {
  const supabase = await createClient();
  const { data: image } = await supabase
    .from("product_images")
    .select("*")
    .eq("id", imageId)
    .maybeSingle();
  if (!image) return;

  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) throw error;

  const path = image.url.split(`/${BUCKET}/`)[1];
  if (path) await supabase.storage.from(BUCKET).remove([path]);

  if (image.is_primary) {
    const { data: next } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", image.product_id)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (next) {
      await supabase.from("product_images").update({ is_primary: true }).eq("id", next.id);
    }
  }
}

export async function setPrimaryProductImage(productId: string, imageId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
  const { error } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId);
  if (error) throw error;
}

export async function reorderProductImages(orderedImageIds: string[]): Promise<void> {
  const supabase = await createClient();
  await Promise.all(
    orderedImageIds.map((id, index) =>
      supabase.from("product_images").update({ sort_order: index }).eq("id", id)
    )
  );
}
