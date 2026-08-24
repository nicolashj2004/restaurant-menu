"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useMenu } from "@/components/menu/restaurant-provider";
import { ProductCard } from "@/components/menu/product-card";

export default function FavoritesPage() {
  const { products, favorites } = useMenu();
  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-heading flex items-center gap-2 text-3xl font-bold">
        <Heart className="size-7 fill-rose-500 text-rose-500" /> Mis favoritos
      </h1>

      {favoriteProducts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">Aún no has guardado ningún plato.</p>
          <Link href="/menu" className="mt-4 inline-block text-sm font-medium underline underline-offset-4">
            Explorar el menú
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
