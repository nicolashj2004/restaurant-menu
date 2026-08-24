import { z } from "zod";

const openingHoursDaySchema = z.array(
  z.object({ open: z.string(), close: z.string() })
);

export const openingHoursSchema = z.object({
  mon: openingHoursDaySchema.optional(),
  tue: openingHoursDaySchema.optional(),
  wed: openingHoursDaySchema.optional(),
  thu: openingHoursDaySchema.optional(),
  fri: openingHoursDaySchema.optional(),
  sat: openingHoursDaySchema.optional(),
  sun: openingHoursDaySchema.optional(),
});

export const restaurantSettingsFormSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio").max(120),
  tagline: z.string().max(160),
  description: z.string().max(1000),
  logo_url: z.string().nullable(),
  favicon_url: z.string().nullable(),
  hero_image_url: z.string().nullable(),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color hexadecimal inválido"),
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color hexadecimal inválido"),
  font_family: z.string().min(1),
  theme_default: z.enum(["light", "dark", "system"]),
  instagram_url: z.string(),
  whatsapp_number: z.string().max(20),
  address: z.string().max(300),
  google_maps_url: z.string(),
  currency: z.string().min(1).max(10),
  locale: z.string().min(2).max(10),
  opening_hours: openingHoursSchema,
});

export type RestaurantSettingsFormValues = z.infer<typeof restaurantSettingsFormSchema>;
