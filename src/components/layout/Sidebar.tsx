"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const menu = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "📊",
    roles: ["admin", "administrativo", "mecanico", "consultas"],
  },
  {
    href: "/clientes",
    label: "Clientes",
    icon: "👥",
    roles: ["admin", "administrativo", "consultas"],
  },
  {
    href: "/vehiculos",
    label: "Vehículos",
    icon: "🚗",
    roles: ["admin", "administrativo", "consultas"],
  },
  {
    href: "/ordenes",
    label: "Órdenes",
    icon: "🔧",
    roles: ["admin", "administrativo", "mecanico", "consultas"],
  },
  {
    href: "/presupuestos",
    label: "Presupuestos",
    icon: "📋",
    roles: ["admin", "administrativo", "consultas"],
  },
  {
    href: "/repuestos",
    label: "Repuestos",
    icon: "🛒",
    roles: ["admin", "administrativo", "consultas"],
  },
  {
    href: "/facturas",
    label: "Facturas",
    icon: "🧾",
    roles: ["admin", "administrativo", "consultas"],
  },
  { href: "/usuarios", label: "Usuarios", icon: "👤", roles: ["admin"] },
];

interface Props {
  rol: string;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ rol, open, onClose }: Props) {
  const pathname = usePathname();
  const itemsVisibles = menu.filter((item) => item.roles.includes(rol));

  // Cerrar con Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Cerrar al cambiar de ruta en mobile
  useEffect(() => {
    onClose();
  }, [pathname]);

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
  fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white flex flex-col z-40
  transition-transform duration-300 ease-in-out
  lg:translate-x-0
  ${open ? "translate-x-0" : "-translate-x-full"}
`}
      >
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-orange-500">
              🔧 TallerSystem
            </h1>
            <p className="text-xs text-gray-400 mt-1">Gestión de Taller</p>
          </div>
          {/* Botón cerrar en mobile */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {itemsVisibles.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-orange-500 text-white font-medium"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
          v1.0.0 — Fase 1
        </div>
      </aside>
    </>
  );
}
