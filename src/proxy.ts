import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Dejar pasar archivos estáticos y rutas del sistema
  if (pathname.startsWith("/_next/")) return NextResponse.next();
  if (pathname.startsWith("/login")) return NextResponse.next();
  if (pathname.startsWith("/api/auth")) return NextResponse.next();
  if (pathname === "/favicon.ico") return NextResponse.next();

  const session = await auth();

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}