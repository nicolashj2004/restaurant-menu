"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useMenu } from "@/components/menu/restaurant-provider";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  productId,
  className,
  size = "default",
}: {
  productId: string;
  className?: string;
  size?: "default" | "sm";
}) {
  const { isFavorite, toggleFavorite } = useMenu();
  const active = isFavorite(productId);

  return (
    <button
      type="button"
      aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(productId);
      }}
      className={cn(
        "flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
        size === "sm" ? "size-8" : "size-10",
        className
      )}
    >
      <motion.span
        key={active ? "active" : "inactive"}
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <Heart
          className={cn(size === "sm" ? "size-4" : "size-5", active && "fill-rose-500 text-rose-500")}
        />
      </motion.span>
    </button>
  );
}
