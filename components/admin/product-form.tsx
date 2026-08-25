"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { groupByParent } from "@/lib/menu-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { productFormSchema, type ProductFormValues } from "@/lib/validation/product";
import { slugify } from "@/lib/slugify";
import { createProductAction, updateProductAction } from "@/lib/actions/products";
import { createTagAction, createAllergenAction } from "@/lib/actions/taxonomy";
import { ChecklistSelector } from "@/components/admin/checklist-selector";
import { IngredientInput } from "@/components/admin/ingredient-input";
import { OptionsEditor } from "@/components/admin/options-editor";
import { ImageManager } from "@/components/admin/image-manager";
import type { Allergen, Category, ProductImage, ProductWithRelations, Tag } from "@/lib/types/domain";

export function ProductForm({
  mode,
  product,
  categories,
  tags,
  allergens,
  images,
}: {
  mode: "create" | "edit";
  product?: ProductWithRelations;
  categories: Category[];
  tags: Tag[];
  allergens: Allergen[];
  images?: ProductImage[];
}) {
  const [isPending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const { topLevel: topLevelCategories, childrenOf } = groupByParent(categories);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      short_description: product?.short_description ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      category_id: product?.category_id ?? null,
      status: product?.status ?? "draft",
      is_available: product?.is_available ?? true,
      is_featured: product?.is_featured ?? false,
      is_new: product?.is_new ?? false,
      is_bestseller: product?.is_bestseller ?? false,
      is_chef_recommendation: product?.is_chef_recommendation ?? false,
      spice_level: product?.spice_level ?? 0,
      ingredients: product?.ingredients.map((i) => i.name) ?? [],
      tag_ids: product?.tags.map((t) => t.id) ?? [],
      allergen_ids: product?.allergens.map((a) => a.id) ?? [],
      options: product?.options.map((o) => ({
        name: o.name,
        selection_type: o.selection_type,
        is_required: o.is_required,
        values: o.values.map((v) => ({ label: v.label, price_delta: Number(v.price_delta), is_default: v.is_default })),
      })) ?? [],
    },
  });

  function onSubmit(values: ProductFormValues) {
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("slug", values.slug);
    formData.set("short_description", values.short_description);
    formData.set("description", values.description);
    formData.set("price", String(values.price));
    formData.set("category_id", values.category_id ?? "");
    formData.set("status", values.status);
    if (values.is_available) formData.set("is_available", "on");
    if (values.is_featured) formData.set("is_featured", "on");
    if (values.is_new) formData.set("is_new", "on");
    if (values.is_bestseller) formData.set("is_bestseller", "on");
    if (values.is_chef_recommendation) formData.set("is_chef_recommendation", "on");
    formData.set("spice_level", String(values.spice_level));
    formData.set("ingredients", JSON.stringify(values.ingredients));
    formData.set("tag_ids", JSON.stringify(values.tag_ids));
    formData.set("allergen_ids", JSON.stringify(values.allergen_ids));
    formData.set("options", JSON.stringify(values.options));

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createProductAction(formData);
        } else {
          await updateProductAction(product!.id, formData);
          toast.success("Cambios guardados");
        }
      } catch (err) {
        if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
        toast.error("No se pudo guardar el plato. Revisa los campos e intenta de nuevo.");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-24">
      <Card>
        <CardHeader>
          <CardTitle>Información principal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre del plato</Label>
              <Input
                id="name"
                {...form.register("name", {
                  onChange: (e) => {
                    if (!slugTouched) form.setValue("slug", slugify(e.target.value));
                  },
                })}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-rose-600">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">URL amigable (slug)</Label>
              <Input id="slug" {...form.register("slug", { onChange: () => setSlugTouched(true) })} />
              {form.formState.errors.slug && (
                <p className="text-xs text-rose-600">{form.formState.errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="short_description">Descripción corta</Label>
            <Input id="short_description" maxLength={160} {...form.register("short_description")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción completa</Label>
            <Textarea id="description" rows={4} {...form.register("description")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="price">Precio</Label>
              <Input id="price" type="number" min={0} step={1} {...form.register("price", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Controller
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <Select value={field.value ?? "none"} onValueChange={(v) => field.onChange(v === "none" ? null : v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sin categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin categoría</SelectItem>
                      {topLevelCategories.map((parent) => (
                        <SelectGroup key={parent.id}>
                          <SelectItem value={parent.id}>
                            {parent.icon} {parent.name}
                          </SelectItem>
                          {childrenOf(parent.id).map((child) => (
                            <SelectItem key={child.id} value={child.id} className="pl-6">
                              {child.icon} {child.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nivel de picante</Label>
              <Controller
                control={form.control}
                name="spice_level"
                render={({ field }) => (
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sin picante</SelectItem>
                      <SelectItem value="1">🌶 Suave</SelectItem>
                      <SelectItem value="2">🌶🌶 Medio</SelectItem>
                      <SelectItem value="3">🌶🌶🌶 Picante</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {mode === "edit" && product && (
        <Card>
          <CardHeader>
            <CardTitle>Fotografías</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageManager productId={product.id} initialImages={images ?? []} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Características</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {[
            { name: "is_featured" as const, label: "⭐ Recomendado" },
            { name: "is_bestseller" as const, label: "🔥 Más vendido" },
            { name: "is_new" as const, label: "🆕 Nuevo" },
            { name: "is_chef_recommendation" as const, label: "👨‍🍳 Especial del chef" },
            { name: "is_available" as const, label: "Disponible" },
          ].map((f) => (
            <Controller
              key={f.name}
              control={form.control}
              name={f.name}
              render={({ field }) => (
                <label className="flex items-center justify-between rounded-xl border px-4 py-3">
                  <span className="text-sm font-medium">{f.label}</span>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </label>
              )}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingredientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            control={form.control}
            name="ingredients"
            render={({ field }) => <IngredientInput value={field.value} onChange={field.onChange} />}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Etiquetas</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            control={form.control}
            name="tag_ids"
            render={({ field }) => (
              <ChecklistSelector
                items={tags}
                selectedIds={field.value}
                onChange={field.onChange}
                addLabel="Nueva etiqueta"
                onCreate={(name, icon) => createTagAction(name, icon)}
              />
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alérgenos</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            control={form.control}
            name="allergen_ids"
            render={({ field }) => (
              <ChecklistSelector
                items={allergens}
                selectedIds={field.value}
                onChange={field.onChange}
                addLabel="Nuevo alérgeno"
                onCreate={(name, icon) => createAllergenAction(name, icon)}
              />
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Opciones y complementos</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            control={form.control}
            name="options"
            render={({ field }) => <OptionsEditor value={field.value} onChange={field.onChange} />}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="archived">Archivado</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-4 backdrop-blur-md lg:left-64">
        <div className="mx-auto flex max-w-4xl justify-end gap-3">
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {mode === "create" ? "Guardar y continuar" : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </form>
  );
}
