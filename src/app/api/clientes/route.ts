/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET — listar todos los clientes
export async function GET() {
  try {
    const clientes = await prisma.clientes.findMany({
      where: { activo: true },
      orderBy: { creado_en: "desc" },
      include: {
        _count: { select: { vehiculos: true } }
      }
    });
    return NextResponse.json(clientes);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 });
  }
}

// POST — crear cliente
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, ruc_ci, telefono, email, direccion, notas } = body;

    if (!nombre) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    const cliente = await prisma.clientes.create({
      data: { nombre, ruc_ci, telefono, email, direccion, notas }
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 });
  }
}