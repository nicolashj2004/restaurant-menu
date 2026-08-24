"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { uploadRestaurantImageAction } from "@/lib/actions/media";
import { cn } from "@/lib/utils";

export function SingleImageUploader({
  folder,
  value,
  onChange,
  aspect = "aspect-video",
}: {
  folder: "branding" | "promotions" | "categories";
  value: string | null;
  onChange: (url: string | null) => void;
  aspect?: string;
}) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setUploading(true);
      try {
        const formData = new FormData();
        formData.set("file", file);
        const url = await uploadRestaurantImageAction(folder, formData);
        onChange(url);
      } catch {
        toast.error("No se pudo subir la imagen.");
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [], "image/avif": [] },
    maxFiles: 1,
    onDrop,
  });

  if (value) {
    return (
      <div className={cn("relative w-full overflow-hidden rounded-2xl border", aspect)}>
        <Image src={value} alt="" fill className="object-cover" sizes="480px" />
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Quitar imagen"
          className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed text-center transition-colors",
        aspect,
        isDragActive ? "border-foreground bg-muted" : "border-border hover:bg-muted/50"
      )}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      ) : (
        <>
          <UploadCloud className="size-6 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Arrastra o haz clic para subir</p>
        </>
      )}
    </div>
  );
}
