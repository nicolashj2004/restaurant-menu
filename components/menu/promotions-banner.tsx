"use client";

import Image from "next/image";
import { useMenu } from "@/components/menu/restaurant-provider";
import { HorizontalCarousel } from "@/components/menu/horizontal-carousel";

export function PromotionsBanner() {
  const { promotions } = useMenu();
  if (promotions.length === 0) return null;

  return (
    <section className="py-6">
      <div className="px-4 sm:px-0">
        <HorizontalCarousel itemClassName="w-[88%] sm:w-[520px]">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="relative flex h-40 items-end overflow-hidden rounded-3xl shadow-md sm:h-48"
            >
              {promo.image_url && (
                <Image
                  src={promo.image_url}
                  alt={promo.title}
                  fill
                  sizes="(max-width: 640px) 90vw, 520px"
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="relative z-10 p-5 text-white">
                <h3 className="font-heading text-xl font-semibold">{promo.title}</h3>
                {promo.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-white/85">{promo.description}</p>
                )}
              </div>
            </div>
          ))}
        </HorizontalCarousel>
      </div>
    </section>
  );
}
