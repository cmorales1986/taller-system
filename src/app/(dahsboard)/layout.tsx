/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import LogoutButton from "@/components/layout/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const usuario = session.user as any;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar rol={usuario.rol} />
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{usuario.nombre}</p>
              <p className="text-xs text-muted-foreground capitalize">{usuario.rol}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
              {usuario.nombre?.charAt(0).toUpperCase()}
            </div>
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}