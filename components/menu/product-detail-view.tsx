"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useMenu } from "@/components/menu/restaurant-provider";
import { ProductGallery } from "@/components/menu/product-gallery";
import { Product360Viewer } from "@/components/menu/product-360-viewer";
import { ProductBadges } from "@/components/menu/product-badges";
import { ProductOptions } from "@/components/menu/product-options";
import { FavoriteButton } from "@/components/menu/favorite-button";
import { ShareButton } from "@/components/menu/share-button";
import { RelatedProducts } from "@/components/menu/related-products";
import { PriceDisplay } from "@/components/menu/price-display";
import { applyDiscount, getActiveDiscount, getRelatedProducts, groupByParent, seededShuffle } from "@/lib/menu-utils";
import type { ProductWithRelations } from "@/lib/types/domain";

/** Categories (by slug) treated as pairing suggestions in "Combínala con". */
const COMBINE_WITH_SLUGS = ["entradas", "bebidas"];

/**
 * Ordered 360° frame URLs for a dish, if it has any (e.g. 01.webp, 02.webp, ...).
 * No product currently has a 360 photo sequence — there's no admin upload flow or
 * database field for one yet. Once that source exists (a dedicated column, a naming
 * convention on product_images, a separate table — whatever fits), return its ordered
 * URLs here. Product360Viewer itself needs no changes to support it.
 */
// 127.0.0.1 only resolves to "this machine" — using the LAN IP instead so the demo
// also loads images from a phone on the same Wi-Fi, not just this Mac.
const MOUSE_360_TEST_FRAMES = Array.from(
  { length: 18 },
  (_, i) =>
    `http://192.168.5.228:54321/storage/v1/object/public/menu-images/32a2a05e-54bd-4002-96c1-065f857491bb/360-test/${String(i + 1).padStart(2, "0")}.jpg`
);

function get360Images(product: ProductWithRelations): string[] {
  // TEMPORAL — secuencia real de 18 fotos (de un mouse, solo para probar el visor en
  // vivo). Se quita apenas confirmes que lo viste; no es la integración final.
  if (product.slug === "volcan-de-chocolate") {
    return MOUSE_360_TEST_FRAMES;
  }
  return [];
}

export function ProductDetailView({ productSlug }: { productSlug: string }) {
  const { products, categories, promotions, formatPrice, track } = useMenu();
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

  const discount = getActiveDiscount(product.id, promotions);
  const effectivePrice = applyDiscount(product.price, discount);
  const threeSixtyImages = get360Images(product);

  const related = getRelatedProducts(product, products, 8);

  const { childrenOf } = groupByParent(categories);
  // One bucket per pairing group: Entradas, Bebidas (with its subcategories), and —
  // if it isn't already one of those — the viewed dish's own section.
  const bucketIdSets = COMBINE_WITH_SLUGS.map((slug) => {
    const category = categories.find((c) => c.slug === slug && c.parent_id === null);
    if (!category) return null;
    return new Set([category.id, ...childrenOf(category.id).map((c) => c.id)]);
  }).filter((s): s is Set<string> => s !== null);
  if (product.category_id && !bucketIdSets.some((ids) => ids.has(product.category_id!))) {
    bucketIdSets.push(new Set([product.category_id]));
  }

  // Shuffle each bucket's own items, then shuffle the bucket visiting order, both seeded
  // by the product id — looks random and varies per dish, but stays identical between the
  // server render and the client hydration (a real Math.random() would mismatch there).
  const buckets = bucketIdSets
    .map((ids, i) =>
      seededShuffle(
        products.filter(
          (p) => p.is_available && p.id !== product.id && p.category_id !== null && ids.has(p.category_id)
        ),
        `${product.id}-${i}`
      )
    )
    .filter((bucket) => bucket.length > 0);
  const bucketOrder = seededShuffle(buckets, product.id);

  const combineWith: typeof products = [];
  for (let round = 0; combineWith.length < 6 && bucketOrder.some((b) => b[round]); round++) {
    for (const bucket of bucketOrder) {
      if (combineWith.length >= 6) break;
      if (bucket[round]) combineWith.push(bucket[round]);
    }
  }

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
        <p className="mt-2 text-2xl font-semibold">
          <PriceDisplay price={product.price} discount={discount} formatPrice={formatPrice} />
        </p>

        <ProductBadges tags={product.tags} spiceLevel={product.spice_level} className="mt-3" />

        {!product.is_available && (
          <p className="mt-3 inline-block rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            Agotado temporalmente
          </p>
        )}

        {product.short_description && (
          <p className="mt-4 font-medium text-foreground">{product.short_description}</p>
        )}
        {product.description && (
          <p className="mt-2 whitespace-pre-line text-muted-foreground">{product.description}</p>
        )}

        <div className="mt-3">
          <ShareButton title={product.name} text={product.short_description ?? undefined} />
        </div>

        {threeSixtyImages.length > 0 && (
          <div className="mt-6">
            <h2 className="font-heading text-base font-semibold">Vista 360°</h2>
            <p className="mt-1 text-xs text-muted-foreground">Arrastra para girar el plato</p>
            <div className="mt-2">
              <Product360Viewer images={threeSixtyImages} alt={`${product.name} — vista 360°`} />
            </div>
          </div>
        )}

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
            <ProductOptions options={product.options} basePrice={effectivePrice} formatPrice={formatPrice} />
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
