const RETELL_BASE_URL = "/api/retell";

// --- Types matching Retell API v2 ---

export interface RetellCallAnalysis {
  call_successful?: boolean;
  call_summary?: string;
  user_sentiment?: "Negative" | "Positive" | "Neutral" | "Unknown";
  custom_analysis_data?: unknown;
  in_voicemail?: boolean;
}

export interface RetellLatencyStats {
  max?: number;
  min?: number;
  p50?: number;
  p90?: number;
  p95?: number;
  p99?: number;
  num?: number;
}

export interface RetellLatency {
  e2e?: RetellLatencyStats;
  llm?: RetellLatencyStats;
  tts?: RetellLatencyStats;
  asr?: RetellLatencyStats;
  knowledge_base?: RetellLatencyStats;
  s2s?: RetellLatencyStats;
}

export interface RetellCall {
  call_id: string;
  call_type: "web_call" | "phone_call";
  call_status: "registered" | "not_connected" | "ongoing" | "ended" | "error";
  agent_id: string;
  agent_version?: number;
  agent_name?: string;
  direction?: "inbound" | "outbound";
  from_number?: string;
  to_number?: string;
  start_timestamp?: number;
  end_timestamp?: number;
  duration_ms?: number;
  transcript?: string;
  recording_url?: string;
  disconnection_reason?: string;
  call_analysis?: RetellCallAnalysis;
  call_cost?: {
    combined_cost?: number;
    total_duration_seconds?: number;
  };
  latency?: RetellLatency;
  metadata?: unknown;
  public_log_url?: string;
}

export interface RetellFilterCriteria {
  agent_id?: string[];
  call_type?: ("web_call" | "phone_call")[];
  call_status?: ("not_connected" | "ongoing" | "ended" | "error")[];
  direction?: ("inbound" | "outbound")[];
  from_number?: string[];
  to_number?: string[];
  call_successful?: boolean[];
  user_sentiment?: ("Negative" | "Positive" | "Neutral" | "Unknown")[];
  disconnection_reason?: string[];
  start_timestamp?: { lower_threshold?: number; upper_threshold?: number };
  end_timestamp?: { lower_threshold?: number; upper_threshold?: number };
  duration_ms?: { lower_threshold?: number; upper_threshold?: number };
  in_voicemail?: boolean[];
}

export interface RetellListCallsParams {
  limit?: number;
  pagination_key?: string;
  sort_order?: "ascending" | "descending";
  filter_criteria?: RetellFilterCriteria;
}

// --- API functions ---

async function retellRequest<T>(apiKey: string, endpoint: string, body?: unknown): Promise<T> {
  const res = await fetch(`${RETELL_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.error_message || error.message || `Retell API error: ${res.status}`);
  }

  return res.json();
}

export async function listCalls(apiKey: string, params?: RetellListCallsParams): Promise<RetellCall[]> {
  return retellRequest<RetellCall[]>(apiKey, "/v2/list-calls", params ?? {});
}

export async function getCall(apiKey: string, callId: string): Promise<RetellCall> {
  const res = await fetch(`${RETELL_BASE_URL}/v2/get-call/${callId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.error_message || error.message || `Cloud AI API error: ${res.status}`);
  }

  return res.json();
}

// --- Helper to fetch ALL calls with pagination ---

export async function listAllCalls(
  apiKey: string,
  filter?: RetellFilterCriteria,
  maxCalls = 1000
): Promise<RetellCall[]> {
  const allCalls: RetellCall[] = [];
  let paginationKey: string | undefined;

  while (allCalls.length < maxCalls) {
    const batchSize = Math.min(1000, maxCalls - allCalls.length);
    const batch = await listCalls(apiKey, {
      limit: batchSize,
      sort_order: "descending",
      pagination_key: paginationKey,
      filter_criteria: filter,
    });

    if (batch.length === 0) break;
    allCalls.push(...batch);
    paginationKey = batch[batch.length - 1].call_id;

    if (batch.length < batchSize) break;
  }

  return allCalls;
}
