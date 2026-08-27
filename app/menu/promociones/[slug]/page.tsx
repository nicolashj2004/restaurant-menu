import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentRestaurant } from "@/lib/services/restaurant";
import { getActivePromotions } from "@/lib/services/promotions";
import { PromotionView } from "@/components/menu/promotion-view";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getCurrentRestaurant();
  if (!restaurant) return {};
  const promotions = await getActivePromotions(restaurant.id);
  const promo = promotions.find((p) => p.slug === slug);
  if (!promo) return {};
  return {
    title: `${promo.title} — ${restaurant.name}`,
    description: promo.description ?? undefined,
  };
}

export default async function PromotionPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await getCurrentRestaurant();
  if (!restaurant) notFound();
  const promotions = await getActivePromotions(restaurant.id);
  if (!promotions.some((p) => p.slug === slug)) notFound();

  return <PromotionView slug={slug} />;
}
