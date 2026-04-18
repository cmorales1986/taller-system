/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orden = await prisma.ordenes_reparacion.findUnique({
      where: { id },
      include: {
        clientes: true,
        vehiculos: true,
        usuarios_ordenes_reparacion_asignado_aTousuarios: { select: { id: true, nombre: true } },
        or_repuestos: { include: { repuestos: true } },
        or_servicios: { include: { servicios: true } },
        or_historial: {
          orderBy: { creado_en: "asc" },
          include: { usuarios: { select: { nombre: true } } }
        },
      }
    });

    if (!orden) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    return NextResponse.json(orden);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener orden" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { estado, diagnostico, trabajo_realizado, notas, asignado_a, fecha_prometida, usuario_id } = body;

    const ordenActual = await prisma.ordenes_reparacion.findUnique({
      where: { id },
      select: { estado: true }
    });

    const orden = await prisma.ordenes_reparacion.update({
      where: { id },
      data: {
        estado,
        diagnostico: diagnostico || undefined,
        trabajo_realizado: trabajo_realizado || undefined,
        notas: notas || undefined,
        asignado_a: asignado_a || undefined,
        fecha_prometida: fecha_prometida ? new Date(fecha_prometida) : undefined,
        fecha_entrega: estado === "entregado" ? new Date() : undefined,
      }
    });

    if (ordenActual?.estado !== estado) {
      await prisma.or_historial.create({
        data: {
          orden_id: id,
          estado_anterior: ordenActual?.estado,
          estado_nuevo: estado,
          usuario_id: usuario_id || null,
        }
      });
    }

    return NextResponse.json(orden);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar orden" }, { status: 500 });
  }
}