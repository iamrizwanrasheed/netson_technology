import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getOrders, getOrderDetail, Order, OrderDetail } from "@/services/api";
import {
  ShoppingBag, ChevronRight, ArrowLeft, Package, Calendar,
  DollarSign, Loader2, AlertCircle, Hash,
} from "lucide-react";
import { format } from "date-fns";

function statusColor(status: string) {
  switch (status) {
    case "completed": return "bg-success/10 text-success";
    case "processing": return "bg-info/10 text-info";
    case "on-hold": return "bg-warning/10 text-warning";
    case "cancelled":
    case "failed": return "bg-destructive/10 text-destructive";
    default: return "bg-muted text-muted-foreground";
  }
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    getOrders()
      .then((res) => setOrders(res.orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const openDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const detail = await getOrderDetail(id);
      setSelectedOrder(detail);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          {selectedOrder && (
            <button
              onClick={() => setSelectedOrder(null)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {selectedOrder ? `Order #${selectedOrder.number}` : "My Orders"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedOrder ? "Order details and line items" : "View your order history"}
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Order Detail */}
        {selectedOrder && !detailLoading && (
          <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Hash className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Order Number</span>
                </div>
                <p className="text-lg font-bold">#{selectedOrder.number}</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Total</span>
                </div>
                <p className="text-lg font-bold">
                  {selectedOrder.currency === "USD" ? "$" : selectedOrder.currency}
                  {parseFloat(selectedOrder.total).toLocaleString()}
                </p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Date</span>
                </div>
                <p className="text-lg font-bold">
                  {format(new Date(selectedOrder.created_at), "MMM dd, yyyy")}
                </p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Package className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Status</span>
                </div>
                <span className={`inline-block mt-0.5 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            {/* Project phase */}
            {selectedOrder.project?.phase && (
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold mb-2">Project Phase</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm">{selectedOrder.project.phase}</span>
                </div>
              </div>
            )}

            {/* Line items */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 className="text-sm font-semibold">Items</h3>
              </div>
              <div className="divide-y divide-border">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">
                      ${parseFloat(item.line_total).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-5 bg-muted/30 border-t border-border">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-base font-bold text-primary">
                  ${parseFloat(selectedOrder.total).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {detailLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {/* Orders List */}
        {!selectedOrder && !loading && !error && (
          <>
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No orders found</p>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="divide-y divide-border">
                  {orders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => openDetail(order.id)}
                      className="flex items-center justify-between w-full p-5 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Order #{order.number}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(order.created_at), "MMM dd, yyyy")}
                            {order.project?.phase && ` \u2022 ${order.project.phase}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {order.currency === "USD" ? "$" : order.currency}
                            {parseFloat(order.total).toLocaleString()}
                          </p>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${statusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
