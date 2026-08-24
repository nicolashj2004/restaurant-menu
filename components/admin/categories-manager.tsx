"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CategoryDialog } from "@/components/admin/category-dialog";
import { deleteCategoryAction, reorderCategoriesAction, updateCategoryAction } from "@/lib/actions/categories";
import type { Category } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

function SortableRow({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState(category.is_active);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 rounded-2xl border bg-card p-3",
        isDragging && "z-10 opacity-70 shadow-lg"
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Reordenar"
        className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
      >
        <GripVertical className="size-5" />
      </button>
      <span className="text-xl">{category.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{category.name}</p>
        {category.description && <p className="truncate text-sm text-muted-foreground">{category.description}</p>}
      </div>
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Switch
          checked={active}
          disabled={isPending}
          onCheckedChange={(checked) => {
            setActive(checked);
            startTransition(async () => {
              const formData = new FormData();
              formData.set("name", category.name);
              formData.set("slug", category.slug);
              formData.set("description", category.description ?? "");
              formData.set("icon", category.icon ?? "");
              if (checked) formData.set("is_active", "on");
              await updateCategoryAction(category.id, formData);
            });
          }}
        />
        {active ? "Activa" : "Inactiva"}
      </label>
      <Button variant="ghost" size="icon" onClick={() => onEdit(category)} aria-label="Editar">
        <Pencil className="size-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Eliminar">
            <Trash2 className="size-4 text-muted-foreground" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar &ldquo;{category.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Los platos de esta categoría no se eliminarán, pero quedarán sin categoría asignada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                startTransition(async () => {
                  await deleteCategoryAction(category.id);
                  onDelete(category.id);
                  toast.success("Categoría eliminada");
                })
              }
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function CategoriesManager({ categories: initial }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initial);
  const [syncedInitial, setSyncedInitial] = useState(initial);
  // Re-sync local (optimistic/reorderable) state when the server gives us a fresh
  // `initial` after router.refresh() — adjusting state during render, not in an effect.
  if (initial !== syncedInitial) {
    setSyncedInitial(initial);
    setCategories(initial);
  }
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>(undefined);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setCategories((prev) => {
      const oldIndex = prev.findIndex((c) => c.id === active.id);
      const newIndex = prev.findIndex((c) => c.id === over.id);
      const next = [...prev];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      reorderCategoriesAction(next.map((c) => c.id));
      return next;
    });
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => {
            setEditing(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" /> Nueva categoría
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Aún no has creado categorías.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {categories.map((category) => (
                <SortableRow
                  key={category.id}
                  category={category}
                  onEdit={(c) => {
                    setEditing(c);
                    setDialogOpen(true);
                  }}
                  onDelete={(id) => setCategories((prev) => prev.filter((c) => c.id !== id))}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <CategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} category={editing} />
    </div>
  );
}
