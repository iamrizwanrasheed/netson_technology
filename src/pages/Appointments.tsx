import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "@/services/api";
import { CalendarDays, X, Loader2 } from "lucide-react";

export default function Appointments() {
  const { user, refreshUser } = useAuth();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [embedCode, setEmbedCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const hasCalendar = !!user?.calendar_embed_code;

  const handleSubmit = async () => {
    const trimmed = embedCode.trim();
    if (!trimmed) return;

    setSaving(true);
    setError("");
    try {
      await updateProfile({ calendar_embed_code: trimmed });
      await refreshUser();
      setShowConnectModal(false);
      setEmbedCode("");
    } catch (err) {
      setError((err as Error).message || "Failed to save calendar. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Appointments</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {hasCalendar ? "Your Google Calendar schedule." : "Connect your calendar to view appointments."}
            </p>
          </div>
          {hasCalendar && (
            <button
              onClick={() => setShowConnectModal(true)}
              className="flex items-center gap-2 text-xs bg-muted hover:bg-muted/80 rounded-lg px-3 py-2 transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Update Calendar
            </button>
          )}
        </div>

        {hasCalendar ? (
          /* Calendar embed */
          <div
            className="bg-card rounded-xl border border-border overflow-hidden [&>iframe]:w-full [&>iframe]:border-0 [&>iframe]:min-h-[600px]"
            style={{ height: "calc(100vh - 200px)" }}
            dangerouslySetInnerHTML={{ __html: user!.calendar_embed_code! }}
          />
        ) : (
          /* Empty state - Connect prompt */
          <div className="flex flex-col items-center justify-center py-24 px-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <CalendarDays className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold mb-2">No calendar connected</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Connect your Google Calendar to view and manage your appointments directly from this dashboard.
            </p>
            <button
              onClick={() => setShowConnectModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              Connect Your Calendar
            </button>
          </div>
        )}
      </div>

      {/* Connect Calendar Modal */}
      {showConnectModal && (
        <>
          <div className="fixed inset-0 bg-foreground/40 z-40" onClick={() => !saving && setShowConnectModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl border border-border w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Connect Google Calendar</h2>
                <button
                  onClick={() => !saving && setShowConnectModal(false)}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground">
                Paste your Google Calendar iframe embed code below.
              </p>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Embed Code
                </label>
                <textarea
                  className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none min-h-[100px] resize-none placeholder:text-muted-foreground font-mono"
                  placeholder={'<iframe src="https://calendar.google.com/calendar/embed?src=..." ...></iframe>'}
                  value={embedCode}
                  onChange={(e) => {
                    setEmbedCode(e.target.value);
                    setError("");
                  }}
                  disabled={saving}
                />
              </div>

              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={!embedCode.trim() || saving}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Connect Calendar"
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
