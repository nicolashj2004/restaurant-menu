import type { MetadataRoute } from "next";
import { getCurrentRestaurant } from "@/lib/services/restaurant";
import { getCategories } from "@/lib/services/categories";
import { getPublishedProducts } from "@/lib/services/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const restaurant = await getCurrentRestaurant();
  if (!restaurant) return [{ url: `${base}/menu`, changeFrequency: "daily", priority: 1 }];

  const [categories, products] = await Promise.all([
    getCategories(restaurant.id, { activeOnly: true }),
    getPublishedProducts(restaurant.id),
  ]);

  return [
    { url: `${base}/menu`, changeFrequency: "daily", priority: 1 },
    ...categories.map((c) => ({
      url: `${base}/menu/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${base}/menu/${p.category?.slug ?? ""}/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
