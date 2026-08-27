"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SingleImageUploader } from "@/components/admin/single-image-uploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryFormSchema, type CategoryFormValues } from "@/lib/validation/category";
import { slugify } from "@/lib/slugify";
import { createCategoryAction, updateCategoryAction } from "@/lib/actions/categories";
import type { Category } from "@/lib/types/domain";

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  categories,
  initialParentId = null,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  categories: Category[];
  /** Preselects the parent when opening the dialog to create a new category (e.g. via a parent row's "add subcategory" action). Ignored when editing an existing category. */
  initialParentId?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(Boolean(category));
  const [imageUrl, setImageUrl] = useState<string | null>(category?.image_url ?? null);

  const hasChildren = category ? categories.some((c) => c.parent_id === category.id) : false;
  const parentOptions = categories.filter((c) => c.parent_id === null && c.id !== category?.id);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      icon: category?.icon ?? "",
      is_active: category?.is_active ?? true,
      parent_id: category?.parent_id ?? initialParentId,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name ?? "",
        slug: category?.slug ?? "",
        description: category?.description ?? "",
        icon: category?.icon ?? "",
        is_active: category?.is_active ?? true,
        parent_id: category?.parent_id ?? initialParentId,
      });
      // Resetting local UI state to match the dialog's imperative form.reset()
      // call above, not a reaction to reactive props.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSlugTouched(Boolean(category));
      setImageUrl(category?.image_url ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category?.id]);

  function onSubmit(values: CategoryFormValues) {
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("slug", values.slug);
    formData.set("description", values.description);
    formData.set("icon", values.icon);
    formData.set("image_url", imageUrl ?? "");
    formData.set("parent_id", values.parent_id ?? "none");
    if (values.is_active) formData.set("is_active", "on");

    startTransition(async () => {
      try {
        if (category) {
          await updateCategoryAction(category.id, formData);
          toast.success("Categoría actualizada");
        } else {
          await createCategoryAction(formData);
          toast.success("Categoría creada");
        }
        onOpenChange(false);
        router.refresh();
      } catch {
        toast.error("No se pudo guardar la categoría.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-[80px_1fr] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="icon">Ícono</Label>
              <Input id="icon" maxLength={4} placeholder="🍔" {...form.register("icon")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Nombre</Label>
              <Input
                id="cat-name"
                {...form.register("name", {
                  onChange: (e) => {
                    if (!slugTouched) form.setValue("slug", slugify(e.target.value));
                  },
                })}
              />
            </div>
          </div>
          {form.formState.errors.name && <p className="text-xs text-rose-600">{form.formState.errors.name.message}</p>}

          <div className="space-y-1.5">
            <Label htmlFor="cat-slug">URL amigable</Label>
            <Input id="cat-slug" {...form.register("slug", { onChange: () => setSlugTouched(true) })} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-description">Descripción (opcional)</Label>
            <Textarea id="cat-description" rows={2} {...form.register("description")} />
          </div>

          <div className="space-y-1.5">
            <Label>Foto (opcional)</Label>
            <SingleImageUploader folder="categories" value={imageUrl} onChange={setImageUrl} aspect="aspect-video" />
            <p className="text-xs text-muted-foreground">
              Se usa como portada de esta categoría en el inicio del menú. Sin foto, se muestra un color en su lugar.
            </p>
          </div>

          {hasChildren ? (
            <p className="rounded-xl border border-dashed px-4 py-3 text-xs text-muted-foreground">
              Esta categoría tiene subcategorías, por eso no puede tener a su vez una categoría padre.
            </p>
          ) : (
            <div className="space-y-1.5">
              <Label>Categoría padre (opcional)</Label>
              <Controller
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <Select value={field.value ?? "none"} onValueChange={(v) => field.onChange(v === "none" ? null : v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sin categoría padre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin categoría padre (nivel principal)</SelectItem>
                      {parentOptions.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <Controller
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <label className="flex items-center justify-between rounded-xl border px-4 py-3">
                <span className="text-sm font-medium">Categoría activa</span>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </label>
            )}
          />

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
