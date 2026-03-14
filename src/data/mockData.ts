import { format, subDays, addDays, subHours } from "date-fns";

// --- Users & Tenants ---
export const currentUser = {
  id: "u1",
  email: "sarah@acmecorp.com",
  name: "Sarah Chen",
  role: "client" as const,
  companyId: "c1",
  avatar: "SC",
};

export const company = {
  id: "c1",
  name: "Acme Corporation",
};

// --- Plan & Milestones ---
export interface Milestone {
  id: string;
  planId: string;
  stepName: string;
  stepOrder: number;
  status: "completed" | "current" | "pending";
  notes: string;
  updatedAt: string;
}

export const plan = {
  id: "p1",
  companyId: "c1",
  name: "AI Receptionist Pro",
  minutesAllocated: 5000,
  minutesConsumed: 3247,
  callsTotal: 1893,
};

export const milestones: Milestone[] = [
  { id: "m1", planId: "p1", stepName: "Research & Planning", stepOrder: 1, status: "completed", notes: "Requirements gathered, stakeholders aligned.", updatedAt: format(subDays(new Date(), 45), "yyyy-MM-dd") },
  { id: "m2", planId: "p1", stepName: "Process Design", stepOrder: 2, status: "completed", notes: "Call flows designed and approved.", updatedAt: format(subDays(new Date(), 30), "yyyy-MM-dd") },
  { id: "m3", planId: "p1", stepName: "Development", stepOrder: 3, status: "completed", notes: "AI model trained, integrations built.", updatedAt: format(subDays(new Date(), 14), "yyyy-MM-dd") },
  { id: "m4", planId: "p1", stepName: "Testing & QA", stepOrder: 4, status: "current", notes: "Running live call testing with sample data.", updatedAt: format(subDays(new Date(), 2), "yyyy-MM-dd") },
  { id: "m5", planId: "p1", stepName: "Deployment / Live", stepOrder: 5, status: "pending", notes: "", updatedAt: "" },
];

// --- Call Logs ---
export interface CallLog {
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
}

const endReasons = ["caller_hangup", "agent_hangup", "timeout", "transferred", "voicemail"];
const sentiments: CallLog["sentiment"][] = ["positive", "neutral", "negative"];
const statuses: CallLog["sessionStatus"][] = ["completed", "failed", "transferred", "voicemail"];
const channels: CallLog["channelType"][] = ["phone", "web", "sip"];
const directions: CallLog["direction"][] = ["inbound", "outbound"];
const outcomes: CallLog["outcome"][] = ["successful", "unsuccessful"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const callLogs: CallLog[] = Array.from({ length: 50 }, (_, i) => ({
  id: `cl-${i + 1}`,
  timestamp: format(subHours(new Date(), i * 3 + Math.random() * 5), "yyyy-MM-dd'T'HH:mm:ss"),
  durationSec: Math.floor(Math.random() * 600) + 30,
  channelType: randomFrom(channels),
  sessionId: `ses_${Math.random().toString(36).slice(2, 10)}`,
  endReason: randomFrom(endReasons),
  sessionStatus: randomFrom(statuses),
  sentiment: randomFrom(sentiments),
  fromNumber: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
  toNumber: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
  direction: randomFrom(directions),
  outcome: Math.random() > 0.25 ? "successful" : "unsuccessful",
  latencyMs: Math.floor(Math.random() * 800) + 100,
}));

// Daily stats for charts
export const dailyStats = Array.from({ length: 30 }, (_, i) => {
  const date = format(subDays(new Date(), 29 - i), "MMM dd");
  return {
    date,
    minutes: Math.floor(Math.random() * 180) + 40,
    calls: Math.floor(Math.random() * 80) + 10,
  };
});

// --- Appointments ---
export interface Appointment {
  id: string;
  title: string;
  start: string;
  end: string;
  attendees: string[];
  meetingLink: string;
  status: "confirmed" | "tentative" | "cancelled";
  location: string;
}

export const appointments: Appointment[] = [
  { id: "a1", title: "AI Integration Kickoff", start: format(addDays(new Date(), 1), "yyyy-MM-dd'T'10:00"), end: format(addDays(new Date(), 1), "yyyy-MM-dd'T'11:00"), attendees: ["sarah@acmecorp.com", "john@partner.io"], meetingLink: "https://meet.google.com/abc-defg-hij", status: "confirmed", location: "Google Meet" },
  { id: "a2", title: "Weekly Progress Review", start: format(addDays(new Date(), 2), "yyyy-MM-dd'T'14:00"), end: format(addDays(new Date(), 2), "yyyy-MM-dd'T'14:30"), attendees: ["sarah@acmecorp.com"], meetingLink: "https://meet.google.com/xyz-uvwx-yz", status: "confirmed", location: "Google Meet" },
  { id: "a3", title: "QA Testing Session", start: format(addDays(new Date(), 3), "yyyy-MM-dd'T'09:00"), end: format(addDays(new Date(), 3), "yyyy-MM-dd'T'10:30"), attendees: ["sarah@acmecorp.com", "qa@partner.io"], meetingLink: "https://zoom.us/j/123456", status: "tentative", location: "Zoom" },
  { id: "a4", title: "Stakeholder Demo", start: format(addDays(new Date(), 5), "yyyy-MM-dd'T'16:00"), end: format(addDays(new Date(), 5), "yyyy-MM-dd'T'17:00"), attendees: ["sarah@acmecorp.com", "cto@acmecorp.com", "pm@partner.io"], meetingLink: "https://meet.google.com/demo-call", status: "confirmed", location: "Google Meet" },
  { id: "a5", title: "Deployment Planning", start: format(addDays(new Date(), 7), "yyyy-MM-dd'T'11:00"), end: format(addDays(new Date(), 7), "yyyy-MM-dd'T'12:00"), attendees: ["sarah@acmecorp.com", "devops@partner.io"], meetingLink: "", status: "tentative", location: "TBD" },
];

// --- Tickets ---
export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  senderName: string;
  senderRole: "client" | "admin";
  message: string;
  createdAt: string;
}

