import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  subtitle?: string;
}

export function StatCard({ title, value, icon: Icon, trend, subtitle }: StatCardProps) {
  return (
    <Card className="border border-border bg-white hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
            <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
            {trend && (
              <p className={`text-xs font-medium mt-2 ${trend.positive ? "text-tennis-ball-green" : "text-clay-orange"}`}>
                {trend.positive ? "↑" : "↓"} {trend.value}
              </p>
            )}
          </div>
          <div className="p-2.5 rounded-lg bg-soft-lime/20 shrink-0">
            <Icon className="w-5 h-5 text-forest-green" />
          </div>
        </div>
      </div>
    </Card>
  );
}
