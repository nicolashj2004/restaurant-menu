import { createClient } from "@/lib/supabase/server";
import type { Allergen, Ingredient, Tag } from "@/lib/types/domain";

export async function getTags(restaurantId: string): Promise<Tag[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tags").select("*").eq("restaurant_id", restaurantId).order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getAllergens(restaurantId: string): Promise<Allergen[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("allergens")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getIngredients(restaurantId: string): Promise<Ingredient[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ingredients")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createTag(restaurantId: string, name: string, slug: string, icon: string | null) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .insert({ restaurant_id: restaurantId, name, slug, icon })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createAllergen(restaurantId: string, name: string, icon: string | null) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("allergens")
    .insert({ restaurant_id: restaurantId, name, icon })
    .select()
    .single();
  if (error) throw error;
  return data;
}
