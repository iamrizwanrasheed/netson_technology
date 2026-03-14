import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useRetellCalls, type NormalizedCall } from "@/hooks/useRetellCalls";
import { format } from "date-fns";
import { Phone, PhoneIncoming, PhoneOutgoing, Search, TrendingUp, Clock, ChevronLeft, ChevronRight, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const PAGE_SIZE = 10;

export default function CallAnalytics() {
  const { data: callLogs = [], isLoading, isError, error, refetch } = useRetellCalls();
  const [search, setSearch] = useState("");
  const [directionFilter, setDirectionFilter] = useState<string>("all");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLogs = useMemo(() => {
    return callLogs.filter((log) => {
      if (search && !log.sessionId.includes(search) && !log.fromNumber.includes(search) && !log.toNumber.includes(search)) return false;
      if (directionFilter !== "all" && log.direction !== directionFilter) return false;
      if (outcomeFilter !== "all" && log.outcome !== outcomeFilter) return false;
      if (sentimentFilter !== "all" && log.sentiment !== sentimentFilter) return false;
      return true;
    });
  }, [callLogs, search, directionFilter, outcomeFilter, sentimentFilter]);

  // Reset to page 1 when filters change
  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
  const validPage = Math.min(currentPage, totalPages || 1);
  const paginatedLogs = filteredLogs.slice((validPage - 1) * PAGE_SIZE, validPage * PAGE_SIZE);

  const successRate = callLogs.length > 0
    ? Math.round((callLogs.filter((c) => c.outcome === "successful").length / callLogs.length) * 100)
    : 0;
  const avgDuration = callLogs.length > 0
    ? Math.round(callLogs.reduce((s, c) => s + c.durationSec, 0) / callLogs.length)
    : 0;
  const inbound = callLogs.filter((c) => c.direction === "inbound").length;
  const outbound = callLogs.filter((c) => c.direction === "outbound").length;

  const sentimentData = [
    { name: "Positive", value: callLogs.filter((c) => c.sentiment === "positive").length, color: "hsl(160,84%,39%)" },
    { name: "Neutral", value: callLogs.filter((c) => c.sentiment === "neutral").length, color: "hsl(200,80%,50%)" },
    { name: "Negative", value: callLogs.filter((c) => c.sentiment === "negative").length, color: "hsl(0,84%,60%)" },
  ];

  const directionData = [
    { name: "Inbound", value: inbound, color: "hsl(160,84%,39%)" },
    { name: "Outbound", value: outbound, color: "hsl(36,100%,50%)" },
  ];

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleFilterChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Call Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoading ? "Loading call data from Cloud AI..." : `${callLogs.length} calls loaded from Cloud AI.`}
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

        {/* Error state */}
        {isError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Failed to load calls</p>
              <p className="text-xs text-destructive/80 mt-1">{(error as Error)?.message || "Unknown error"}</p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Content - shown when loaded */}
        {!isLoading && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Success Rate", value: `${successRate}%`, icon: TrendingUp, color: "text-success" },
                { label: "Avg Duration", value: formatDuration(avgDuration), icon: Clock, color: "text-info" },
                { label: "Total Calls", value: callLogs.length, icon: Phone, color: "text-primary" },
                { label: "Inbound", value: `${inbound}/${outbound} out`, icon: PhoneIncoming, color: "text-warning" },
              ].map((item) => (
                <div key={item.label} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
                  </div>
                  <p className="text-xl font-bold">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold mb-3">Sentiment Distribution</h3>
                <div className="h-48 flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" paddingAngle={3}>
                        {sentimentData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 shrink-0 pr-4">
                    {sentimentData.map((s) => (
                      <div key={s.name} className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                        <span className="text-muted-foreground">{s.name}: {s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold mb-3">Direction Split</h3>
                <div className="h-48 flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={directionData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" paddingAngle={3}>
                        {directionData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 shrink-0 pr-4">
                    {directionData.map((d) => (
                      <div key={d.name} className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="text-muted-foreground">{d.name}: {d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Call History */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 flex-1 min-w-[200px] max-w-sm">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search phone or call ID..."
                      className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
                      value={search}
                      onChange={handleSearchChange}
                    />
                  </div>
                  {[
                    { label: "Direction", value: directionFilter, set: setDirectionFilter, options: ["all", "inbound", "outbound"] },
                    { label: "Outcome", value: outcomeFilter, set: setOutcomeFilter, options: ["all", "successful", "unsuccessful"] },
                    { label: "Sentiment", value: sentimentFilter, set: setSentimentFilter, options: ["all", "positive", "neutral", "negative"] },
                  ].map((f) => (
                    <select
                      key={f.label}
                      value={f.value}
                      onChange={handleFilterChange(f.set)}
                      className="text-xs bg-muted border-0 rounded-lg px-3 py-2 text-foreground outline-none cursor-pointer"
                    >
                      {f.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {f.label}: {opt === "all" ? "All" : opt}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      {["Time", "Duration", "Channel", "Call ID", "End Reason", "Status", "Sentiment", "From", "To", "Direction", "Outcome", "Latency"].map((h) => (
                        <th key={h} className="text-left text-[11px] font-semibold text-muted-foreground px-4 py-2.5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          {callLogs.length === 0 ? "No calls found." : "No calls match the current filters."}
                        </td>
                      </tr>
                    ) : (
                      paginatedLogs.map((log) => (
                        <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-2.5 whitespace-nowrap text-xs">{format(new Date(log.timestamp), "MMM dd, HH:mm")}</td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-xs font-mono">{formatDuration(log.durationSec)}</td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-xs capitalize">{log.channelType}</td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-xs font-mono text-muted-foreground" title={log.sessionId}>
                            {log.sessionId.length > 16 ? `${log.sessionId.slice(0, 16)}...` : log.sessionId}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-xs capitalize">{log.endReason.replace(/_/g, " ")}</td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              log.sessionStatus === "completed" ? "bg-success/10 text-success"
                              : log.sessionStatus === "failed" ? "bg-destructive/10 text-destructive"
                              : "bg-warning/10 text-warning"
                            }`}>
                              {log.sessionStatus}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              log.sentiment === "positive" ? "bg-success/10 text-success"
                              : log.sentiment === "negative" ? "bg-destructive/10 text-destructive"
                              : "bg-info/10 text-info"
                            }`}>
                              {log.sentiment}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-xs font-mono">{log.fromNumber}</td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-xs font-mono">{log.toNumber}</td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            {log.direction === "inbound" ? (
                              <span className="flex items-center gap-1 text-xs text-success"><PhoneIncoming className="w-3 h-3" /> In</span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-warning"><PhoneOutgoing className="w-3 h-3" /> Out</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span className={`text-[10px] font-medium ${log.outcome === "successful" ? "text-success" : "text-destructive"}`}>
                              {log.outcome}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-xs font-mono">{log.latencyMs}ms</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredLogs.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Showing {((validPage - 1) * PAGE_SIZE) + 1}–{Math.min(validPage * PAGE_SIZE, filteredLogs.length)} of {filteredLogs.length} calls
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={validPage <= 1}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      // Show pages around current page for large page counts
                      let page: number;
                      if (totalPages <= 7) {
                        page = i + 1;
                      } else if (validPage <= 4) {
                        page = i + 1;
                      } else if (validPage >= totalPages - 3) {
                        page = totalPages - 6 + i;
                      } else {
                        page = validPage - 3 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                            page === validPage
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={validPage >= totalPages}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
