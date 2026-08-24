import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentRestaurant } from "@/lib/services/restaurant";
import { getProductBySlug } from "@/lib/services/products";
import { ProductDetailView } from "@/components/menu/product-detail-view";

interface PageProps {
  params: Promise<{ category: string; product: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { product: productSlug } = await params;
  const restaurant = await getCurrentRestaurant();
  if (!restaurant) return {};
  const product = await getProductBySlug(restaurant.id, productSlug);
  if (!product) return {};

  const image = product.images.find((i) => i.is_primary) ?? product.images[0];

  return {
    title: `${product.name} — ${restaurant.name}`,
    description: product.short_description ?? product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.short_description ?? undefined,
      images: image ? [image.url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { product: productSlug } = await params;
  const restaurant = await getCurrentRestaurant();
  if (!restaurant) notFound();
  const product = await getProductBySlug(restaurant.id, productSlug);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: product.name,
    description: product.short_description ?? product.description ?? undefined,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "COP",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetailView productSlug={productSlug} />
    </>
  );
}
