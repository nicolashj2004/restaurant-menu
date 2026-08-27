"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMenu } from "@/components/menu/restaurant-provider";
import { groupByParent } from "@/lib/menu-utils";

/** Cycled through for categories without a photo — no image is invented, just a flat color card. */
const PLACEHOLDER_COLORS = [
  "#7c2d12", // rust
  "#78350f", // amber-900
  "#1c1917", // near-black
  "#713f12", // yellow-900
  "#450a0a", // red-950
  "#3f2410", // deep brown
];

export function CategoryGrid() {
  const { categories, products } = useMenu();
  const { topLevel, childrenOf } = groupByParent(categories);

  const cards = topLevel
    .filter((c) => c.is_active)
    .map((category, i) => {
      const childIds = childrenOf(category.id).map((c) => c.id);
      const count = products.filter(
        (p) => p.category_id === category.id || (p.category_id && childIds.includes(p.category_id))
      ).length;
      return { category, count, color: PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length] };
    })
    .filter(({ count }) => count > 0);

  if (cards.length === 0) return null;

  return (
    <section className="bg-[#0a0908] py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="text-center text-xs font-medium tracking-[0.2em] text-white/50 uppercase">
          Selecciona una sección del menú
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {cards.map(({ category, count, color }) => (
            <Link
              key={category.id}
              href={`/menu/${category.slug}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/20"
            >
              <div className="relative aspect-[16/7] w-full overflow-hidden" style={{ backgroundColor: color }}>
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-5xl opacity-40" aria-hidden>
                    {category.icon}
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-heading flex items-center gap-2 text-lg font-semibold text-white">
                    <span aria-hidden>{category.icon}</span>
                    {category.name}
                  </h3>
                  <ArrowRight className="size-4 shrink-0 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white/80" />
                </div>
                {category.description && (
                  <p className="mt-1 text-sm text-white/50">{category.description}</p>
                )}
                <div className="mt-3 border-t border-white/10 pt-3 text-xs text-white/40">
                  {count} {count === 1 ? "plato" : "platos"} ·{" "}
                  <span className="font-medium text-[#e0a458]">Ver carta →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
