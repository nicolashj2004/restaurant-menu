"use client";

import Link from "next/link";
import { Heart, Search } from "lucide-react";
import { useMenu } from "@/components/menu/restaurant-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { SearchOverlay } from "@/components/menu/search-overlay";
import { useState } from "react";

export function QuickActionsBar() {
  const { restaurant, favorites } = useMenu();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/85 px-4 backdrop-blur-md">
        <Link href="/menu" className="font-heading text-lg font-semibold tracking-tight">
          {restaurant.name}
        </Link>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Buscar en el menú"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-[18px]" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Mis favoritos" asChild className="relative">
            <Link href="/menu/favoritos">
              <Heart className="size-[18px]" />
              {favorites.length > 0 && (
                <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-[color:var(--restaurant-accent)] text-[10px] font-semibold text-white">
                  {favorites.length}
                </span>
              )}
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </header>
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
