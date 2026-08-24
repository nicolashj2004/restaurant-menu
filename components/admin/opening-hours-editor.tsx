"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { OpeningHours, OpeningHoursDay } from "@/lib/types/database";

const DAYS: { key: keyof OpeningHours; label: string }[] = [
  { key: "mon", label: "Lunes" },
  { key: "tue", label: "Martes" },
  { key: "wed", label: "Miércoles" },
  { key: "thu", label: "Jueves" },
  { key: "fri", label: "Viernes" },
  { key: "sat", label: "Sábado" },
  { key: "sun", label: "Domingo" },
];

export function OpeningHoursEditor({
  value,
  onChange,
}: {
  value: OpeningHours;
  onChange: (next: OpeningHours) => void;
}) {
  function setRanges(day: keyof OpeningHours, ranges: OpeningHoursDay[] | undefined) {
    onChange({ ...value, [day]: ranges });
  }

  return (
    <div className="space-y-3">
      {DAYS.map(({ key, label }) => {
        const ranges = value[key] ?? [];
        const isOpen = ranges.length > 0;
        return (
          <div key={key} className="rounded-xl border p-3">
            <div className="flex items-center justify-between">
              <span className="w-24 shrink-0 text-sm font-medium">{label}</span>
              <Switch
                checked={isOpen}
                onCheckedChange={(checked) =>
                  setRanges(key, checked ? [{ open: "12:00", close: "22:00" }] : [])
                }
              />
            </div>
            {isOpen && (
              <div className="mt-2 space-y-2">
                {ranges.map((range, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={range.open}
                      onChange={(e) =>
                        setRanges(
                          key,
                          ranges.map((r, ri) => (ri === i ? { ...r, open: e.target.value } : r))
                        )
                      }
                      className="w-32"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      type="time"
                      value={range.close}
                      onChange={(e) =>
                        setRanges(
                          key,
                          ranges.map((r, ri) => (ri === i ? { ...r, close: e.target.value } : r))
                        )
                      }
                      className="w-32"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setRanges(key, ranges.filter((_, ri) => ri !== i))}
                      aria-label="Eliminar horario"
                    >
                      <Trash2 className="size-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRanges(key, [...ranges, { open: "12:00", close: "22:00" }])}
                >
                  <Plus className="size-3.5" /> Agregar franja
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
