import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  trend?: "up" | "down";
}

export function StatsCard({ title, value, icon: Icon, change, trend }: StatsCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-body">{title}</p>
          <p className="mt-1 text-2xl font-display font-bold text-foreground">{value}</p>
          {change && (
            <p
              className={`mt-1 text-xs font-medium ${
                trend === "up" ? "text-primary" : "text-destructive"
              }`}
            >
              {trend === "up" ? "↑" : "↓"} {change}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-plum-light p-2.5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
