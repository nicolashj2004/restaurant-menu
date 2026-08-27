"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SingleImageUploader } from "@/components/admin/single-image-uploader";
import { OpeningHoursEditor } from "@/components/admin/opening-hours-editor";
import { updateSettingsAction } from "@/lib/actions/settings";
import type { ActionResult } from "@/lib/actions/auth";
import type { Restaurant, RestaurantSettings } from "@/lib/types/domain";

const initialState: ActionResult = {};

export function SettingsForm({
  restaurant,
  settings,
}: {
  restaurant: Restaurant;
  settings: RestaurantSettings | null;
}) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, initialState);
  const [logoUrl, setLogoUrl] = useState(settings?.logo_url ?? null);
  const [faviconUrl, setFaviconUrl] = useState(settings?.favicon_url ?? null);
  const [heroUrl, setHeroUrl] = useState(settings?.hero_image_url ?? null);
  const [openingHours, setOpeningHours] = useState(settings?.opening_hours ?? {});

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <form action={formAction} className="space-y-6 pb-8">
      <input type="hidden" name="logo_url" value={logoUrl ?? ""} />
      <input type="hidden" name="favicon_url" value={faviconUrl ?? ""} />
      <input type="hidden" name="hero_image_url" value={heroUrl ?? ""} />
      <input type="hidden" name="opening_hours" value={JSON.stringify(openingHours)} />

      <Card>
        <CardHeader>
          <CardTitle>Identidad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre del restaurante</Label>
            <Input id="name" name="name" defaultValue={restaurant.name} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tagline">Mensaje corto (tagline)</Label>
            <Textarea id="tagline" name="tagline" rows={2} defaultValue={settings?.tagline ?? ""} maxLength={160} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={settings?.description ?? ""} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Logo</Label>
              <SingleImageUploader folder="branding" value={logoUrl} onChange={setLogoUrl} aspect="aspect-square" />
            </div>
            <div className="space-y-1.5">
              <Label>Favicon</Label>
              <SingleImageUploader folder="branding" value={faviconUrl} onChange={setFaviconUrl} aspect="aspect-square" />
            </div>
            <div className="space-y-1.5 sm:col-span-1">
              <Label>Imagen principal (hero)</Label>
              <SingleImageUploader folder="branding" value={heroUrl} onChange={setHeroUrl} aspect="aspect-square" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="primary_color">Color primario</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primary_color"
                  name="primary_color"
                  type="color"
                  defaultValue={settings?.primary_color ?? "#171717"}
                  className="h-10 w-14 p-1"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accent_color">Color de acento</Label>
              <Input
                id="accent_color"
                name="accent_color"
                type="color"
                defaultValue={settings?.accent_color ?? "#d97706"}
                className="h-10 w-14 p-1"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Tipografía</Label>
              <Select name="font_family" defaultValue={settings?.font_family ?? "Inter"}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter (moderna)</SelectItem>
                  <SelectItem value="Playfair Display">Playfair Display (editorial)</SelectItem>
                  <SelectItem value="Poppins">Poppins (redondeada)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Modo por defecto</Label>
              <Select name="theme_default" defaultValue={settings?.theme_default ?? "system"}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                  <SelectItem value="system">Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacto y ubicación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="instagram_url">Instagram (URL)</Label>
              <Input id="instagram_url" name="instagram_url" defaultValue={settings?.instagram_url ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp_number">WhatsApp (solo números, con país)</Label>
              <Input id="whatsapp_number" name="whatsapp_number" defaultValue={settings?.whatsapp_number ?? ""} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Dirección</Label>
            <Textarea
              id="address"
              name="address"
              rows={2}
              placeholder={"Una sede por línea, ej.:\nCra. 78 #7D-12, Kennedy, Bogotá\nCra. 58 #128-84, Bogotá"}
              defaultValue={settings?.address ?? ""}
            />
            <p className="text-xs text-muted-foreground">
              Si el restaurante tiene más de una sede, escribe cada dirección en su propia línea — el pie de
              página genera automáticamente un enlace de Google Maps para cada una.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="currency">Moneda</Label>
              <Input id="currency" name="currency" defaultValue={settings?.currency ?? "COP"} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="locale">Idioma</Label>
              <Input id="locale" name="locale" defaultValue={settings?.locale ?? "es"} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horarios de atención</CardTitle>
        </CardHeader>
        <CardContent>
          <OpeningHoursEditor value={openingHours} onChange={setOpeningHours} />
        </CardContent>
      </Card>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Guardar configuración
      </Button>
    </form>
  );
}
