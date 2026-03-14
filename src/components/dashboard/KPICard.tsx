import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 1 | 2 | 3 | 4;
  children?: ReactNode;
}

export function KPICard({ title, value, subtitle, icon: Icon, variant = 1, children }: KPICardProps) {
  return (
    <div className={`kpi-card-${variant} rounded-xl p-5 text-primary-foreground relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium uppercase tracking-wider opacity-80">{title}</span>
          <Icon className="w-5 h-5 opacity-70" />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && <p className="text-xs mt-1 opacity-75">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
