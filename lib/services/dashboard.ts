import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  outOfStockProducts: number;
  featuredProducts: number;
  totalCategories: number;
  activeCategories: number;
  recentlyUpdated: { id: string; name: string; slug: string; updated_at: string }[];
}

export async function getDashboardStats(restaurantId: string): Promise<DashboardStats> {
  const supabase = await createClient();

  const [
    { count: totalProducts },
    { count: publishedProducts },
    { count: outOfStockProducts },
    { count: featuredProducts },
    { count: totalCategories },
    { count: activeCategories },
    { data: recentlyUpdated },
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("restaurant_id", restaurantId),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .eq("status", "published"),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .eq("is_available", false),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .eq("is_featured", true),
    supabase.from("categories").select("id", { count: "exact", head: true }).eq("restaurant_id", restaurantId),
    supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true),
    supabase
      .from("products")
      .select("id, name, slug, updated_at")
      .eq("restaurant_id", restaurantId)
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  return {
    totalProducts: totalProducts ?? 0,
    publishedProducts: publishedProducts ?? 0,
    outOfStockProducts: outOfStockProducts ?? 0,
    featuredProducts: featuredProducts ?? 0,
    totalCategories: totalCategories ?? 0,
    activeCategories: activeCategories ?? 0,
    recentlyUpdated: recentlyUpdated ?? [],
  };
}
