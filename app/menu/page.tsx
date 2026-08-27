import type { Metadata } from "next";
import { getCurrentRestaurant, getRestaurantSettings } from "@/lib/services/restaurant";
import { Hero } from "@/components/menu/hero";
import { CategoryNav } from "@/components/menu/category-nav";
import { FeaturedCarousel } from "@/components/menu/featured-carousel";
import { ChefRecommendation } from "@/components/menu/chef-recommendation";
import { PromotionsBanner } from "@/components/menu/promotions-banner";
import { MenuByCategory } from "@/components/menu/menu-by-category";

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
      <Hero />
      <div className="mx-auto max-w-5xl">
        {/* No wrapper div around CategoryNav — position: sticky is bounded by the height
            of its *immediate* parent, and a div that only wraps this one short element
            has no room for it to stick within, so it would just scroll away with the
            page. This outer div (which spans the whole page's content) is the parent
            it needs. */}
        <CategoryNav className="mt-4" />
        <FeaturedCarousel />
        <ChefRecommendation />
        <PromotionsBanner />
        <MenuByCategory />
      </div>
    </div>
  );
}
