"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useMenu } from "@/components/menu/restaurant-provider";
import { ProductCard } from "@/components/menu/product-card";

export function PromotionView({ slug }: { slug: string }) {
  const { promotions, products } = useMenu();
  const promotion = promotions.find((p) => p.slug === slug);

  if (!promotion) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-heading text-2xl font-semibold">Promoción no encontrada</h1>
        <p className="mt-2 text-muted-foreground">Esta promoción ya no está disponible.</p>
        <Link href="/menu" className="mt-6 inline-block text-sm font-medium underline underline-offset-4">
          Volver al menú
        </Link>
      </div>
    );
  }

  const promoProducts = products.filter((p) => promotion.products.some((pp) => pp.id === p.id));

  return (
    <div className="mx-auto max-w-5xl pb-10">
      <div className="relative flex min-h-[240px] items-end overflow-hidden sm:mx-4 sm:mt-4 sm:min-h-[320px] sm:rounded-3xl">
        {promotion.image_url && (
          <Image
            src={promotion.image_url}
            alt={promotion.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        <Link
          href="/menu"
          className="absolute left-3 top-3 z-10 flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/55"
          aria-label="Volver"
        >
          <ArrowLeft className="size-5" />
        </Link>

        <div className="relative z-10 p-5 text-white sm:p-8">
          {promotion.discount_type && promotion.discount_value && (
            <span className="mb-2 inline-block rounded-full bg-rose-600 px-3 py-1 text-xs font-bold">
              {promotion.discount_type === "percentage"
                ? `-${promotion.discount_value}%`
                : `Ahorra ${promotion.discount_value}`}
            </span>
          )}
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">{promotion.title}</h1>
          {promotion.description && (
            <p className="mt-1 max-w-xl text-sm text-white/85 sm:text-base">{promotion.description}</p>
          )}
        </div>
      </div>

      <div className="mt-6 px-4 sm:px-0">
        <h2 className="mb-3 font-heading text-lg font-semibold">Platos incluidos</h2>
        {promoProducts.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            Esta promoción todavía no tiene platos asignados.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {promoProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
