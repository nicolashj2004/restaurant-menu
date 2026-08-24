import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Iniciar sesión — Panel administrativo" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-3xl border bg-card p-8 shadow-sm">
        <h1 className="font-heading text-2xl font-semibold">Panel administrativo</h1>
        <p className="mt-1 text-sm text-muted-foreground">Inicia sesión para gestionar tu menú.</p>
        <div className="mt-6">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
