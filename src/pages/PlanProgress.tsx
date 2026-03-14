import { useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlanTimeline } from "@/components/dashboard/PlanTimeline";
import { plan, milestones } from "@/data/mockData";
import { useRetellCalls } from "@/hooks/useRetellCalls";
import { Clock, Zap, TrendingUp, Phone, CheckCircle } from "lucide-react";

export default function PlanProgress() {
  const { data: callLogs = [] } = useRetellCalls();

  const totalMinutesUsed = useMemo(
    () => Math.round(callLogs.reduce((sum, c) => sum + c.durationSec, 0) / 60),
    [callLogs]
  );

  const remaining = plan.minutesAllocated - totalMinutesUsed;
  const consumedPct = plan.minutesAllocated > 0
    ? Math.round((totalMinutesUsed / plan.minutesAllocated) * 100)
    : 0;
  const completedSteps = milestones.filter((m) => m.status === "completed").length;
  const currentStep = milestones.find((m) => m.status === "current");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Plan Progress</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your project milestones and plan status.
          </p>
        </div>

        {/* Plan Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="kpi-card-1 rounded-xl p-5 text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium uppercase tracking-wider opacity-80">Total Minutes</span>
                <Zap className="w-5 h-5 opacity-70" />
              </div>
              <p className="text-2xl font-bold">{plan.minutesAllocated.toLocaleString()}</p>
              <p className="text-xs mt-1 opacity-75">Allocated to your plan</p>
            </div>
          </div>

          <div className="kpi-card-2 rounded-xl p-5 text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium uppercase tracking-wider opacity-80">Consumed</span>
                <Clock className="w-5 h-5 opacity-70" />
              </div>
              <p className="text-2xl font-bold">{totalMinutesUsed.toLocaleString()}</p>
              <p className="text-xs mt-1 opacity-75">{consumedPct}% of total used</p>
            </div>
          </div>

          <div className="kpi-card-3 rounded-xl p-5 text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium uppercase tracking-wider opacity-80">Remaining</span>
                <TrendingUp className="w-5 h-5 opacity-70" />
              </div>
              <p className="text-2xl font-bold">{Math.max(remaining, 0).toLocaleString()}</p>
              <p className="text-xs mt-1 opacity-75">{Math.max(100 - consumedPct, 0)}% remaining</p>
            </div>
          </div>

          <div className="kpi-card-4 rounded-xl p-5 text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium uppercase tracking-wider opacity-80">Total Calls</span>
                <Phone className="w-5 h-5 opacity-70" />
              </div>
              <p className="text-2xl font-bold">{callLogs.length.toLocaleString()}</p>
              <p className="text-xs mt-1 opacity-75">Calls received</p>
            </div>
          </div>
        </div>

        {/* Minutes Consumption Bar */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Minutes Consumption</h3>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
              {consumedPct}% used
            </span>
          </div>
          <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${Math.min(consumedPct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{totalMinutesUsed.toLocaleString()} min consumed</span>
            <span>{Math.max(remaining, 0).toLocaleString()} min remaining</span>
          </div>
        </div>

        {/* Current Step Highlight */}
        {currentStep && (
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Current Phase</p>
                <h3 className="text-base font-semibold">{currentStep.stepName}</h3>
                <p className="text-sm text-muted-foreground mt-1">{currentStep.notes}</p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                  Step {currentStep.stepOrder} of {milestones.length} &bull; {completedSteps} completed
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-card rounded-xl border border-border p-6 max-w-2xl">
          <PlanTimeline />
        </div>
      </div>
    </DashboardLayout>
  );
}
