"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import LogoutButton from "@/components/layout/LogoutButton";

export default function DashboardShell({
  children,
  usuario,
}: {
  children: React.ReactNode;
  usuario: any;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar rol={usuario.rol} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Contenido principal — margen izquierdo en desktop para el sidebar fijo */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 active:bg-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="lg:hidden text-sm font-bold text-orange-500">🔧 TallerSystem</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{usuario.nombre}</p>
              <p className="text-xs text-muted-foreground capitalize">{usuario.rol}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {usuario.nombre?.charAt(0).toUpperCase()}
            </div>
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}