/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  const usuario = session.user as any;

  return <DashboardShell usuario={usuario}>{children}</DashboardShell>;
}