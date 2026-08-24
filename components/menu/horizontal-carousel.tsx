"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function HorizontalCarousel({
  children,
  className,
  itemClassName,
}: {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", dragFree: true, containScroll: "trimSnaps" });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    // Read Embla's initial scroll state once the imperative API is ready, then
    // subscribe to its own change events — the standard embla-carousel-react wiring.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 px-4 sm:px-0">
          {children.map((child, i) => (
            <div key={i} className={cn("shrink-0", itemClassName ?? "w-[72%] sm:w-[300px]")}>
              {child}
            </div>
          ))}
        </div>
      </div>

      {canPrev && (
        <button
          type="button"
          aria-label="Anterior"
          onClick={() => emblaApi?.scrollPrev()}
          className="absolute left-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-background/90 p-2 shadow-md ring-1 ring-border hover:bg-background sm:flex"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      {canNext && (
        <button
          type="button"
          aria-label="Siguiente"
          onClick={() => emblaApi?.scrollNext()}
          className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-background/90 p-2 shadow-md ring-1 ring-border hover:bg-background sm:flex"
        >
          <ChevronRight className="size-5" />
        </button>
      )}
    </div>
  );
}
