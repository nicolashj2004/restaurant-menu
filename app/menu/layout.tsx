import { notFound } from "next/navigation";
import { getCurrentRestaurant, getRestaurantSettings } from "@/lib/services/restaurant";
import { getCategories } from "@/lib/services/categories";
import { getPublishedProducts } from "@/lib/services/products";
import { getActivePromotions } from "@/lib/services/promotions";
import { RestaurantProvider } from "@/components/menu/restaurant-provider";
import { QuickActionsBar } from "@/components/menu/quick-actions-bar";
import { SiteFooter } from "@/components/menu/site-footer";
import { ScrollToTopButton } from "@/components/menu/scroll-to-top-button";

// Maps the Tipografía option chosen in Configuración (restaurant_settings.font_family) to
// the CSS var of a font already preloaded in app/layout.tsx. Falls back to Inter for any
// unrecognized/legacy value.
const BODY_FONT_VARS: Record<string, string> = {
  Inter: "var(--font-inter)",
  "Playfair Display": "var(--font-heading)",
  Poppins: "var(--font-poppins)",
};

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
            // Set directly (not just the --font-sans custom property) so it actually
            // recomputes font-family for this subtree instead of only being inherited
            // from whatever html/body already resolved.
            fontFamily: BODY_FONT_VARS[settings?.font_family ?? "Inter"] ?? BODY_FONT_VARS.Inter,
          } as React.CSSProperties
        }
      >
        <QuickActionsBar />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <ScrollToTopButton />
      </div>
    </RestaurantProvider>
  );
}
