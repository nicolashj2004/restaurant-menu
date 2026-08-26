"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { ProductImage } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    // Read Embla's initial scroll state once the imperative API is ready, then
    // subscribe to its own change events — the standard embla-carousel-react wiring.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  if (images.length === 0) {
    return <div className="aspect-square w-full bg-muted sm:mx-auto sm:aspect-[4/3] sm:max-w-xl sm:rounded-3xl" />;
  }

  return (
    <>
      <div className="relative sm:mx-auto sm:max-w-xl sm:overflow-hidden sm:rounded-3xl">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {images.map((image, i) => (
              <button
                type="button"
                key={image.id}
                className="relative aspect-square w-full shrink-0 sm:aspect-[4/3]"
                onClick={() => {
                  setSelectedIndex(i);
                  setLightboxOpen(true);
                }}
                aria-label="Ampliar imagen"
              >
                <Image
                  src={image.url}
                  alt={image.alt_text ?? productName}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 640px) 100vw, 576px"
                  className="object-contain"
                />
              </button>
            ))}
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={() => emblaApi?.scrollPrev()}
              className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md sm:flex"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Foto siguiente"
              onClick={() => emblaApi?.scrollNext()}
              className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md sm:flex"
            >
              <ChevronRight className="size-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full bg-white/70 transition-all",
                    i === selectedIndex ? "w-5 bg-white" : "w-1.5"
                  )}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <ZoomIn className="size-3.5" />
          {selectedIndex + 1}/{images.length}
        </div>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          showCloseButton={false}
          className="h-dvh max-h-dvh w-screen max-w-full border-0 bg-black/95 p-0 sm:rounded-none"
        >
          <DialogTitle className="sr-only">{productName} — imagen ampliada</DialogTitle>
          <div className="relative flex h-full w-full items-center justify-center">
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <X className="size-6" />
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Foto anterior"
                  onClick={() => setSelectedIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  aria-label="Foto siguiente"
                  onClick={() => setSelectedIndex((i) => (i + 1) % images.length)}
                  className="absolute right-3 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
            <div className="relative h-full w-full touch-pinch-zoom">
              <Image
                src={images[selectedIndex].url}
                alt={images[selectedIndex].alt_text ?? productName}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
