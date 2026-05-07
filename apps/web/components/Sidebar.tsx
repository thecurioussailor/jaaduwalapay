"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  QrCode,
  ShoppingBag,
  LogOut,
} from "lucide-react";
import { clearToken } from "../lib/auth";

const nav = [
  { label: "Overview",  href: "/dashboard",        icon: LayoutDashboard },
  { label: "Menu",      href: "/dashboard/menu",    icon: UtensilsCrossed },
  { label: "Tables",    href: "/dashboard/tables",  icon: QrCode },
  { label: "Orders",    href: "/dashboard/orders",  icon: ShoppingBag },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearToken();
    router.replace("/signin");
  }

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-gray-100">
      <div className="px-5 py-5 border-b border-gray-100">
        <span className="text-base font-bold tracking-tight text-gray-950">Jaaduwalapay</span>
        <p className="text-xs text-gray-400 mt-0.5">Merchant Dashboard</p>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-gray-950 text-white"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-950"
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
