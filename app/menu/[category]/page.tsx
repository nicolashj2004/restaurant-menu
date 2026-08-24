import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentRestaurant } from "@/lib/services/restaurant";
import { getCategoryBySlug } from "@/lib/services/categories";
import { CategoryView } from "@/components/menu/category-view";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const restaurant = await getCurrentRestaurant();
  if (!restaurant) return {};
  const category = await getCategoryBySlug(restaurant.id, categorySlug);
  if (!category) return {};
  return {
    title: `${category.name} — ${restaurant.name}`,
    description: category.description ?? undefined,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: categorySlug } = await params;
  const restaurant = await getCurrentRestaurant();
  if (!restaurant) notFound();
  const category = await getCategoryBySlug(restaurant.id, categorySlug);
  if (!category) notFound();

  return <CategoryView categorySlug={categorySlug} />;
}
