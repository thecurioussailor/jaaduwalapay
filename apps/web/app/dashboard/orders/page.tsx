"use client";

import { ShoppingBag } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-950">Orders</h1>
        <p className="text-sm text-gray-400 mt-1">Live view of all incoming orders.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl">
        <div className="grid grid-cols-5 px-5 py-3 border-b border-gray-50 text-xs font-medium text-gray-400 uppercase tracking-wide">
          <span>Order</span>
          <span>Table</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Time</span>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag size={32} className="text-gray-200 mb-3" />
          <p className="text-sm font-medium text-gray-400">No orders yet</p>
          <p className="text-xs text-gray-300 mt-1">Orders will appear here in real time</p>
        </div>
      </div>
    </div>
  );
}
