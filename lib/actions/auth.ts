"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  requestPasswordReset,
  signInWithPassword,
  signOut,
  updatePassword,
} from "@/lib/services/admin-auth";

export interface ActionResult {
  error?: string;
}

export async function loginAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/admin");

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  try {
    await signInWithPassword(email, password);
  } catch {
    return { error: "Correo o contraseña incorrectos." };
  }

  redirect(redirectTo || "/admin");
}

export async function logoutAction() {
  await signOut();
  revalidatePath("/admin");
  redirect("/admin/login");
}

export async function requestPasswordResetAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Ingresa tu correo." };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    await requestPasswordReset(email, `${siteUrl}/admin/reset-password`);
  } catch {
    // Intentionally swallow: never reveal whether an email exists.
  }
  return {};
}

export async function updatePasswordAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }
  try {
    await updatePassword(password);
  } catch {
    return { error: "No se pudo actualizar la contraseña." };
  }
  redirect("/admin");
}
