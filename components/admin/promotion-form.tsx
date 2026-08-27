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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SingleImageUploader } from "@/components/admin/single-image-uploader";
import { promotionFormSchema, type PromotionFormValues } from "@/lib/validation/promotion";
import { createPromotionAction, updatePromotionAction } from "@/lib/actions/promotions";
import { applyDiscount, formatCurrency } from "@/lib/menu-utils";
import { slugify } from "@/lib/slugify";
import type { Product, PromotionWithProducts } from "@/lib/types/domain";

export function PromotionForm({
  promotion,
  products,
  currency,
  locale,
}: {
  promotion?: PromotionWithProducts;
  products: Pick<Product, "id" | "name" | "price">[];
  currency: string;
  locale: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(Boolean(promotion));

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      title: promotion?.title ?? "",
      slug: promotion?.slug ?? "",
      description: promotion?.description ?? "",
      image_url: promotion?.image_url ?? null,
      starts_at: promotion?.starts_at ? promotion.starts_at.slice(0, 10) : null,
      ends_at: promotion?.ends_at ? promotion.ends_at.slice(0, 10) : null,
      status: promotion?.status ?? "draft",
      display_type: promotion?.display_type ?? "banner",
      discount_type: promotion?.discount_type ?? "none",
      discount_value: promotion?.discount_value ?? 0,
      product_ids: promotion?.products.map((p) => p.id) ?? [],
    },
  });

  const discountType = form.watch("discount_type");
  const discountValue = form.watch("discount_value");
  const selectedIds = form.watch("product_ids");

  function onSubmit(values: PromotionFormValues) {
    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("slug", values.slug);
    formData.set("description", values.description);
    formData.set("image_url", values.image_url ?? "");
    formData.set("starts_at", values.starts_at ?? "");
    formData.set("ends_at", values.ends_at ?? "");
    formData.set("status", values.status);
    formData.set("display_type", values.display_type);
    formData.set("discount_type", values.discount_type);
    formData.set("discount_value", String(values.discount_value));
    formData.set("product_ids", JSON.stringify(values.product_ids));

    startTransition(async () => {
      try {
        if (promotion) {
          await updatePromotionAction(promotion.id, formData);
          toast.success("Promoción actualizada");
        } else {
          await createPromotionAction(formData);
        }
      } catch (err) {
        if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
        toast.error("No se pudo guardar la promoción.");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Detalles de la promoción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="promo-title">Título</Label>
            <Input
              id="promo-title"
              {...form.register("title", {
                onChange: (e) => {
                  if (!slugTouched) form.setValue("slug", slugify(e.target.value));
                },
              })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="promo-slug">URL amigable</Label>
            <Input id="promo-slug" {...form.register("slug", { onChange: () => setSlugTouched(true) })} />
            {form.formState.errors.slug && (
              <p className="text-xs text-rose-600">{form.formState.errors.slug.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="promo-description">Descripción</Label>
            <Textarea id="promo-description" rows={3} {...form.register("description")} />
          </div>
          <div className="space-y-1.5">
            <Label>Imagen</Label>
            <Controller
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <SingleImageUploader folder="promotions" value={field.value ?? null} onChange={field.onChange} />
              )}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="starts_at">Fecha de inicio</Label>
              <Input id="starts_at" type="date" {...form.register("starts_at")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ends_at">Fecha final</Label>
              <Input id="ends_at" type="date" {...form.register("ends_at")} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="expired">Expirada</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Visualización</Label>
              <Controller
                control={form.control}
                name="display_type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="carousel">Carrusel</SelectItem>
                      <SelectItem value="card">Tarjeta destacada</SelectItem>
                      <SelectItem value="popup">Elegante (no intrusivo)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Descuento (opcional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Controller
                control={form.control}
                name="discount_type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin descuento</SelectItem>
                      <SelectItem value="percentage">Porcentaje</SelectItem>
                      <SelectItem value="fixed_amount">Monto fijo</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {discountType !== "none" && (
              <div className="space-y-1.5">
                <Label htmlFor="promo-discount-value">
                  Valor {discountType === "percentage" ? "(%)" : "($)"}
                </Label>
                <Input
                  id="promo-discount-value"
                  type="number"
                  min={0}
                  max={discountType === "percentage" ? 100 : undefined}
                  {...form.register("discount_value", { valueAsNumber: true })}
                />
                {form.formState.errors.discount_value && (
                  <p className="text-xs text-rose-600">{form.formState.errors.discount_value.message}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productos relacionados</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            control={form.control}
            name="product_ids"
            render={({ field }) => (
              <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
                {products.map((p) => {
                  const checked = field.value.includes(p.id);
                  const showPreview = checked && discountType !== "none" && discountValue > 0;
                  const previewPrice = showPreview
                    ? applyDiscount(p.price, {
                        type: discountType,
                        value: discountValue,
                        promotionTitle: "",
                        promotionSlug: null,
                      })
                    : null;
                  return (
                    <label key={p.id} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(next) => {
                          // Read the freshest value from the form store, not the `field.value`
                          // closure — clicking several checkboxes in quick succession can fire
                          // before a prior click's re-render commits, so a stale closure would
                          // silently drop earlier selections.
                          const current = form.getValues("product_ids");
                          field.onChange(next ? [...current, p.id] : current.filter((id) => id !== p.id));
                        }}
                      />
                      <span className="flex-1">{p.name}</span>
                      {previewPrice !== null && (
                        <span className="shrink-0 text-xs">
                          <span className="text-muted-foreground line-through">
                            {formatCurrency(p.price, currency, locale)}
                          </span>{" "}
                          <span className="font-semibold text-rose-600">
                            {formatCurrency(previewPrice, currency, locale)}
                          </span>
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Guardar promoción
      </Button>
    </form>
  );
}
