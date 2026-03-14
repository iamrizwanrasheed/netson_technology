import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { tickets as initialTickets, type Ticket, type TicketMessage } from "@/data/mockData";
import { format } from "date-fns";
import { Plus, MessageSquare, X, Send, AlertTriangle } from "lucide-react";

const priorityColors: Record<string, string> = {
  low: "bg-muted-foreground/20 text-muted-foreground",
  medium: "bg-info/10 text-info",
  high: "bg-warning/10 text-warning",
  urgent: "bg-destructive/10 text-destructive",
};

const statusColors: Record<string, string> = {
  open: "bg-info/10 text-info",
  in_progress: "bg-warning/10 text-warning",
  resolved: "bg-success/10 text-success",
  closed: "bg-muted text-muted-foreground",
};

export default function Tickets() {
  const [ticketList, setTicketList] = useState<Ticket[]>(initialTickets);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [replyText, setReplyText] = useState("");

  // Create ticket form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<Ticket["priority"]>("low");

  const filtered = ticketList.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  });

  const handleCreateTicket = () => {
    if (!newTitle.trim() || !newDescription.trim()) return;

    const now = format(new Date(), "yyyy-MM-dd");
    const newTicket: Ticket = {
      id: `t${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      priority: newPriority,
      status: "open",
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: `tm${Date.now()}`,
          senderName: "Sarah Chen",
          senderRole: "client",
          message: newDescription.trim(),
          createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        },
      ],
    };

    setTicketList((prev) => [newTicket, ...prev]);
    setNewTitle("");
    setNewDescription("");
    setNewPriority("low");
    setShowCreate(false);
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedTicket) return;

    const newMessage: TicketMessage = {
      id: `tm${Date.now()}`,
      senderName: "Sarah Chen",
      senderRole: "client",
      message: replyText.trim(),
      createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    };

    setTicketList((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? {
              ...t,
              messages: [...t.messages, newMessage],
              updatedAt: format(new Date(), "yyyy-MM-dd"),
            }
          : t
      )
    );

    setSelectedTicket((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, newMessage],
            updatedAt: format(new Date(), "yyyy-MM-dd"),
          }
        : null
    );

    setReplyText("");
  };

  const openTicketCount = ticketList.filter((t) => t.status === "open" || t.status === "in_progress").length;
  const urgentCount = ticketList.filter((t) => t.priority === "urgent" && t.status !== "closed" && t.status !== "resolved").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Support Tickets</h1>
            <p className="text-sm text-muted-foreground mt-1">Create and manage support requests.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Total</span>
            </div>
            <p className="text-xl font-bold">{ticketList.length}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-info" />
              <span className="text-xs text-muted-foreground font-medium">Open</span>
            </div>
            <p className="text-xl font-bold">{openTicketCount}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground font-medium">Resolved</span>
            </div>
            <p className="text-xl font-bold">{ticketList.filter((t) => t.status === "resolved" || t.status === "closed").length}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-xs text-muted-foreground font-medium">Urgent</span>
            </div>
            <p className="text-xl font-bold">{urgentCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-card border border-border rounded-lg px-3 py-2 outline-none cursor-pointer"
          >
            {["all", "open", "in_progress", "resolved", "closed"].map((o) => (
              <option key={o} value={o}>Status: {o === "all" ? "All" : o.replace("_", " ")}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-card border border-border rounded-lg px-3 py-2 outline-none cursor-pointer"
          >
            {["all", "low", "medium", "high", "urgent"].map((o) => (
              <option key={o} value={o}>Priority: {o === "all" ? "All" : o}</option>
            ))}
          </select>
        </div>

        {/* Ticket list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No tickets match your filters.</p>
            </div>
          )}
          {filtered.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => {
                setSelectedTicket(ticket);
                setReplyText("");
              }}
              className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${priorityColors[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${statusColors[ticket.status]}`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold">{ticket.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{ticket.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">{format(new Date(ticket.createdAt), "MMM dd")}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <MessageSquare className="w-3 h-3" />
                    {ticket.messages.length}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket detail drawer */}
      {selectedTicket && (
        <>
          <div className="fixed inset-0 bg-foreground/40 z-40" onClick={() => setSelectedTicket(null)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-lg z-50 bg-card border-l border-border flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${priorityColors[selectedTicket.priority]}`}>
                    {selectedTicket.priority}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${statusColors[selectedTicket.status]}`}>
                    {selectedTicket.status.replace("_", " ")}
                  </span>
                </div>
                <h2 className="text-base font-semibold">{selectedTicket.title}</h2>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <p className="text-sm text-muted-foreground">{selectedTicket.description}</p>
              <hr className="border-border" />
              {selectedTicket.messages.map((msg) => (
                <div key={msg.id} className={`p-3 rounded-lg text-sm ${msg.senderRole === "admin" ? "bg-primary/5 border border-primary/10" : "bg-muted"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-xs">{msg.senderName}</span>
                    <span className="text-[10px] text-muted-foreground">{format(new Date(msg.createdAt), "MMM dd, h:mm a")}</span>
                  </div>
                  <p className="text-muted-foreground">{msg.message}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="p-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create ticket modal */}
      {showCreate && (
        <>
          <div className="fixed inset-0 bg-foreground/40 z-40" onClick={() => setShowCreate(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl border border-border w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">New Ticket</h2>
                <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
                <input
                  className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none"
                  placeholder="Briefly describe the issue"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                <textarea
                  className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none min-h-[100px] resize-none"
                  placeholder="Provide details..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
                <select
                  className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Ticket["priority"])}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <button
                onClick={handleCreateTicket}
                disabled={!newTitle.trim() || !newDescription.trim()}
                className="w-full bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Ticket
              </button>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
