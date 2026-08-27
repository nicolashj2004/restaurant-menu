import type { Tables, AdminRole, OpeningHours, ProductStatus, PromotionStatus, PromotionDisplayType, PromotionDiscountType, OptionSelectionType } from "@/lib/types/database";

export type Restaurant = Tables<"restaurants">;
export type RestaurantSettings = Omit<Tables<"restaurant_settings">, "opening_hours"> & {
  opening_hours: OpeningHours;
};
export type Category = Tables<"categories">;
export type Product = Omit<Tables<"products">, "status"> & { status: ProductStatus };
export type ProductImage = Tables<"product_images">;
export type Ingredient = Tables<"ingredients">;
export type Tag = Tables<"tags">;
export type Allergen = Tables<"allergens">;
export type ProductOption = Omit<Tables<"product_options">, "selection_type"> & {
  selection_type: OptionSelectionType;
};
export type OptionValue = Tables<"option_values">;
export type Promotion = Omit<Tables<"promotions">, "status" | "display_type" | "discount_type"> & {
  status: PromotionStatus;
  display_type: PromotionDisplayType;
  discount_type: PromotionDiscountType | null;
};
export type RestaurantAdmin = Omit<Tables<"restaurant_admins">, "role"> & { role: AdminRole };

/** Product enriched with all its related content, as returned by the menu services. */
export interface ProductWithRelations extends Product {
  category: Pick<Category, "id" | "name" | "slug"> | null;
  images: ProductImage[];
  ingredients: Ingredient[];
  tags: Tag[];
  allergens: Allergen[];
  options: (ProductOption & { values: OptionValue[] })[];
}

export interface CategoryWithProducts extends Category {
  products: ProductWithRelations[];
}

export interface PromotionWithProducts extends Promotion {
  products: Pick<Product, "id" | "name" | "slug" | "price">[];
}
