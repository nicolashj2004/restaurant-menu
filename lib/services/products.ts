import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/database";
import type { Product, ProductWithRelations } from "@/lib/types/domain";

const PRODUCT_RELATIONS_SELECT = `
  *,
  category:categories(id, name, slug),
  images:product_images(*),
  ingredient_links:product_ingredients(ingredient:ingredients(*)),
  tag_links:product_tags(tag:tags(*)),
  allergen_links:product_allergens(allergen:allergens(*)),
  options:product_options(*, values:option_values(*))
`;

type RawIngredient = Tables<"ingredients">;
type RawTag = Tables<"tags">;
type RawAllergen = Tables<"allergens">;
type RawImage = Tables<"product_images">;
type RawOption = Tables<"product_options"> & { values: Tables<"option_values">[] | null };

interface ProductQueryRow extends Tables<"products"> {
  category: { id: string; name: string; slug: string } | null;
  images: RawImage[] | null;
  ingredient_links: ({ ingredient: RawIngredient | null } | null)[] | null;
  tag_links: ({ tag: RawTag | null } | null)[] | null;
  allergen_links: ({ allergen: RawAllergen | null } | null)[] | null;
  options: (RawOption | null)[] | null;
}

function mapProduct(row: ProductQueryRow): ProductWithRelations {
  return {
    ...row,
    images: (row.images ?? []).sort((a, b) => a.sort_order - b.sort_order),
    ingredients: (row.ingredient_links ?? []).map((l) => l?.ingredient).filter((v): v is RawIngredient => Boolean(v)),
    tags: (row.tag_links ?? []).map((l) => l?.tag).filter((v): v is RawTag => Boolean(v)),
    allergens: (row.allergen_links ?? []).map((l) => l?.allergen).filter((v): v is RawAllergen => Boolean(v)),
    options: (row.options ?? [])
      .filter((o): o is NonNullable<typeof o> => Boolean(o))
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((o) => ({ ...o, values: (o.values ?? []).sort((a, b) => a.sort_order - b.sort_order) })),
  } as unknown as ProductWithRelations;
}

/** All published products for the public menu, fully hydrated. Cached per request. */
export const getPublishedProducts = cache(
  async (restaurantId: string): Promise<ProductWithRelations[]> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_RELATIONS_SELECT)
      .eq("restaurant_id", restaurantId)
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapProduct);
  }
);

export async function getProductBySlug(
  restaurantId: string,
  slug: string
): Promise<ProductWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_RELATIONS_SELECT)
    .eq("restaurant_id", restaurantId)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data) : null;
}

export async function getFeaturedProducts(restaurantId: string): Promise<ProductWithRelations[]> {
  const all = await getPublishedProducts(restaurantId);
  return all.filter((p) => p.is_featured);
}

export async function getChefRecommendation(
  restaurantId: string
): Promise<ProductWithRelations | null> {
  const all = await getPublishedProducts(restaurantId);
  return all.find((p) => p.is_chef_recommendation) ?? null;
}

export { getRelatedProducts, searchProducts } from "@/lib/menu-utils";

// ---------------------------------------------------------------------------
// Admin mutations (RLS enforces the caller is an admin of the target restaurant)
// ---------------------------------------------------------------------------

export async function getAllProductsForAdmin(restaurantId: string): Promise<ProductWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_RELATIONS_SELECT)
    .eq("restaurant_id", restaurantId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function getProductByIdForAdmin(id: string): Promise<ProductWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_RELATIONS_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data) : null;
}

export interface ProductInput {
  restaurant_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  price: number;
  status: Product["status"];
  is_available: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  is_chef_recommendation: boolean;
  spice_level: number;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").insert(input).select().single();
  if (error) throw error;
  return data as unknown as Product;
}

export async function updateProduct(id: string, patch: Partial<ProductInput>): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Product;
}

export async function setProductAvailability(id: string, isAvailable: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_available: isAvailable })
    .eq("id", id);
  if (error) throw error;
}

export async function archiveProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ status: "archived" }).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function duplicateProduct(id: string): Promise<Product> {
  const original = await getProductByIdForAdmin(id);
  if (!original) throw new Error("Producto no encontrado");
  const supabase = await createClient();

  const { data: copy, error } = await supabase
    .from("products")
    .insert({
      restaurant_id: original.restaurant_id,
      category_id: original.category_id,
      name: `${original.name} (copia)`,
      slug: `${original.slug}-copia-${Date.now().toString(36)}`,
      short_description: original.short_description,
      description: original.description,
      price: original.price,
      status: "draft",
      is_available: original.is_available,
      is_featured: false,
      is_new: original.is_new,
      is_bestseller: false,
      is_chef_recommendation: false,
      spice_level: original.spice_level,
      sort_order: original.sort_order,
    })
    .select()
    .single();
  if (error) throw error;

  if (original.images.length) {
    await supabase.from("product_images").insert(
      original.images.map((img) => ({
        product_id: copy.id,
        url: img.url,
        alt_text: img.alt_text,
        is_primary: img.is_primary,
        sort_order: img.sort_order,
      }))
    );
  }
  if (original.ingredients.length) {
    await supabase.from("product_ingredients").insert(
      original.ingredients.map((i) => ({ product_id: copy.id, ingredient_id: i.id }))
    );
  }
  if (original.tags.length) {
    await supabase
      .from("product_tags")
      .insert(original.tags.map((t) => ({ product_id: copy.id, tag_id: t.id })));
  }
  if (original.allergens.length) {
    await supabase
      .from("product_allergens")
      .insert(original.allergens.map((a) => ({ product_id: copy.id, allergen_id: a.id })));
  }

  return copy as unknown as Product;
}

export async function reorderProducts(orderedIds: string[]): Promise<void> {
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("products").update({ sort_order: index }).eq("id", id)
    )
  );
}

// --- tags / ingredients / allergens junction management -------------------

export async function setProductIngredients(productId: string, ingredientIds: string[]) {
  const supabase = await createClient();
  await supabase.from("product_ingredients").delete().eq("product_id", productId);
  if (ingredientIds.length) {
    await supabase
      .from("product_ingredients")
      .insert(ingredientIds.map((ingredient_id) => ({ product_id: productId, ingredient_id })));
  }
}

export async function setProductTags(productId: string, tagIds: string[]) {
  const supabase = await createClient();
  await supabase.from("product_tags").delete().eq("product_id", productId);
  if (tagIds.length) {
    await supabase.from("product_tags").insert(tagIds.map((tag_id) => ({ product_id: productId, tag_id })));
  }
}

export async function setProductAllergens(productId: string, allergenIds: string[]) {
  const supabase = await createClient();
  await supabase.from("product_allergens").delete().eq("product_id", productId);
  if (allergenIds.length) {
    await supabase
      .from("product_allergens")
      .insert(allergenIds.map((allergen_id) => ({ product_id: productId, allergen_id })));
  }
}

export async function findOrCreateIngredient(restaurantId: string, name: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("ingredients")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .ilike("name", name)
    .maybeSingle();
  if (existing) return existing;
  const { data, error } = await supabase
    .from("ingredients")
    .insert({ restaurant_id: restaurantId, name })
    .select()
    .single();
  if (error) throw error;
  return data;
}
