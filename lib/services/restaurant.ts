import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Restaurant, RestaurantSettings } from "@/lib/types/domain";
import type { TablesUpdate } from "@/lib/types/database";

/**
 * Resolves the "current" restaurant for the public menu.
 * Today there is a single tenant selected via NEXT_PUBLIC_DEFAULT_RESTAURANT_SLUG.
 * Swapping this for a param (e.g. from /r/[slug]) is the only change needed to go multi-tenant.
 */
export const getCurrentRestaurant = cache(async (): Promise<Restaurant | null> => {
  const slug = process.env.NEXT_PUBLIC_DEFAULT_RESTAURANT_SLUG;
  if (!slug) return null;
  return getRestaurantBySlug(slug);
});

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("restaurants").select("*").eq("slug", slug).maybeSingle();
  return data;
}

export const getRestaurantSettings = cache(
  async (restaurantId: string): Promise<RestaurantSettings | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("restaurant_settings")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .maybeSingle();
    return data as unknown as RestaurantSettings | null;
  }
);

export async function updateRestaurantSettings(
  restaurantId: string,
  patch: Partial<RestaurantSettings>
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_settings")
    .update(patch as unknown as TablesUpdate<"restaurant_settings">)
    .eq("restaurant_id", restaurantId);
  if (error) throw error;
}

export async function updateRestaurant(restaurantId: string, patch: Partial<Restaurant>) {
  const supabase = await createClient();
  const { error } = await supabase.from("restaurants").update(patch).eq("id", restaurantId);
  if (error) throw error;
}

export { isRestaurantOpenNow, todaysHoursLabel } from "@/lib/menu-utils";
