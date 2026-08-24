"use client";

import { useTransition } from "react";
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
import type { Product, PromotionWithProducts } from "@/lib/types/domain";

export function PromotionForm({
  promotion,
  products,
}: {
  promotion?: PromotionWithProducts;
  products: Pick<Product, "id" | "name">[];
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      title: promotion?.title ?? "",
      description: promotion?.description ?? "",
      image_url: promotion?.image_url ?? null,
      starts_at: promotion?.starts_at ? promotion.starts_at.slice(0, 10) : null,
      ends_at: promotion?.ends_at ? promotion.ends_at.slice(0, 10) : null,
      status: promotion?.status ?? "draft",
      display_type: promotion?.display_type ?? "banner",
      product_ids: promotion?.products.map((p) => p.id) ?? [],
    },
  });

  function onSubmit(values: PromotionFormValues) {
    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("description", values.description);
    formData.set("image_url", values.image_url ?? "");
    formData.set("starts_at", values.starts_at ?? "");
    formData.set("ends_at", values.ends_at ?? "");
    formData.set("status", values.status);
    formData.set("display_type", values.display_type);
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
            <Input id="promo-title" {...form.register("title")} />
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
          <CardTitle>Productos relacionados</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            control={form.control}
            name="product_ids"
            render={({ field }) => (
              <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
                {products.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                    <Checkbox
                      checked={field.value.includes(p.id)}
                      onCheckedChange={(checked) =>
                        field.onChange(
                          checked ? [...field.value, p.id] : field.value.filter((id) => id !== p.id)
                        )
                      }
                    />
                    {p.name}
                  </label>
                ))}
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
