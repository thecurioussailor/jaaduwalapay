"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, RefreshCw, ExternalLink } from "lucide-react";
import { getToken } from "../../../lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL + "";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  priceUsdc: number;
};

type Order = {
  id: string;
  customerWallet: string;
  totalUsdc: number;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  txSignature?: string;
  createdAt: string;
  table?: { tableNumber: number; label?: string };
  orderItems: OrderItem[];
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function statusBadge(status: Order["status"]) {
  const map = {
    CONFIRMED: "bg-green-50 text-green-700",
    PENDING: "bg-yellow-50 text-yellow-700",
    FAILED: "bg-red-50 text-red-600",
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${map[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [expanded, setExpanded] = useState<string | null>(null);

  async function fetchOrders() {
    try {
      const res = await fetch(`${API}/merchant/orders`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setOrders(data.orders ?? []);
      setLastRefresh(new Date());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const confirmed = orders.filter(o => o.status === "CONFIRMED");
  const totalRevenue = confirmed.reduce((s, o) => s + o.totalUsdc, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Orders</h1>
          <p className="text-sm text-gray-400 mt-1">
            Auto-refreshes every 10s · Last updated {timeAgo(lastRefresh.toISOString())}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Orders", value: orders.length },
          { label: "Confirmed", value: confirmed.length },
          { label: "Revenue", value: `$${totalRevenue.toFixed(2)} USDC` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl px-5 py-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-950 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-5 px-5 py-3 border-b border-gray-50 text-xs font-medium text-gray-400 uppercase tracking-wide">
          <span>Table</span>
          <span>Items</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Time</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag size={32} className="text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-400">No orders yet</p>
            <p className="text-xs text-gray-300 mt-1">Orders will appear here in real time</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id}>
              <div
                className="grid grid-cols-5 px-5 py-4 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition items-center"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <span className="text-sm font-medium text-gray-950">
                  {order.table ? `Table ${order.table.tableNumber}` : "—"}
                  {order.table?.label && <span className="text-xs text-gray-400 ml-1">({order.table.label})</span>}
                </span>
                <span className="text-sm text-gray-600">
                  {order.orderItems.length} item{order.orderItems.length !== 1 ? "s" : ""}
                </span>
                <span className="text-sm font-semibold text-gray-950">${order.totalUsdc.toFixed(2)}</span>
                <span>{statusBadge(order.status)}</span>
                <span className="text-xs text-gray-400">{timeAgo(order.createdAt)}</span>
              </div>

              {/* Expanded detail */}
              {expanded === order.id && (
                <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    {order.orderItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{item.quantity}× {item.name}</span>
                        <span className="text-gray-950 font-medium">
                          ${(item.priceUsdc * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-400 font-mono truncate max-w-xs">
                      {order.customerWallet.slice(0, 8)}...{order.customerWallet.slice(-6)}
                    </span>
                    {order.txSignature && (
                      <a
                        href={`https://explorer.solana.com/tx/${order.txSignature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
                        onClick={e => e.stopPropagation()}
                      >
                        View on Explorer <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
