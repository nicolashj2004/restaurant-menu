export function AnalyticsBarList({
  items,
}: {
  items: { label: string; value: number; suffix?: string }[];
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Aún no hay suficientes datos.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium">
              {i + 1}. {item.label}
            </span>
            <span className="text-muted-foreground">
              {item.value}
              {item.suffix ?? ""}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[color:var(--restaurant-accent,var(--primary))] transition-all"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
