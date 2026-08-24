"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface ChecklistItem {
  id: string;
  name: string;
  icon?: string | null;
}

export function ChecklistSelector({
  items,
  selectedIds,
  onChange,
  onCreate,
  addLabel,
}: {
  items: ChecklistItem[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onCreate?: (name: string, icon: string) => Promise<ChecklistItem>;
  addLabel: string;
}) {
  const [localItems, setLocalItems] = useState(items);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [isPending, startTransition] = useTransition();

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  }

  function handleCreate() {
    if (!onCreate || !newName.trim()) return;
    startTransition(async () => {
      const created = await onCreate(newName.trim(), newIcon.trim());
      setLocalItems((prev) => [...prev, created]);
      onChange([...selectedIds, created.id]);
      setNewName("");
      setNewIcon("");
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {localItems.map((item) => {
          const checked = selectedIds.includes(item.id);
          return (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm has-[[data-state=checked]]:border-foreground has-[[data-state=checked]]:bg-foreground has-[[data-state=checked]]:text-background"
            >
              <Checkbox checked={checked} onCheckedChange={() => toggle(item.id)} className="sr-only" />
              {item.icon} {item.name}
            </label>
          );
        })}
      </div>

      {onCreate && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Emoji"
            value={newIcon}
            onChange={(e) => setNewIcon(e.target.value)}
            className="w-16"
            maxLength={4}
          />
          <Input
            placeholder={addLabel}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreate())}
          />
          <Button type="button" variant="outline" size="sm" onClick={handleCreate} disabled={isPending}>
            <Plus className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
