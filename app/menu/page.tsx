import type { Metadata } from "next";
import { getCurrentRestaurant, getRestaurantSettings } from "@/lib/services/restaurant";
import { Hero } from "@/components/menu/hero";
import { CategoryGrid } from "@/components/menu/category-grid";
import { FeaturedCarousel } from "@/components/menu/featured-carousel";
import { ChefRecommendation } from "@/components/menu/chef-recommendation";
import { PromotionsBanner } from "@/components/menu/promotions-banner";

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await getCurrentRestaurant();
  if (!restaurant) return {};
  const settings = await getRestaurantSettings(restaurant.id);
  return {
    title: restaurant.name,
    description: settings?.description ?? settings?.tagline ?? undefined,
    openGraph: {
      title: restaurant.name,
      description: settings?.description ?? settings?.tagline ?? undefined,
      images: settings?.hero_image_url ? [settings.hero_image_url] : undefined,
    },
  };
}

export default function MenuHomePage() {
  return (
    <div className="pb-8">
      {/* Hero + CategoryGrid are the landing page now: pick a category, then browse it on
          its own page (CategoryView) — same as before. No more "see everything at once"
          view and no category pill nav here; the cards below are the navigation. */}
      <Hero />
      <CategoryGrid />
      <div className="mx-auto max-w-5xl">
        <FeaturedCarousel />
        <ChefRecommendation />
        <PromotionsBanner />
      </div>
    </div>
  );
}
