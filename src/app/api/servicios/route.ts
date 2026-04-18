/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const servicios = await prisma.servicios.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" }
    });
    return NextResponse.json(servicios);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener servicios" }, { status: 500 });
  }
}