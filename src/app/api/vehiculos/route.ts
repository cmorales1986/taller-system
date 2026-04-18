/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const vehiculos = await prisma.vehiculos.findMany({
      where: { activo: true },
      orderBy: { creado_en: "desc" },
      include: {
        clientes: {
          select: { id: true, nombre: true, telefono: true }
        }
      }
    });
    return NextResponse.json(vehiculos);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener vehículos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cliente_id, patente, marca, modelo, anio, color, vin, kilometraje, notas } = body;

    if (!cliente_id || !patente || !marca || !modelo) {
      return NextResponse.json({ error: "Cliente, patente, marca y modelo son obligatorios" }, { status: 400 });
    }

    const vehiculo = await prisma.vehiculos.create({
      data: { cliente_id, patente: patente.toUpperCase(), marca, modelo, anio: anio ? parseInt(anio) : null, color, vin, kilometraje: kilometraje ? parseInt(kilometraje) : null, notas }
    });

    return NextResponse.json(vehiculo, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un vehículo con esa patente" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al crear vehículo" }, { status: 500 });
  }
}