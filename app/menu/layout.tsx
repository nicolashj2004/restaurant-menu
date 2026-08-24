import { notFound } from "next/navigation";
import { getCurrentRestaurant, getRestaurantSettings } from "@/lib/services/restaurant";
import { getCategories } from "@/lib/services/categories";
import { getPublishedProducts } from "@/lib/services/products";
import { getActivePromotions } from "@/lib/services/promotions";
import { RestaurantProvider } from "@/components/menu/restaurant-provider";
import { QuickActionsBar } from "@/components/menu/quick-actions-bar";
import { SiteFooter } from "@/components/menu/site-footer";

export default async function MenuLayout({ children }: { children: React.ReactNode }) {
  const restaurant = await getCurrentRestaurant();
  if (!restaurant) notFound();

  const [settings, categories, products, promotions] = await Promise.all([
    getRestaurantSettings(restaurant.id),
    getCategories(restaurant.id, { activeOnly: true }),
    getPublishedProducts(restaurant.id),
    getActivePromotions(restaurant.id),
  ]);

  return (
    <RestaurantProvider data={{ restaurant, settings, categories, products, promotions }}>
      <div
        className="flex min-h-full flex-col"
        style={
          {
            "--restaurant-primary": settings?.primary_color ?? "#171717",
            "--restaurant-accent": settings?.accent_color ?? "#d97706",
          } as React.CSSProperties
        }
      >
        <QuickActionsBar />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </RestaurantProvider>
  );
}
