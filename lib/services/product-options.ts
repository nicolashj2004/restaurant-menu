import { createClient } from "@/lib/supabase/server";
import type { OptionValue, ProductOption } from "@/lib/types/domain";

export interface OptionInput {
  name: string;
  selection_type: ProductOption["selection_type"];
  is_required: boolean;
  values: { label: string; price_delta: number; is_default: boolean }[];
}

/** Replaces all options/values for a product in one shot — simplest mental model for the admin UI. */
export async function replaceProductOptions(productId: string, options: OptionInput[]): Promise<void> {
  const supabase = await createClient();

  await supabase.from("product_options").delete().eq("product_id", productId);

  for (let i = 0; i < options.length; i++) {
    const opt = options[i];
    const { data: created, error } = await supabase
      .from("product_options")
      .insert({
        product_id: productId,
        name: opt.name,
        selection_type: opt.selection_type,
        is_required: opt.is_required,
        sort_order: i,
      })
      .select()
      .single();
    if (error) throw error;

    if (opt.values.length) {
      const { error: valuesError } = await supabase.from("option_values").insert(
        opt.values.map((v, j) => ({
          option_id: created.id,
          label: v.label,
          price_delta: v.price_delta,
          is_default: v.is_default,
          sort_order: j,
        }))
      );
      if (valuesError) throw valuesError;
    }
  }
}

export type { ProductOption, OptionValue };
