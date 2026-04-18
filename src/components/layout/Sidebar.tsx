"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { href: "/dashboard",      label: "Dashboard",      icon: "📊" },
  { href: "/clientes",       label: "Clientes",        icon: "👥" },
  { href: "/vehiculos",      label: "Vehículos",       icon: "🚗" },
  { href: "/ordenes",        label: "Órdenes",         icon: "🔧" },
  { href: "/presupuestos",   label: "Presupuestos",    icon: "📋" },
  { href: "/repuestos",      label: "Repuestos",       icon: "🛒" },
  { href: "/facturas",       label: "Facturas",        icon: "🧾" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-orange-500">🔧 TallerSystem</h1>
        <p className="text-xs text-gray-400 mt-1">Gestión de Taller</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menu.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-orange-500 text-white font-medium"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
        v1.0.0 — Fase 1
      </div>
    </aside>
  );
}