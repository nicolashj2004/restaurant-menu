"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function IngredientInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function addIngredient() {
    const name = draft.trim();
    if (!name || value.some((v) => v.toLowerCase() === name.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, name]);
    setDraft("");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((ingredient) => (
          <Badge key={ingredient} variant="secondary" className="gap-1 py-1.5 pl-3 pr-1.5">
            {ingredient}
            <button
              type="button"
              aria-label={`Quitar ${ingredient}`}
              onClick={() => onChange(value.filter((v) => v !== ingredient))}
              className="rounded-full p-0.5 hover:bg-muted-foreground/20"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        className="mt-2"
        placeholder="Escribe un ingrediente y presiona Enter"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addIngredient();
          }
        }}
        onBlur={addIngredient}
      />
    </div>
  );
}
