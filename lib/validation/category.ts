import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(60),
  slug: z
    .string()
    .min(2, "El slug debe tener al menos 2 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa solo minúsculas, números y guiones"),
  description: z.string().max(300),
  icon: z.string().max(8),
  image_url: z.string().nullable(),
  is_active: z.boolean(),
  parent_id: z.string().uuid().nullable(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
