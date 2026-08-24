"use client";

import { useEffect } from "react";
import { RefreshCcw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MenuError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <WifiOff className="size-10 text-muted-foreground" />
      <h1 className="mt-4 font-heading text-2xl font-semibold">Algo salió mal</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        No pudimos cargar esta sección del menú. Revisa tu conexión e inténtalo de nuevo.
      </p>
      <Button onClick={reset} className="mt-6">
        <RefreshCcw className="size-4" /> Intentar de nuevo
      </Button>
    </div>
  );
}
