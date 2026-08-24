"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { InstagramIcon } from "@/components/icons/instagram-icon";
import { useMenu } from "@/components/menu/restaurant-provider";
import { isRestaurantOpenNow, todaysHoursLabel } from "@/lib/menu-utils";

export function Hero() {
  const { restaurant, settings } = useMenu();
  const open = isRestaurantOpenNow(settings);
  const hours = todaysHoursLabel(settings);

  return (
    <section className="relative flex min-h-[62vh] items-end overflow-hidden sm:min-h-[68vh] sm:rounded-b-[2.5rem]">
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
          <div className="h-full w-full bg-[color:var(--restaurant-primary)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full px-5 pb-8 pt-24 text-white sm:px-8 sm:pb-12"
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <span className={open ? "text-emerald-400" : "text-rose-400"}>●</span>
            <span>
              {open ? "Abierto ahora" : "Cerrado ahora"}
              {hours ? ` · ${hours}` : ""}
            </span>
          </div>
          <h1 className="font-heading text-4xl font-bold leading-[1.05] text-balance sm:text-6xl">
            {restaurant.name}
          </h1>
          {settings?.tagline && (
            <p className="mt-3 max-w-lg text-base text-white/85 sm:text-lg">{settings.tagline}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-2.5">
            {settings?.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-md transition-colors hover:bg-white/25"
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
        </div>
      </motion.div>
    </section>
  );
}
