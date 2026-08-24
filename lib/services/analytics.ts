import { createClient } from "@/lib/supabase/server";
import type { AnalyticsEventType } from "@/lib/types/database";

export async function logAnalyticsEvent(input: {
  restaurant_id: string;
  event_type: AnalyticsEventType;
  session_id: string;
  category_id?: string | null;
  product_id?: string | null;
}): Promise<void> {
  const supabase = await createClient();
  await supabase.from("analytics_events").insert(input);
}

export interface AnalyticsSummary {
  totalMenuOpens: number;
  totalProductViews: number;
  topProducts: { productId: string; name: string; views: number }[];
  topCategories: { categoryId: string; name: string; views: number; percentage: number }[];
}

export async function getAnalyticsSummary(
  restaurantId: string,
  sinceDays = 30
): Promise<AnalyticsSummary> {
  const supabase = await createClient();
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: events, error } = await supabase
    .from("analytics_events")
    .select("event_type, product_id, category_id")
    .eq("restaurant_id", restaurantId)
    .gte("created_at", since);
  if (error) throw error;

  const rows = events ?? [];
  const totalMenuOpens = rows.filter((e) => e.event_type === "menu_open").length;
  const productViewRows = rows.filter((e) => e.event_type === "view_product" && e.product_id);
  const categoryViewRows = rows.filter((e) => e.event_type === "view_category" && e.category_id);

  const productCounts = new Map<string, number>();
  for (const row of productViewRows) {
    productCounts.set(row.product_id!, (productCounts.get(row.product_id!) ?? 0) + 1);
  }
  const categoryCounts = new Map<string, number>();
  for (const row of categoryViewRows) {
    categoryCounts.set(row.category_id!, (categoryCounts.get(row.category_id!) ?? 0) + 1);
  }

  const topProductIds = [...productCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  const topCategoryIds = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  const [{ data: products }, { data: categories }] = await Promise.all([
    topProductIds.length
      ? supabase.from("products").select("id, name").in("id", topProductIds.map(([id]) => id))
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    topCategoryIds.length
      ? supabase.from("categories").select("id, name").in("id", topCategoryIds.map(([id]) => id))
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const totalCategoryViews = categoryViewRows.length || 1;

  return {
    totalMenuOpens,
    totalProductViews: productViewRows.length,
    topProducts: topProductIds.map(([productId, views]) => ({
      productId,
      name: products?.find((p) => p.id === productId)?.name ?? "Producto eliminado",
      views,
    })),
    topCategories: topCategoryIds.map(([categoryId, views]) => ({
      categoryId,
      name: categories?.find((c) => c.id === categoryId)?.name ?? "Categoría eliminada",
      views,
      percentage: Math.round((views / totalCategoryViews) * 100),
    })),
  };
}
