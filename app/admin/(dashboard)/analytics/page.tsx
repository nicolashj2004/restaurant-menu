import type { Metadata } from "next";
import { Eye, MousePointerClick } from "lucide-react";
import { getAdminSession } from "@/lib/services/admin-auth";
import { getAnalyticsSummary } from "@/lib/services/analytics";
import { StatCard } from "@/components/admin/stat-card";
import { AnalyticsBarList } from "@/components/admin/analytics-bar-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Analítica — Panel administrativo" };

export default async function AdminAnalyticsPage() {
  const session = await getAdminSession();
  const summary = await getAnalyticsSummary(session!.restaurantId, 30);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">Analítica</h1>
        <p className="text-sm text-muted-foreground">
          Actividad anónima de los últimos 30 días. No se recopila información personal.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Aperturas del menú" value={summary.totalMenuOpens} icon={Eye} />
        <StatCard label="Vistas de productos" value={summary.totalProductViews} icon={MousePointerClick} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platos más vistos</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsBarList items={summary.topProducts.map((p) => ({ label: p.name, value: p.views }))} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorías más consultadas</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsBarList
              items={summary.topCategories.map((c) => ({ label: c.name, value: c.percentage, suffix: "%" }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
