/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Rutas públicas
  if (pathname.startsWith("/login")) return NextResponse.next();
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // Si no hay sesión, redirigir al login
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const rol = (req.auth.user as any)?.rol;

  // Rutas solo para admin
  if (pathname.startsWith("/usuarios") && rol !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Mecánico solo puede ver órdenes
  if (rol === "mecanico") {
    const permitidas = ["/dashboard", "/ordenes", "/api/ordenes", "/api/dashboard"];
    const permitida = permitidas.some(r => pathname.startsWith(r));
    if (!permitida) {
      return NextResponse.redirect(new URL("/ordenes", req.url));
    }
  }

  // Consultas solo lectura — bloqueamos rutas de creación
  if (rol === "consultas") {
    const bloqueadas = [
      "/ordenes/nueva", "/presupuestos/nueva",
      "/clientes/nueva", "/vehiculos/nueva",
      "/repuestos/nueva", "/facturas/nueva",
      "/usuarios/nuevo"
    ];
    const bloqueada = bloqueadas.some(r => pathname.startsWith(r));
    if (bloqueada) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};