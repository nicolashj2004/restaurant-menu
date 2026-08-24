import { cn } from "@/lib/utils";

export function SectionHeading({
  icon,
  title,
  subtitle,
  className,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 px-4 sm:px-0", className)}>
      <h2 className="font-heading flex items-center gap-2 text-2xl font-semibold tracking-tight">
        {icon && <span aria-hidden>{icon}</span>}
        {title}
      </h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
