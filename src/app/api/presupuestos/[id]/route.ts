import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const presupuesto = await prisma.presupuestos.findUnique({
      where: { id },
      include: {
        clientes: true,
        vehiculos: true,
        presupuesto_repuestos: { include: { repuestos: true } },
        presupuesto_servicios: { include: { servicios: true } },
      }
    });

    if (!presupuesto) {
      return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(presupuesto);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener presupuesto" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { estado } = await request.json();

    const presupuesto = await prisma.presupuestos.update({
      where: { id },
      data: {
        estado,
        fecha_aprobacion: estado === "aprobado" ? new Date() : null,
      }
    });

    return NextResponse.json(presupuesto);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar presupuesto" }, { status: 500 });
  }
}