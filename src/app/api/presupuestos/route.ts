import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const presupuestos = await prisma.presupuestos.findMany({
      orderBy: { creado_en: "desc" },
      include: {
        clientes: { select: { id: true, nombre: true, telefono: true } },
        vehiculos: { select: { id: true, patente: true, marca: true, modelo: true } },
        presupuesto_repuestos: true,
        presupuesto_servicios: true,
      }
    });
    return NextResponse.json(presupuestos);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener presupuestos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      cliente_id, vehiculo_id, kilometraje,
      notas, validez_dias, repuestos, servicios
    } = body;

    if (!cliente_id || !vehiculo_id) {
      return NextResponse.json({ error: "Cliente y vehículo son obligatorios" }, { status: 400 });
    }

    const subtotalRepuestos = repuestos?.reduce((acc: number, r: any) =>
      acc + (parseFloat(r.precio_unitario) * parseFloat(r.cantidad)), 0) || 0;
    const subtotalServicios = servicios?.reduce((acc: number, s: any) =>
      acc + (parseFloat(s.precio_unitario) * parseFloat(s.cantidad)), 0) || 0;
    const subtotal = subtotalRepuestos + subtotalServicios;

    const presupuesto = await prisma.presupuestos.create({
      data: {
        cliente_id,
        vehiculo_id,
        kilometraje: kilometraje ? parseInt(kilometraje) : null,
        notas: notas || null,
        validez_dias: validez_dias ? parseInt(validez_dias) : 15,
        subtotal,
        total: subtotal,
        presupuesto_repuestos: {
          create: repuestos?.map((r: any) => ({
            repuesto_id: r.repuesto_id || null,
            descripcion: r.descripcion,
            cantidad: parseFloat(r.cantidad),
            precio_unitario: parseFloat(r.precio_unitario),
            subtotal: parseFloat(r.cantidad) * parseFloat(r.precio_unitario),
          })) || []
        },
        presupuesto_servicios: {
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
        presupuesto_repuestos: true,
        presupuesto_servicios: true,
      }
    });

    return NextResponse.json(presupuesto, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear presupuesto" }, { status: 500 });
  }
}