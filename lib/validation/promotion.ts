import { z } from "zod";

export const promotionFormSchema = z.object({
  title: z.string().min(2, "El título es obligatorio").max(120),
  description: z.string().max(500),
  image_url: z.string().nullable(),
  starts_at: z.string().nullable(),
  ends_at: z.string().nullable(),
  status: z.enum(["draft", "active", "expired"]),
  display_type: z.enum(["banner", "carousel", "popup", "card"]),
  product_ids: z.array(z.string().uuid()),
});

export type PromotionFormValues = z.infer<typeof promotionFormSchema>;
