/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET — obtener un cliente con sus vehículos
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cliente = await prisma.clientes.findUnique({
      where: { id: params.id },
      include: {
        vehiculos: {
          where: { activo: true },
          orderBy: { creado_en: "desc" }
        }
      }
    });

    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json(cliente);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener cliente" }, { status: 500 });
  }
}

// PUT — actualizar cliente
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nombre, ruc_ci, telefono, email, direccion, notas } = body;

    const cliente = await prisma.clientes.update({
      where: { id: params.id },
      data: { nombre, ruc_ci, telefono, email, direccion, notas }
    });

    return NextResponse.json(cliente);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar cliente" }, { status: 500 });
  }
}

// DELETE — baja lógica
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.clientes.update({
      where: { id: params.id },
      data: { activo: false }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar cliente" }, { status: 500 });
  }
}