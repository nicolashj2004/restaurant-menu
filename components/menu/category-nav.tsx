"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMenu } from "@/components/menu/restaurant-provider";
import { cn } from "@/lib/utils";

export function CategoryNav({ className }: { className?: string }) {
  const { categories } = useMenu();
  const pathname = usePathname();
  const activeSlug = pathname.startsWith("/menu/") ? pathname.split("/")[2] : undefined;

  const items = [
    { slug: undefined, name: "Todo", icon: "🍽" },
    ...categories.filter((c) => c.parent_id === null).map((c) => ({ slug: c.slug, name: c.name, icon: c.icon })),
  ];

  return (
    <nav
      aria-label="Categorías del menú"
      className={cn(
        "sticky top-14 z-30 -mx-4 border-b bg-background/85 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border",
        className
      )}
    >
      <div className="no-scrollbar flex gap-2 overflow-x-auto scroll-px-4">
        {items.map((item) => {
          const isActive = item.slug === activeSlug || (!item.slug && !activeSlug);
          const href = item.slug ? `/menu/${item.slug}` : "/menu";
          return (
            <Link
              key={item.slug ?? "all"}
              href={href}
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
