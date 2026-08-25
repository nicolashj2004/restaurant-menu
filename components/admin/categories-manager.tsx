"use client";

import { useMemo, useState, useTransition } from "react";
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
  isChild,
  onEdit,
  onDelete,
  onAddChild,
}: {
  category: Category;
  isChild?: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onAddChild?: (parent: Category) => void;
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
        isChild && "ml-8",
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
              formData.set("parent_id", category.parent_id ?? "none");
              if (checked) formData.set("is_active", "on");
              await updateCategoryAction(category.id, formData);
            });
          }}
        />
        {active ? "Activa" : "Inactiva"}
      </label>
      {onAddChild && (
        <Button variant="ghost" size="icon" onClick={() => onAddChild(category)} aria-label="Agregar subcategoría">
          <Plus className="size-4" />
        </Button>
      )}
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
              {isChild
                ? "Los platos de esta subcategoría no se eliminarán, pero quedarán sin categoría asignada."
                : "Los platos de esta categoría no se eliminarán, pero quedarán sin categoría asignada. Si tiene subcategorías, pasarán a ser categorías de nivel principal."}
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

/** One parent's subcategories — its own drag scope, so a subcategory can never be dropped into another parent's group or the top-level list. */
function ChildList({
  childCategories,
  onReorder,
  onEdit,
  onDelete,
}: {
  childCategories: Category[];
  onReorder: (orderedIds: string[]) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = childCategories.findIndex((c) => c.id === active.id);
    const newIndex = childCategories.findIndex((c) => c.id === over.id);
    const next = [...childCategories];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    onReorder(next.map((c) => c.id));
  }

  return (
    <DndContext
      id={`categories-children-${childCategories[0]?.parent_id}`}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={childCategories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="mt-2 space-y-2">
          {childCategories.map((child) => (
            <SortableRow key={child.id} category={child} isChild onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
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
  const [initialParentId, setInitialParentId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const topLevel = useMemo(() => categories.filter((c) => c.parent_id === null), [categories]);
  const childrenByParent = useMemo(() => {
    const map = new Map<string, Category[]>();
    for (const c of categories) {
      if (!c.parent_id) continue;
      map.set(c.parent_id, [...(map.get(c.parent_id) ?? []), c]);
    }
    return map;
  }, [categories]);

  function openCreateDialog(parentId: string | null) {
    setEditing(undefined);
    setInitialParentId(parentId);
    setDialogOpen(true);
  }

  function openEditDialog(category: Category) {
    setEditing(category);
    setDialogOpen(true);
  }

  function handleTopLevelDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = topLevel.findIndex((c) => c.id === active.id);
    const newIndex = topLevel.findIndex((c) => c.id === over.id);
    const reordered = [...topLevel];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reorderCategoriesAction(reordered.map((c) => c.id));
    setCategories((prev) => [...reordered, ...prev.filter((c) => c.parent_id !== null)]);
  }

  function handleChildReorder(parentId: string, orderedIds: string[]) {
    reorderCategoriesAction(orderedIds);
    setCategories((prev) => {
      const reorderedChildren = orderedIds
        .map((id) => prev.find((c) => c.id === id))
        .filter((c): c is Category => Boolean(c));
      return [...prev.filter((c) => c.parent_id !== parentId), ...reorderedChildren];
    });
  }

  function handleDeleteTopLevel(id: string) {
    // The FK is `on delete set null`: children survive the deletion and are
    // promoted to top-level, so mirror that locally instead of removing them.
    setCategories((prev) =>
      prev.filter((c) => c.id !== id).map((c) => (c.parent_id === id ? { ...c, parent_id: null } : c))
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => openCreateDialog(null)}>
          <Plus className="size-4" /> Nueva categoría
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Aún no has creado categorías.</p>
      ) : (
        <DndContext
          id="categories-top-level"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleTopLevelDragEnd}
        >
          <SortableContext items={topLevel.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {topLevel.map((category) => {
                const children = childrenByParent.get(category.id) ?? [];
                return (
                  <div key={category.id}>
                    <SortableRow
                      category={category}
                      onEdit={openEditDialog}
                      onDelete={handleDeleteTopLevel}
                      onAddChild={(parent) => openCreateDialog(parent.id)}
                    />
                    {children.length > 0 && (
                      <ChildList
                        childCategories={children}
                        onReorder={(orderedIds) => handleChildReorder(category.id, orderedIds)}
                        onEdit={openEditDialog}
                        onDelete={(id) => setCategories((prev) => prev.filter((c) => c.id !== id))}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
        categories={categories}
        initialParentId={initialParentId}
      />
    </div>
  );
}
