import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vehiculo = await prisma.vehiculos.findUnique({
      where: { id },
      include: {
        clientes: {
          select: { id: true, nombre: true, telefono: true, email: true },
        },
      },
    });

    if (!vehiculo) {
      return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 });
    }

    return NextResponse.json(vehiculo);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener vehículo" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { marca, modelo, anio, color, vin, kilometraje, notas } = body;

    const vehiculo = await prisma.vehiculos.update({
      where: { id },
      data: {
        marca, modelo,
        anio: anio ? parseInt(anio) : null,
        color, vin,
        kilometraje: kilometraje ? parseInt(kilometraje) : null,
        notas,
      },
    });

    return NextResponse.json(vehiculo);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar vehículo" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.vehiculos.update({
      where: { id },
      data: { activo: false },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar vehículo" }, { status: 500 });
  }
}