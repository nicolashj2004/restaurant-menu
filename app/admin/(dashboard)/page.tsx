import type { Metadata } from "next";
import Link from "next/link";
import { UtensilsCrossed, CheckCircle2, XCircle, Star, FolderTree, QrCode } from "lucide-react";
import { getAdminSession } from "@/lib/services/admin-auth";
import { getDashboardStats } from "@/lib/services/dashboard";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dashboard — Panel administrativo" };

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  const stats = await getDashboardStats(session!.restaurantId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Resumen general de tu menú digital.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/qr">
              <QrCode className="size-4" /> Ver QR
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/products/new">+ Crear plato</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Platos totales" value={stats.totalProducts} icon={UtensilsCrossed} />
        <StatCard label="Publicados" value={stats.publishedProducts} icon={CheckCircle2} tone="success" />
        <StatCard label="Agotados" value={stats.outOfStockProducts} icon={XCircle} tone="warning" />
        <StatCard label="Destacados" value={stats.featuredProducts} icon={Star} />
        <StatCard label="Categorías" value={stats.totalCategories} icon={FolderTree} />
        <StatCard label="Categorías activas" value={stats.activeCategories} icon={FolderTree} tone="success" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas modificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentlyUpdated.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay platos creados.</p>
          ) : (
            <ul className="divide-y">
              {stats.recentlyUpdated.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <span className="font-medium">{p.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {new Date(p.updated_at).toLocaleString("es-CO", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Editar
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
