/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const ordenes = await prisma.ordenes_reparacion.findMany({
      where: { estado: { not: "cancelado" } },
      orderBy: { creado_en: "desc" },
      include: {
        clientes: { select: { id: true, nombre: true, telefono: true } },
        vehiculos: { select: { id: true, patente: true, marca: true, modelo: true } },
        usuarios_ordenes_reparacion_asignado_aTousuarios: { select: { id: true, nombre: true } },
      }
    });
    return NextResponse.json(ordenes);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener órdenes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      vehiculo_id, cliente_id, asignado_a, descripcion_problema,
      kilometraje, fecha_prometida, notas, repuestos, servicios
    } = body;

    if (!vehiculo_id || !cliente_id || !descripcion_problema) {
      return NextResponse.json({ error: "Vehículo, cliente y descripción son obligatorios" }, { status: 400 });
    }

    // Calcular totales
    const subtotalRepuestos = repuestos?.reduce((acc: number, r: any) =>
      acc + (parseFloat(r.precio_unitario) * parseFloat(r.cantidad)), 0) || 0;
    const subtotalServicios = servicios?.reduce((acc: number, s: any) =>
      acc + (parseFloat(s.precio_unitario) * parseFloat(s.cantidad)), 0) || 0;
    const total = subtotalRepuestos + subtotalServicios;

    const orden = await prisma.ordenes_reparacion.create({
      data: {
        vehiculo_id,
        cliente_id,
        asignado_a: asignado_a || null,
        descripcion_problema,
        kilometraje: kilometraje ? parseInt(kilometraje) : null,
        fecha_prometida: fecha_prometida ? new Date(fecha_prometida) : null,
        notas: notas || null,
        subtotal: total,
        total,
        or_repuestos: {
          create: repuestos?.map((r: any) => ({
            repuesto_id: r.repuesto_id || null,
            descripcion: r.descripcion,
            cantidad: parseFloat(r.cantidad),
            precio_unitario: parseFloat(r.precio_unitario),
            subtotal: parseFloat(r.cantidad) * parseFloat(r.precio_unitario),
          })) || []
        },
        or_servicios: {
          create: servicios?.map((s: any) => ({
            servicio_id: s.servicio_id || null,
            descripcion: s.descripcion,
            cantidad: parseFloat(s.cantidad),
            precio_unitario: parseFloat(s.precio_unitario),
            subtotal: parseFloat(s.cantidad) * parseFloat(s.precio_unitario),
          })) || []
        }
      },
      include: {
        or_repuestos: true,
        or_servicios: true,
      }
    });

    // Registrar en historial
    await prisma.or_historial.create({
      data: {
        orden_id: orden.id,
        estado_nuevo: "recibido",
        comentario: "Orden creada"
      }
    });

    // Descontar stock de repuestos
    for (const r of repuestos || []) {
      if (r.repuesto_id) {
        await prisma.repuestos.update({
          where: { id: r.repuesto_id },
          data: { stock_actual: { decrement: parseInt(r.cantidad) } }
        });
      }
    }

    return NextResponse.json(orden, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear orden" }, { status: 500 });
  }
}