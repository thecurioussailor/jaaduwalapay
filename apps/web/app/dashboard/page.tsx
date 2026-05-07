"use client";

import { ArrowUpRight, ShoppingBag, Coins, TableProperties } from "lucide-react";

const stats = [
  { label: "Total Revenue",   value: "$0.00",  sub: "USDC settled",     icon: Coins,            change: null },
  { label: "Orders Today",    value: "0",      sub: "across all tables", icon: ShoppingBag,      change: null },
  { label: "Active Tables",   value: "0",      sub: "with QR codes",     icon: TableProperties,  change: null },
];

export default function OverviewPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-950">Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                <Icon size={15} className="text-gray-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-950">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-950">Recent Orders</h2>
            <a href="/dashboard/orders" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-950 transition-colors">
              View all <ArrowUpRight size={12} />
            </a>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ShoppingBag size={28} className="text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">No orders yet</p>
            <p className="text-xs text-gray-300 mt-1">Orders will appear here once customers start paying</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-950">Getting Started</h2>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { step: "1", label: "Complete your profile",  done: false, href: "/dashboard/settings" },
              { step: "2", label: "Add your menu items",    done: false, href: "/dashboard/menu" },
              { step: "3", label: "Set up tables & QR codes", done: false, href: "/dashboard/tables" },
              { step: "4", label: "Connect your wallet",   done: false, href: "/dashboard/settings" },
            ].map(({ step, label, done, href }) => (
              <a
                key={step}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] font-bold ${done ? "bg-gray-950 border-gray-950 text-white" : "border-gray-200 text-gray-400"}`}>
                  {done ? "✓" : step}
                </div>
                <span className={`text-sm ${done ? "line-through text-gray-300" : "text-gray-600 group-hover:text-gray-950"}`}>
                  {label}
                </span>
                <ArrowUpRight size={12} className="ml-auto text-gray-300 group-hover:text-gray-500" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
