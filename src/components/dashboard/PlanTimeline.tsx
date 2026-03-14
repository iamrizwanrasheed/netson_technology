import { milestones, plan } from "@/data/mockData";
import { Check, Circle, Clock } from "lucide-react";

interface PlanTimelineProps {
  compact?: boolean;
}

export function PlanTimeline({ compact = false }: PlanTimelineProps) {
  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const progress = Math.round((completedCount / milestones.length) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold ${compact ? "text-sm" : "text-base"}`}>Your Plan</h3>
        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
          {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-muted rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="timeline-line" />
        <div className="space-y-6">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="flex gap-4 relative">
              <div
                className={`timeline-dot ${
                  milestone.status === "completed"
                    ? "timeline-dot-completed"
                    : milestone.status === "current"
                    ? "timeline-dot-current"
                    : "timeline-dot-pending"
                }`}
              >
                {milestone.status === "completed" ? (
                  <Check className="w-4 h-4" />
                ) : milestone.status === "current" ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <Circle className="w-3 h-3" />
                )}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <p
                  className={`text-sm font-medium ${
                    milestone.status === "completed"
                      ? "text-foreground"
                      : milestone.status === "current"
                      ? "text-accent"
                      : "text-muted-foreground"
                  }`}
                >
                  {milestone.stepName}
                </p>
                {!compact && milestone.notes && (
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {milestone.notes}
                  </p>
                )}
                {milestone.updatedAt && (
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {milestone.updatedAt}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!compact && (
        <div className="mt-6 p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{plan.name}</span> — Currently in{" "}
            <span className="font-medium text-accent">
              {milestones.find((m) => m.status === "current")?.stepName}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
