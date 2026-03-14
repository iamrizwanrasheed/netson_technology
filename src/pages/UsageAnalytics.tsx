import { useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { plan } from "@/data/mockData";
import { useRetellCalls } from "@/hooks/useRetellCalls";
import { Clock, Phone, TrendingUp, Zap, Loader2, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { format, startOfDay, subDays } from "date-fns";

export default function UsageAnalytics() {
  const { data: callLogs = [], isLoading, refetch } = useRetellCalls();

  const totalMinutesUsed = useMemo(
    () => Math.round(callLogs.reduce((sum, c) => sum + c.durationSec, 0) / 60),
    [callLogs]
  );

  const remaining = plan.minutesAllocated - totalMinutesUsed;
  const consumedPct = plan.minutesAllocated > 0
    ? Math.round((totalMinutesUsed / plan.minutesAllocated) * 100)
    : 0;

  // Build daily stats from real call data (last 30 days)
  const dailyStats = useMemo(() => {
    const now = new Date();
    const days: { date: string; calls: number; minutes: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const day = startOfDay(subDays(now, i));
      const dayEnd = new Date(day.getTime() + 86400000);
      const dayCalls = callLogs.filter((c) => {
        const t = new Date(c.timestamp);
        return t >= day && t < dayEnd;
      });
      days.push({
        date: format(day, "MMM dd"),
        calls: dayCalls.length,
        minutes: Math.round(dayCalls.reduce((s, c) => s + c.durationSec, 0) / 60),
      });
    }
    return days;
  }, [callLogs]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Usage Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoading ? "Loading usage data..." : "Monitor your minutes consumption and call volume."}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 text-xs bg-muted hover:bg-muted/80 rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Allocated", value: plan.minutesAllocated.toLocaleString(), unit: "min", icon: Zap, color: "text-primary" },
                { label: "Consumed", value: totalMinutesUsed.toLocaleString(), unit: "min", icon: Clock, color: "text-info" },
                { label: "Remaining", value: Math.max(remaining, 0).toLocaleString(), unit: "min", icon: TrendingUp, color: "text-success" },
                { label: "Total Calls", value: callLogs.length.toLocaleString(), unit: "", icon: Phone, color: "text-warning" },
              ].map((item) => (
                <div key={item.label} className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{item.label}</span>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{item.value} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span></p>
                </div>
              ))}
            </div>

            {/* Minutes progress */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold mb-3">Minutes Consumption</h3>
              <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(consumedPct, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{consumedPct}% used</span>
                <span>{Math.max(remaining, 0).toLocaleString()} min remaining</span>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold mb-4">Daily Minutes</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyStats}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Bar dataKey="minutes" fill="hsl(200,80%,50%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold mb-4">Daily Calls</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyStats}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Line type="monotone" dataKey="calls" stroke="hsl(160,84%,39%)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
