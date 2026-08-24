"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Star, Trash2, UploadCloud, GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  deleteProductImageAction,
  reorderProductImagesAction,
  setPrimaryImageAction,
  uploadProductImageAction,
} from "@/lib/actions/products";
import type { ProductImage } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

function SortableImage({
  image,
  productId,
  onDelete,
  onSetPrimary,
}: {
  image: ProductImage;
  productId: string;
  onDelete: (id: string) => void;
  onSetPrimary: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });
  const [isPending, startTransition] = useTransition();

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-2xl border bg-muted",
        isDragging && "z-10 opacity-70"
      )}
    >
      <Image src={image.url} alt={image.alt_text ?? ""} fill className="object-cover" sizes="200px" />

      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Reordenar"
        className="absolute left-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        <GripVertical className="size-4" />
      </button>

      {image.is_primary && (
        <span className="absolute bottom-2 left-2 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-semibold text-white">
          Principal
        </span>
      )}

      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!image.is_primary && (
          <button
            type="button"
            aria-label="Marcar como principal"
            disabled={isPending}
            onClick={() => startTransition(async () => { await setPrimaryImageAction(productId, image.id); onSetPrimary(image.id); })}
            className="flex size-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <Star className="size-3.5" />
          </button>
        )}
        <button
          type="button"
          aria-label="Eliminar imagen"
          disabled={isPending}
          onClick={() => startTransition(async () => { await deleteProductImageAction(productId, image.id); onDelete(image.id); })}
          className="flex size-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-rose-600"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export function ImageManager({
  productId,
  initialImages,
}: {
  productId: string;
  initialImages: ProductImage[];
}) {
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const uploadFiles = useCallback(
    async (files: File[]) => {
      setUploading(true);
      try {
        for (const file of files) {
          if (!file.type.startsWith("image/")) {
            toast.error(`${file.name} no es una imagen válida`);
            continue;
          }
          const formData = new FormData();
          formData.set("file", file);
          const image = await uploadProductImageAction(productId, formData);
          setImages((prev) => [...prev, image]);
        }
        toast.success("Fotos subidas correctamente");
      } catch {
        toast.error("No se pudo subir alguna imagen. Intenta de nuevo.");
      } finally {
        setUploading(false);
      }
    },
    [productId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [], "image/avif": [] },
    onDrop: uploadFiles,
    noClick: true,
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setImages((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      const next = [...prev];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      reorderProductImagesAction(productId, next.map((i) => i.id));
      return next;
    });
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
          isDragActive ? "border-foreground bg-muted" : "border-border"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">Arrastra tus fotografías aquí</p>
        <p className="text-xs text-muted-foreground">JPG, PNG, WEBP o AVIF — puedes subir varias a la vez</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : null}
          Seleccionar archivos
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(Array.from(e.target.files))}
        />
      </div>

      {images.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {images.map((image) => (
                <SortableImage
                  key={image.id}
                  image={image}
                  productId={productId}
                  onDelete={(id) => setImages((prev) => prev.filter((i) => i.id !== id))}
                  onSetPrimary={(id) =>
                    setImages((prev) => prev.map((i) => ({ ...i, is_primary: i.id === id })))
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
