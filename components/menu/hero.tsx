"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { InstagramIcon } from "@/components/icons/instagram-icon";
import { useMenu } from "@/components/menu/restaurant-provider";
import { isRestaurantOpenNow, todaysHoursLabel } from "@/lib/menu-utils";

/**
 * Always dark/moody regardless of the site's light/dark toggle (a deliberate choice for
 * just this landing hero, per the redesign — the rest of the menu keeps following the
 * normal light/dark theme). Hardcoded colors here, not `dark:` variants.
 */
export function Hero() {
  const { restaurant, settings } = useMenu();
  const open = isRestaurantOpenNow(settings);
  const hours = todaysHoursLabel(settings);

  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden sm:min-h-[78vh]">
      <div className="absolute inset-0 -z-10">
        {settings?.hero_image_url ? (
          <Image
            src={settings.hero_image_url}
            alt={restaurant.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[#0a0908]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-black/85" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto w-full max-w-2xl px-6 py-24 text-center text-white"
      >
        <div className="mb-4 inline-flex items-center gap-2 text-xs font-medium">
          <span className={open ? "text-emerald-400" : "text-rose-400"}>●</span>
          <span className="tracking-wide text-white/70">
            {open ? "Abierto ahora" : "Cerrado ahora"}
            {hours ? ` · ${hours}` : ""}
          </span>
        </div>

        <h1 className="font-heading text-5xl leading-[1.05] font-bold text-balance sm:text-7xl">
          {restaurant.name}
        </h1>

        {settings?.tagline && (
          <p className="mt-4 text-sm font-medium tracking-[0.15em] whitespace-pre-line text-[#e0a458] uppercase">
            {settings.tagline}
          </p>
        )}

        {settings?.description && (
          <p className="mx-auto mt-5 max-w-md text-balance text-white/70">{settings.description}</p>
        )}

        <div className="mx-auto mt-8 h-px w-16 bg-[#e0a458]/50" />

        {(settings?.instagram_url || settings?.whatsapp_number) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {settings?.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-md transition-colors hover:bg-white/20"
              >
                <InstagramIcon className="size-4" /> Instagram
              </a>
            )}
            {settings?.whatsapp_number && (
              <a
                href={`https://wa.me/${settings.whatsapp_number}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
              >
                <MessageCircle className="size-4" /> Reservar por WhatsApp
              </a>
            )}
          </div>
        )}
      </motion.div>
    </section>
  );
}
