import { useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlanTimeline } from "@/components/dashboard/PlanTimeline";
import { KPICard } from "@/components/dashboard/KPICard";
import { plan, appointments } from "@/data/mockData";
import { useRetellCalls } from "@/hooks/useRetellCalls";
import { Activity, Clock, Phone, CalendarDays } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, startOfDay, subDays } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { getActiveOrder } from "@/services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.first_name || user?.display_name?.split(" ")[0] || "there";
  const { data: callLogs = [] } = useRetellCalls();

  useEffect(() => {
    getActiveOrder()
      .then((data) => console.log("Active Order Response:", data))
      .catch((err) => console.error("Active Order Error:", err));
  }, []);

  const successRate = callLogs.length > 0
    ? Math.round((callLogs.filter((c) => c.outcome === "successful").length / callLogs.length) * 100)
    : 0;

  const totalMinutesUsed = useMemo(
    () => Math.round(callLogs.reduce((sum, c) => sum + c.durationSec, 0) / 60),
    [callLogs]
  );

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

  const upcomingAppts = appointments.filter((a) => a.status !== "cancelled").slice(0, 3);

  return (
    <DashboardLayout rightPanel={<PlanTimeline />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, {firstName}. Here's your overview.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Plan Progress"
            value="60%"
            subtitle="Testing & QA phase"
            icon={Activity}
            variant={1}
          />
          <KPICard
            title="Minutes Used"
            value={`${totalMinutesUsed.toLocaleString()}`}
            subtitle={`${plan.minutesAllocated.toLocaleString()} allocated`}
            icon={Clock}
            variant={2}
          >
            <div className="mt-2 w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full"
                style={{ width: `${Math.min((totalMinutesUsed / plan.minutesAllocated) * 100, 100)}%` }}
              />
            </div>
          </KPICard>
          <KPICard
            title="Total Calls"
            value={callLogs.length.toLocaleString()}
            subtitle={`${successRate}% success rate`}
            icon={Phone}
            variant={3}
          />
        </div>

        {/* Chart */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Daily Call Volume & Minutes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyStats}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160,84%,39%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160,84%,39%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(200,80%,50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(200,80%,50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(220,13%,91%)" }} />
                <Area type="monotone" dataKey="calls" stroke="hsl(160,84%,39%)" fill="url(#colorCalls)" strokeWidth={2} />
                <Area type="monotone" dataKey="minutes" stroke="hsl(200,80%,50%)" fill="url(#colorMins)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 gap-4">
          {/* Upcoming Appointments */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Upcoming Appointments</h3>
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {upcomingAppts.map((appt) => (
                <div key={appt.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{appt.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(appt.start), "MMM dd, h:mm a")} • {appt.location}
                    </p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    appt.status === "confirmed"
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  }`}>
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
