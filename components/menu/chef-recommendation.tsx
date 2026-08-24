"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useMenu } from "@/components/menu/restaurant-provider";
import { SectionHeading } from "@/components/menu/section-heading";

export function ChefRecommendation() {
  const { products, formatPrice } = useMenu();
  const dish = products.find((p) => p.is_chef_recommendation && p.is_available);
  if (!dish) return null;

  const image = dish.images.find((i) => i.is_primary) ?? dish.images[0];
  const href = `/menu/${dish.category?.slug ?? "producto"}/${dish.slug}`;

  return (
    <section className="py-6">
      <SectionHeading icon="⭐" title="Recomendación del chef" />
      <div className="px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href={href}
            className="group relative flex min-h-[380px] items-end overflow-hidden rounded-3xl shadow-lg sm:min-h-[440px]"
          >
            {image && (
              <Image
                src={image.url}
                alt={image.alt_text ?? dish.name}
                fill
                sizes="(max-width: 640px) 100vw, 1024px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="relative z-10 p-6 text-white sm:p-10">
              <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                Especial del chef
              </span>
              <h3 className="font-heading text-3xl font-bold sm:text-4xl">{dish.name}</h3>
              {dish.short_description && (
                <p className="mt-2 max-w-md text-white/85">{dish.short_description}</p>
              )}
              <p className="mt-4 text-xl font-semibold">{formatPrice(dish.price)}</p>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
