"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { href: "/dashboard",    label: "Dashboard",    icon: "📊", roles: ["admin", "administrativo", "mecanico", "consultas"] },
  { href: "/clientes",     label: "Clientes",     icon: "👥", roles: ["admin", "administrativo", "consultas"] },
  { href: "/vehiculos",    label: "Vehículos",    icon: "🚗", roles: ["admin", "administrativo", "consultas"] },
  { href: "/ordenes",      label: "Órdenes",      icon: "🔧", roles: ["admin", "administrativo", "mecanico", "consultas"] },
  { href: "/presupuestos", label: "Presupuestos", icon: "📋", roles: ["admin", "administrativo", "consultas"] },
  { href: "/repuestos",    label: "Repuestos",    icon: "🛒", roles: ["admin", "administrativo", "consultas"] },
  { href: "/facturas",     label: "Facturas",     icon: "🧾", roles: ["admin", "administrativo", "consultas"] },
  { href: "/usuarios",     label: "Usuarios",     icon: "👤", roles: ["admin"] },
];

export default function Sidebar({ rol }: { rol: string }) {
  const pathname = usePathname();
  const itemsVisibles = menu.filter(item => item.roles.includes(rol));

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-orange-500">🔧 TallerSystem</h1>
        <p className="text-xs text-gray-400 mt-1">Gestión de Taller</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {itemsVisibles.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                active ? "bg-orange-500 text-white font-medium" : "text-gray-300 hover:bg-gray-800"
              }`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
        v1.0.0 — Fase 1
      </div>
    </aside>
  );
}