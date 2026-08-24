"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Category, Restaurant, RestaurantSettings } from "@/lib/types/domain";
import type { PromotionWithProducts } from "@/lib/types/domain";
import type { ProductWithRelations } from "@/lib/types/domain";
import { formatCurrency, getOrCreateSessionId } from "@/lib/menu-utils";
import { trackEvent } from "@/lib/actions/analytics";
import type { AnalyticsEventType } from "@/lib/types/database";

interface MenuData {
  restaurant: Restaurant;
  settings: RestaurantSettings | null;
  categories: Category[];
  products: ProductWithRelations[];
  promotions: PromotionWithProducts[];
}

interface MenuContextValue extends MenuData {
  sessionId: string;
  formatPrice: (amount: number) => string;
  track: (eventType: AnalyticsEventType, opts?: { categoryId?: string; productId?: string }) => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

const MenuContext = createContext<MenuContextValue | null>(null);

const FAVORITES_KEY = "menu_favorites";

export function RestaurantProvider({
  data,
  children,
}: {
  data: MenuData;
  children: React.ReactNode;
}) {
  const [sessionId, setSessionId] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const hasLoggedOpen = useRef(false);

  useEffect(() => {
    // One-time hydration from browser-only storage (crypto.randomUUID/localStorage
    // aren't available during SSR), not a reaction to reactive state.
    const id = getOrCreateSessionId();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionId(id);
    try {
      const stored = window.localStorage.getItem(FAVORITES_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {
      // ignore malformed localStorage state
    }
  }, []);

  useEffect(() => {
    if (!sessionId || hasLoggedOpen.current) return;
    const flagKey = `menu_open_logged_${data.restaurant.id}`;
    if (window.sessionStorage.getItem(flagKey)) return;
    window.sessionStorage.setItem(flagKey, "1");
    hasLoggedOpen.current = true;
    trackEvent({ restaurantId: data.restaurant.id, eventType: "menu_open", sessionId });
  }, [sessionId, data.restaurant.id]);

  const value = useMemo<MenuContextValue>(
    () => ({
      ...data,
      sessionId,
      formatPrice: (amount: number) =>
        formatCurrency(amount, data.settings?.currency ?? "COP", data.settings?.locale ?? "es"),
      track: (eventType, opts) => {
        // Resolved fresh (not from `sessionId` state) so this works even on the very
        // first render of a page that fires its own view-tracking effect before this
        // provider's own mount effect has had a chance to populate session state.
        const currentSessionId = getOrCreateSessionId();
        trackEvent({
          restaurantId: data.restaurant.id,
          eventType,
          sessionId: currentSessionId,
          categoryId: opts?.categoryId,
          productId: opts?.productId,
        });
      },
      favorites,
      toggleFavorite: (productId: string) => {
        setFavorites((prev) => {
          const next = prev.includes(productId)
            ? prev.filter((id) => id !== productId)
            : [...prev, productId];
          try {
            window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
          } catch {
            // storage unavailable (private mode) — favorites just won't persist
          }
          return next;
        });
      },
      isFavorite: (productId: string) => favorites.includes(productId),
    }),
    [data, sessionId, favorites]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu debe usarse dentro de RestaurantProvider");
  return ctx;
}
