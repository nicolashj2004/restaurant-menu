"use client";

import { MapPin, MessageCircle, Clock } from "lucide-react";
import { InstagramIcon } from "@/components/icons/instagram-icon";
import { useMenu } from "@/components/menu/restaurant-provider";
import { isRestaurantOpenNow } from "@/lib/menu-utils";

const DAY_LABELS: Record<string, string> = {
  mon: "Lunes",
  tue: "Martes",
  wed: "Miércoles",
  thu: "Jueves",
  fri: "Viernes",
  sat: "Sábado",
  sun: "Domingo",
};

export function SiteFooter() {
  const { restaurant, settings } = useMenu();
  const open = isRestaurantOpenNow(settings);

  return (
    <footer className="mt-12 border-t bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="font-heading text-xl font-semibold">{restaurant.name}</h3>
            {settings?.description && (
              <p className="mt-2 max-w-md text-sm text-muted-foreground">{settings.description}</p>
            )}
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className={open ? "text-emerald-600" : "text-rose-500"}>●</span>
              {open ? "Abierto ahora" : "Cerrado ahora"}
            </div>
            <div className="mt-3 flex gap-2">
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm hover:bg-muted"
                >
                  <InstagramIcon className="size-4" /> Instagram
                </a>
              )}
              {settings?.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm hover:bg-muted"
                >
                  <MessageCircle className="size-4" /> WhatsApp
                </a>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {settings?.address && (
              <div className="flex gap-2 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p>{settings.address}</p>
                  {settings.google_maps_url && (
                    <a
                      href={settings.google_maps_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[color:var(--restaurant-accent)] underline underline-offset-2"
                    >
                      Ver en Google Maps
                    </a>
                  )}
                </div>
              </div>
            )}
            {settings?.opening_hours && (
              <div className="flex gap-2 text-sm">
                <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <ul className="space-y-0.5 text-muted-foreground">
                  {Object.entries(DAY_LABELS).map(([key, label]) => {
                    const openingHours = settings.opening_hours;
                    const ranges = openingHours[key as keyof typeof openingHours];
                    return (
                      <li key={key}>
                        <span className="text-foreground">{label}:</span>{" "}
                        {ranges?.length ? ranges.map((r) => `${r.open}–${r.close}`).join(", ") : "Cerrado"}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {restaurant.name}. Menú digital.
        </p>
      </div>
    </footer>
  );
}
