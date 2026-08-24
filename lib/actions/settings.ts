"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/services/admin-auth";
import { updateRestaurant, updateRestaurantSettings } from "@/lib/services/restaurant";
import { restaurantSettingsFormSchema } from "@/lib/validation/settings";
import type { ActionResult } from "@/lib/actions/auth";

export async function updateSettingsAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { error: "No autorizado" };

  let values;
  try {
    values = restaurantSettingsFormSchema.parse({
      name: formData.get("name"),
      tagline: formData.get("tagline") ?? "",
      description: formData.get("description") ?? "",
      logo_url: formData.get("logo_url") || null,
      favicon_url: formData.get("favicon_url") || null,
      hero_image_url: formData.get("hero_image_url") || null,
      primary_color: formData.get("primary_color"),
      accent_color: formData.get("accent_color"),
      font_family: formData.get("font_family"),
      theme_default: formData.get("theme_default"),
      instagram_url: formData.get("instagram_url") ?? "",
      whatsapp_number: formData.get("whatsapp_number") ?? "",
      address: formData.get("address") ?? "",
      google_maps_url: formData.get("google_maps_url") ?? "",
      currency: formData.get("currency"),
      locale: formData.get("locale"),
      opening_hours: JSON.parse(String(formData.get("opening_hours") ?? "{}")),
    });
  } catch {
    return { error: "Revisa los campos del formulario, algunos valores no son válidos." };
  }

  try {
    await updateRestaurant(session.restaurantId, { name: values.name });
    await updateRestaurantSettings(session.restaurantId, {
      tagline: values.tagline,
      description: values.description,
      logo_url: values.logo_url ?? null,
      favicon_url: values.favicon_url ?? null,
      hero_image_url: values.hero_image_url ?? null,
      primary_color: values.primary_color,
      accent_color: values.accent_color,
      font_family: values.font_family,
      theme_default: values.theme_default,
      instagram_url: values.instagram_url || null,
      whatsapp_number: values.whatsapp_number,
      address: values.address,
      google_maps_url: values.google_maps_url || null,
      currency: values.currency,
      locale: values.locale,
      opening_hours: values.opening_hours,
    });
  } catch {
    return { error: "No se pudo guardar la configuración. Intenta de nuevo." };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/menu");
  return {};
}
