/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categorias = await prisma.categorias_repuesto.findMany({
      orderBy: { nombre: "asc" }
    });
    return NextResponse.json(categorias);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener categorías" }, { status: 500 });
  }
}