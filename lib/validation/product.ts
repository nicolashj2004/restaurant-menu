import { z } from "zod";

export const optionValueSchema = z.object({
  label: z.string().min(1, "El nombre de la opción es obligatorio"),
  price_delta: z.number().min(0, "El precio adicional no puede ser negativo"),
  is_default: z.boolean(),
});

export const productOptionSchema = z.object({
  name: z.string().min(1, "El nombre del grupo es obligatorio"),
  selection_type: z.enum(["single", "multiple"]),
  is_required: z.boolean(),
  values: z.array(optionValueSchema).min(1, "Agrega al menos una opción"),
});

export const productFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(120),
  slug: z
    .string()
    .min(2, "El slug debe tener al menos 2 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa solo minúsculas, números y guiones"),
  short_description: z.string().max(160, "Máximo 160 caracteres"),
  description: z.string().max(2000),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  category_id: z.string().uuid().nullable(),
  status: z.enum(["draft", "published", "archived"]),
  is_available: z.boolean(),
  is_featured: z.boolean(),
  is_new: z.boolean(),
  is_bestseller: z.boolean(),
  is_chef_recommendation: z.boolean(),
  spice_level: z.number().int().min(0).max(3),
  ingredients: z.array(z.string().min(1)),
  tag_ids: z.array(z.string().uuid()),
  allergen_ids: z.array(z.string().uuid()),
  options: z.array(productOptionSchema),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
