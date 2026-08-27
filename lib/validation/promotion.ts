import { z } from "zod";

export const promotionFormSchema = z
  .object({
    title: z.string().min(2, "El título es obligatorio").max(120),
    slug: z
      .string()
      .min(2, "El slug debe tener al menos 2 caracteres")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa solo minúsculas, números y guiones"),
    description: z.string().max(500),
    image_url: z.string().nullable(),
    starts_at: z.string().nullable(),
    ends_at: z.string().nullable(),
    status: z.enum(["draft", "active", "expired"]),
    display_type: z.enum(["banner", "carousel", "popup", "card"]),
    discount_type: z.enum(["none", "percentage", "fixed_amount"]),
    discount_value: z.number().min(0),
    product_ids: z.array(z.string().uuid()),
  })
  .refine(
    (v) => v.discount_type === "none" || v.discount_value > 0,
    { message: "Ingresa un valor de descuento mayor a 0", path: ["discount_value"] }
  )
  .refine(
    (v) => v.discount_type !== "percentage" || v.discount_value <= 100,
    { message: "Un porcentaje no puede ser mayor a 100", path: ["discount_value"] }
  );

export type PromotionFormValues = z.infer<typeof promotionFormSchema>;
