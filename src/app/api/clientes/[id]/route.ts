import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cliente = await prisma.clientes.findUnique({
      where: { id },
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nombre, ruc_ci, telefono, email, direccion, notas } = body;

    const cliente = await prisma.clientes.update({
      where: { id },
      data: { nombre, ruc_ci, telefono, email, direccion, notas }
    });

    return NextResponse.json(cliente);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar cliente" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.clientes.update({
      where: { id },
      data: { activo: false }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar cliente" }, { status: 500 });
  }
}