export const tickets: Ticket[] = [
  {
    id: "t1", title: "Call drops after 2 minutes", description: "AI receptionist disconnects calls consistently at the 2-minute mark.", priority: "high", status: "in_progress", createdAt: format(subDays(new Date(), 5), "yyyy-MM-dd"), updatedAt: format(subDays(new Date(), 1), "yyyy-MM-dd"),
    messages: [
      { id: "tm1", senderName: "Sarah Chen", senderRole: "client", message: "Calls are dropping around the 2 min mark consistently. Happening since Monday.", createdAt: format(subDays(new Date(), 5), "yyyy-MM-dd'T'09:00") },
      { id: "tm2", senderName: "Support Team", senderRole: "admin", message: "We've identified the issue — it's related to a timeout config. Deploying a fix shortly.", createdAt: format(subDays(new Date(), 3), "yyyy-MM-dd'T'14:00") },
    ],
  },
  {
    id: "t2", title: "Add Spanish language support", description: "Would like the AI to handle Spanish-speaking callers.", priority: "medium", status: "open", createdAt: format(subDays(new Date(), 3), "yyyy-MM-dd"), updatedAt: format(subDays(new Date(), 3), "yyyy-MM-dd"),
    messages: [
      { id: "tm3", senderName: "Sarah Chen", senderRole: "client", message: "Many of our callers speak Spanish. Can the AI switch languages?", createdAt: format(subDays(new Date(), 3), "yyyy-MM-dd'T'10:00") },
    ],
  },
  {
    id: "t3", title: "Update business hours script", description: "Need to change the after-hours greeting message.", priority: "low", status: "resolved", createdAt: format(subDays(new Date(), 10), "yyyy-MM-dd"), updatedAt: format(subDays(new Date(), 7), "yyyy-MM-dd"),
    messages: [
      { id: "tm4", senderName: "Sarah Chen", senderRole: "client", message: "Please update the after-hours message to mention our new weekend hours.", createdAt: format(subDays(new Date(), 10), "yyyy-MM-dd'T'08:00") },
      { id: "tm5", senderName: "Support Team", senderRole: "admin", message: "Done! The greeting has been updated. Please test by calling after 6 PM.", createdAt: format(subDays(new Date(), 7), "yyyy-MM-dd'T'16:00") },
    ],
  },
  {
    id: "t4", title: "Urgent: All calls going to voicemail", description: "No calls are being answered by the AI since this morning.", priority: "urgent", status: "open", createdAt: format(subDays(new Date(), 0), "yyyy-MM-dd"), updatedAt: format(subDays(new Date(), 0), "yyyy-MM-dd"),
    messages: [
      { id: "tm6", senderName: "Sarah Chen", senderRole: "client", message: "URGENT — all calls going straight to voicemail since 8 AM today!", createdAt: format(new Date(), "yyyy-MM-dd'T'08:30") },
    ],
  },
];
