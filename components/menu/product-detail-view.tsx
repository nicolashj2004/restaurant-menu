"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useMenu } from "@/components/menu/restaurant-provider";
import { ProductGallery } from "@/components/menu/product-gallery";
import { ProductBadges } from "@/components/menu/product-badges";
import { ProductOptions } from "@/components/menu/product-options";
import { FavoriteButton } from "@/components/menu/favorite-button";
import { ShareButton } from "@/components/menu/share-button";
import { RelatedProducts } from "@/components/menu/related-products";
import { getRelatedProducts } from "@/lib/menu-utils";

export function ProductDetailView({ productSlug }: { productSlug: string }) {
  const { products, formatPrice, track } = useMenu();
  const product = products.find((p) => p.slug === productSlug);

  useEffect(() => {
    if (product) track("view_product", { productId: product.id, categoryId: product.category_id ?? undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-heading text-2xl font-semibold">Plato no encontrado</h1>
        <p className="mt-2 text-muted-foreground">Este plato ya no está disponible en el menú.</p>
        <Link href="/menu" className="mt-6 inline-block text-sm font-medium underline underline-offset-4">
          Volver al menú
        </Link>
      </div>
    );
  }

  const related = getRelatedProducts(product, products, 8);
  const combineWith = products
    .filter((p) => p.is_available && p.category_id !== product.category_id && p.id !== product.id)
    .slice(0, 6);

  return (
    <div className="pb-10">
      <div className="relative sm:mx-auto sm:max-w-xl sm:pt-6">
        <ProductGallery images={product.images} productName={product.name} />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3 sm:top-6">
          <Link
            href={`/menu/${product.category?.slug ?? ""}`}
            className="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/55"
            aria-label="Volver"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="pointer-events-auto">
            <FavoriteButton productId={product.id} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-heading text-3xl font-bold leading-tight text-balance">{product.name}</h1>
        </div>
        <p className="mt-2 text-2xl font-semibold text-[color:var(--restaurant-accent)]">
          {formatPrice(product.price)}
        </p>

        <ProductBadges tags={product.tags} spiceLevel={product.spice_level} className="mt-3" />

        {!product.is_available && (
          <p className="mt-3 inline-block rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            Agotado temporalmente
          </p>
        )}

        {product.description && <p className="mt-4 text-muted-foreground">{product.description}</p>}

        <div className="mt-3">
          <ShareButton title={product.name} text={product.short_description ?? undefined} />
        </div>

        {product.ingredients.length > 0 && (
          <div className="mt-6">
            <h2 className="font-heading text-base font-semibold">Ingredientes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.ingredients.map((i) => i.name).join(", ")}
            </p>
          </div>
        )}

        {product.allergens.length > 0 && (
          <div className="mt-4">
            <h2 className="font-heading text-base font-semibold">Alérgenos</h2>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {product.allergens.map((a) => (
                <span
                  key={a.id}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
                >
                  {a.icon} {a.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {product.options.length > 0 && (
          <div className="mt-8">
            <ProductOptions options={product.options} basePrice={product.price} formatPrice={formatPrice} />
          </div>
        )}
      </div>

      <div className="mx-auto max-w-5xl">
        <RelatedProducts title="Combínala con" icon="🍽" products={combineWith} />
        <RelatedProducts title="También te puede gustar" icon="✨" products={related} />
      </div>
    </div>
  );
}
