import type { Tag } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

const SPICE_EMOJI = ["", "🌶", "🌶🌶", "🌶🌶🌶"];

export function ProductBadges({
  tags,
  spiceLevel = 0,
  className,
}: {
  tags: Tag[];
  spiceLevel?: number;
  className?: string;
}) {
  if (tags.length === 0 && spiceLevel === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {spiceLevel > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {SPICE_EMOJI[Math.min(spiceLevel, 3)]}
        </span>
      )}
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm"
        >
          {tag.icon} {tag.name}
        </span>
      ))}
    </div>
  );
}
