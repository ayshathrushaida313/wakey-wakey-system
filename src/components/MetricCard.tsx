import { type LucideIcon } from "lucide-react";

export function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "primary" | "success" | "warning" | "destructive";
}) {
  const toneMap = {
    default: "text-foreground bg-muted",
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    destructive: "text-destructive bg-destructive/10",
  } as const;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-card p-5 shadow-card transition-all hover:border-primary/40">
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${toneMap[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4 font-display text-3xl font-bold tracking-tight">
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
