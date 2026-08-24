import Link from "next/link";

export default function MenuNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-2xl font-semibold">No pudimos cargar el menú</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Este restaurante no está disponible en este momento. Intenta escanear el código QR nuevamente.
      </p>
      <Link href="/menu" className="mt-6 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background">
        Reintentar
      </Link>
    </div>
  );
}
