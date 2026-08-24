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
import { categoryFormSchema, type CategoryFormValues } from "@/lib/validation/category";
import { slugify } from "@/lib/slugify";
import { createCategoryAction, updateCategoryAction } from "@/lib/actions/categories";
import type { Category } from "@/lib/types/domain";

export function CategoryDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(Boolean(category));

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      icon: category?.icon ?? "",
      is_active: category?.is_active ?? true,
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
      });
      // Resetting local UI state to match the dialog's imperative form.reset()
      // call above, not a reaction to reactive props.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSlugTouched(Boolean(category));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category?.id]);

  function onSubmit(values: CategoryFormValues) {
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("slug", values.slug);
    formData.set("description", values.description);
    formData.set("icon", values.icon);
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
