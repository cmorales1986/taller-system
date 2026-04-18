/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const marcas = await prisma.marcas_vehiculo.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" }
    });
    return NextResponse.json(marcas);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener marcas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nombre } = await request.json();
    const marca = await prisma.marcas_vehiculo.create({
      data: { nombre }
    });
    return NextResponse.json(marca, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear marca" }, { status: 500 });
  }
}