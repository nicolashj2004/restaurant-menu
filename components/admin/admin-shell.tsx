"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, LogOut } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";

export function AdminShell({
  restaurantName,
  userEmail,
  children,
}: {
  restaurantName: string;
  userEmail: string | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-muted/20">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card p-4 lg:flex">
        <Link href="/admin" className="mb-6 px-2 font-heading text-lg font-semibold">
          {restaurantName}
        </Link>
        <AdminNav className="flex-1" />
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
            <LogOut className="size-[18px]" /> Cerrar sesión
          </Button>
        </form>
        {userEmail && <p className="mt-2 truncate px-3 text-xs text-muted-foreground">{userEmail}</p>}
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card px-4 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menú">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-4">
              <SheetTitle className="mb-4 px-2 font-heading text-lg font-semibold">
                {restaurantName}
              </SheetTitle>
              <AdminNav onNavigate={() => setOpen(false)} />
              <form action={logoutAction} className="mt-4">
                <Button type="submit" variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
                  <LogOut className="size-[18px]" /> Cerrar sesión
                </Button>
              </form>
            </SheetContent>
          </Sheet>
          <span className="font-heading font-semibold">{restaurantName}</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
