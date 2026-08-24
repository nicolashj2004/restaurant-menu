"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  Megaphone,
  BarChart3,
  QrCode,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Productos", icon: UtensilsCrossed },
  { href: "/admin/categories", label: "Categorías", icon: FolderTree },
  { href: "/admin/promotions", label: "Promociones", icon: Megaphone },
  { href: "/admin/analytics", label: "Analítica", icon: BarChart3 },
  { href: "/admin/qr", label: "Código QR", icon: QrCode },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
];

export function AdminNav({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive ? "bg-foreground text-background" : "text-foreground/80 hover:bg-muted"
            )}
          >
            <Icon className="size-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
