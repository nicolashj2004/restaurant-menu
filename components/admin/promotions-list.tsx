"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deletePromotionAction } from "@/lib/actions/promotions";
import type { PromotionWithProducts } from "@/lib/types/domain";

const STATUS_LABEL: Record<string, string> = {
  draft: "⚪ Borrador",
  active: "🟢 Activa",
  expired: "🔴 Expirada",
};

export function PromotionsList({ promotions }: { promotions: PromotionWithProducts[] }) {
  const [isPending, startTransition] = useTransition();

  if (promotions.length === 0) {
    return <p className="py-16 text-center text-sm text-muted-foreground">Aún no has creado promociones.</p>;
  }

  return (
    <div className="grid gap-3">
      {promotions.map((promo) => (
        <div key={promo.id} className="flex items-center gap-3 rounded-2xl border bg-card p-3">
          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
            {promo.image_url && <Image src={promo.image_url} alt={promo.title} fill className="object-cover" sizes="96px" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{promo.title}</p>
            <p className="truncate text-sm text-muted-foreground">{promo.products.length} productos relacionados</p>
          </div>
          <Badge variant="outline">{STATUS_LABEL[promo.status]}</Badge>
          {promo.discount_type && promo.discount_value && (
            <Badge className="bg-rose-600 text-white hover:bg-rose-600">
              {promo.discount_type === "percentage" ? `${promo.discount_value}% OFF` : `-${promo.discount_value}`}
            </Badge>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/promotions/${promo.id}`}>Editar</Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar &ldquo;{promo.title}&rdquo;?</AlertDialogTitle>
                <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await deletePromotionAction(promo.id);
                      toast.success("Promoción eliminada");
                    })
                  }
                >
                  Sí, eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}
    </div>
  );
}
