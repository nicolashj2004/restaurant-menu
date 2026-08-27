"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMenu } from "@/components/menu/restaurant-provider";
import { cn } from "@/lib/utils";

export function CategoryNav({ className }: { className?: string }) {
  const { categories } = useMenu();
  const pathname = usePathname();
  const activeSlug = pathname.startsWith("/menu/") ? pathname.split("/")[2] : undefined;

  // No "Todo" entry — the home page (/menu) is now the category-picker landing page,
  // not an "everything at once" view, so this nav is purely for switching between
  // categories while already inside one.
  const items = categories
    .filter((c) => c.parent_id === null)
    .map((c) => ({ slug: c.slug, name: c.name, icon: c.icon }));

  return (
    <nav
      aria-label="Categorías del menú"
      className={cn(
        // No -mx-4 bleed here: this now sits directly in an unpadded container (see
        // app/menu/page.tsx and category-view.tsx), so plain full-width IS edge-to-edge
        // already — a negative margin would push it past the viewport instead.
        "sticky top-14 z-30 border-b bg-background/85 px-4 py-3 backdrop-blur-md sm:rounded-2xl sm:border",
        className
      )}
    >
      <div className="no-scrollbar flex gap-2 overflow-x-auto scroll-px-4">
        {items.map((item) => {
          const isActive = item.slug === activeSlug;
          return (
            <Link
              key={item.slug}
              href={`/menu/${item.slug}`}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-transparent bg-[color:var(--restaurant-primary)] text-white"
                  : "border-border bg-transparent text-foreground hover:bg-muted"
              )}
            >
              <span aria-hidden>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
