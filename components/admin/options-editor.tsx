"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductFormValues } from "@/lib/validation/product";

type OptionGroup = ProductFormValues["options"][number];

export function OptionsEditor({
  value,
  onChange,
}: {
  value: OptionGroup[];
  onChange: (next: OptionGroup[]) => void;
}) {
  function addGroup() {
    onChange([
      ...value,
      { name: "", selection_type: "single", is_required: false, values: [{ label: "", price_delta: 0, is_default: false }] },
    ]);
  }

  function updateGroup(index: number, patch: Partial<OptionGroup>) {
    onChange(value.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  }

  function removeGroup(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      {value.map((group, gi) => (
        <div key={gi} className="rounded-2xl border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Nombre del grupo (ej. Tamaño)"
              value={group.name}
              onChange={(e) => updateGroup(gi, { name: e.target.value })}
              className="max-w-xs"
            />
            <Select
              value={group.selection_type}
              onValueChange={(v) => updateGroup(gi, { selection_type: v as OptionGroup["selection_type"] })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Elegir una</SelectItem>
                <SelectItem value="multiple">Elegir varias</SelectItem>
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={group.is_required}
                onCheckedChange={(v) => updateGroup(gi, { is_required: Boolean(v) })}
              />
              Obligatorio
            </label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="ml-auto text-muted-foreground"
              onClick={() => removeGroup(gi)}
              aria-label="Eliminar grupo"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          <div className="mt-3 space-y-2">
            {group.values.map((val, vi) => (
              <div key={vi} className="flex items-center gap-2">
                <Input
                  placeholder="Opción (ej. Grande)"
                  value={val.label}
                  onChange={(e) =>
                    updateGroup(gi, {
                      values: group.values.map((v, i) => (i === vi ? { ...v, label: e.target.value } : v)),
                    })
                  }
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="+ precio"
                  value={val.price_delta || ""}
                  onChange={(e) =>
                    updateGroup(gi, {
                      values: group.values.map((v, i) =>
                        i === vi ? { ...v, price_delta: Number(e.target.value) || 0 } : v
                      ),
                    })
                  }
                  className="w-32"
                />
                <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                  <Checkbox
                    checked={val.is_default}
                    onCheckedChange={(checked) =>
                      updateGroup(gi, {
                        values: group.values.map((v, i) => ({
                          ...v,
                          is_default: i === vi ? Boolean(checked) : group.selection_type === "single" ? false : v.is_default,
                        })),
                      })
                    }
                  />
                  Por defecto
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    updateGroup(gi, { values: group.values.filter((_, i) => i !== vi) })
                  }
                  aria-label="Eliminar opción"
                >
                  <Trash2 className="size-3.5 text-muted-foreground" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                updateGroup(gi, {
                  values: [...group.values, { label: "", price_delta: 0, is_default: false }],
                })
              }
            >
              <Plus className="size-3.5" /> Agregar opción
            </Button>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addGroup}>
        <Plus className="size-4" /> Agregar grupo de opciones
      </Button>
    </div>
  );
}
