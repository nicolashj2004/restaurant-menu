import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/database";
import type { Promotion, PromotionWithProducts } from "@/lib/types/domain";

const PROMO_SELECT = `*, promotion_products(product:products(id, name, slug, price))`;

type PromoProductRef = Pick<Tables<"products">, "id" | "name" | "slug" | "price">;

interface PromotionQueryRow extends Tables<"promotions"> {
  promotion_products: ({ product: PromoProductRef | null } | null)[] | null;
}

function mapPromotion(row: PromotionQueryRow): PromotionWithProducts {
  return {
    ...row,
    products: (row.promotion_products ?? [])
      .map((l) => l?.product)
      .filter((v): v is PromoProductRef => Boolean(v)),
  } as unknown as PromotionWithProducts;
}

export async function getActivePromotions(restaurantId: string): Promise<PromotionWithProducts[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("promotions")
    .select(PROMO_SELECT)
    .eq("restaurant_id", restaurantId)
    .eq("status", "active")
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapPromotion);
}

export async function getAllPromotionsForAdmin(
  restaurantId: string
): Promise<PromotionWithProducts[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promotions")
    .select(PROMO_SELECT)
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapPromotion);
}

export interface PromotionInput {
  restaurant_id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  status: Promotion["status"];
  display_type: Promotion["display_type"];
  discount_type: Promotion["discount_type"];
  discount_value: number | null;
}

export async function createPromotion(
  input: PromotionInput,
  productIds: string[]
): Promise<Promotion> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("promotions").insert(input).select().single();
  if (error) throw error;
  if (productIds.length) {
    const { error: linkError } = await supabase
      .from("promotion_products")
      .insert(productIds.map((product_id) => ({ promotion_id: data.id, product_id })));
    if (linkError) throw linkError;
  }
  return data as unknown as Promotion;
}

export async function updatePromotion(
  id: string,
  patch: Partial<PromotionInput>,
  productIds?: string[]
): Promise<Promotion> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promotions")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;

  if (productIds) {
    const { error: deleteError } = await supabase.from("promotion_products").delete().eq("promotion_id", id);
    if (deleteError) throw deleteError;
    if (productIds.length) {
      const { error: linkError } = await supabase
        .from("promotion_products")
        .insert(productIds.map((product_id) => ({ promotion_id: id, product_id })));
      if (linkError) throw linkError;
    }
  }
  return data as unknown as Promotion;
}

export async function deletePromotion(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("promotions").delete().eq("id", id);
  if (error) throw error;
}
