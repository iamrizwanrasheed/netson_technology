import { useQuery } from "@tanstack/react-query";
import { listAllCalls, type RetellCall, type RetellFilterCriteria } from "@/services/retellApi";
import { useAuth } from "@/context/AuthContext";

export interface NormalizedCall {
  id: string;
  timestamp: string;
  durationSec: number;
  channelType: "phone" | "web" | "sip";
  sessionId: string;
  endReason: string;
  sessionStatus: "completed" | "failed" | "transferred" | "voicemail";
  sentiment: "positive" | "neutral" | "negative";
  fromNumber: string;
  toNumber: string;
  direction: "inbound" | "outbound";
  outcome: "successful" | "unsuccessful";
  latencyMs: number;
  callSummary?: string;
  recordingUrl?: string;
}

function mapStatus(call: RetellCall): NormalizedCall["sessionStatus"] {
  if (call.call_status === "ended") {
    if (call.call_analysis?.in_voicemail) return "voicemail";
    if (call.disconnection_reason === "call_transfer") return "transferred";
    return "completed";
  }
  if (call.call_status === "error" || call.call_status === "not_connected") return "failed";
  return "completed";
}

function mapSentiment(sentiment?: string): NormalizedCall["sentiment"] {
  if (!sentiment) return "neutral";
  const lower = sentiment.toLowerCase();
  if (lower === "positive") return "positive";
  if (lower === "negative") return "negative";
  return "neutral";
}

function mapChannel(call: RetellCall): NormalizedCall["channelType"] {
  if (call.call_type === "web_call") return "web";
  return "phone";
}

function normalizeCall(call: RetellCall): NormalizedCall {
  const durationMs = call.duration_ms ?? 0;
  const e2eLatency = call.latency?.e2e?.p50 ?? call.latency?.e2e?.p90 ?? 0;

  return {
    id: call.call_id,
    timestamp: call.start_timestamp
      ? new Date(call.start_timestamp).toISOString()
      : new Date().toISOString(),
    durationSec: Math.round(durationMs / 1000),
    channelType: mapChannel(call),
    sessionId: call.call_id,
    endReason: call.disconnection_reason ?? "unknown",
    sessionStatus: mapStatus(call),
    sentiment: mapSentiment(call.call_analysis?.user_sentiment),
    fromNumber: call.from_number ?? "N/A",
    toNumber: call.to_number ?? "N/A",
    direction: call.direction ?? "inbound",
    outcome: call.call_analysis?.call_successful !== false ? "successful" : "unsuccessful",
    latencyMs: Math.round(e2eLatency),
    callSummary: call.call_analysis?.call_summary,
    recordingUrl: call.recording_url,
  };
}

export function useRetellCalls(filter?: RetellFilterCriteria) {
  const { user } = useAuth();
  const apiKey = user?.call_agent_api_key;

  return useQuery({
    queryKey: ["retell-calls", apiKey, filter],
    queryFn: async () => {
      const rawCalls = await listAllCalls(apiKey!, filter);
      return rawCalls.map(normalizeCall);
    },
    enabled: !!apiKey,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
