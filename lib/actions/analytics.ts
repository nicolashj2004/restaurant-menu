"use server";

import { logAnalyticsEvent } from "@/lib/services/analytics";
import type { AnalyticsEventType } from "@/lib/types/database";

export async function trackEvent(input: {
  restaurantId: string;
  eventType: AnalyticsEventType;
  sessionId: string;
  categoryId?: string | null;
  productId?: string | null;
}) {
  try {
    await logAnalyticsEvent({
      restaurant_id: input.restaurantId,
      event_type: input.eventType,
      session_id: input.sessionId,
      category_id: input.categoryId ?? null,
      product_id: input.productId ?? null,
    });
  } catch {
    // Analytics must never break the browsing experience.
  }
}
