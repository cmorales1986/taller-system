import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const presupuesto = await prisma.presupuestos.findUnique({
      where: { id },
      include: {
        presupuesto_repuestos: true,
        presupuesto_servicios: true,
      }
    });

    if (!presupuesto) {
      return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
    }

    if (presupuesto.estado !== "aprobado") {
      return NextResponse.json({ error: "El presupuesto debe estar aprobado para convertirlo en OR" }, { status: 400 });
    }

    const { descripcion_problema } = await request.json();

    // Crear la OR desde el presupuesto
    const orden = await prisma.ordenes_reparacion.create({
      data: {
        vehiculo_id: presupuesto.vehiculo_id,
        cliente_id: presupuesto.cliente_id,
        presupuesto_id: presupuesto.id,
        descripcion_problema: descripcion_problema || "Presupuesto aprobado",
        kilometraje: presupuesto.kilometraje,
        subtotal: presupuesto.subtotal,
        total: presupuesto.total,
        or_repuestos: {
          create: presupuesto.presupuesto_repuestos.map(r => ({
            repuesto_id: r.repuesto_id,
            descripcion: r.descripcion,
            cantidad: r.cantidad,
            precio_unitario: r.precio_unitario,
            subtotal: r.subtotal,
          }))
        },
        or_servicios: {
          create: presupuesto.presupuesto_servicios.map(s => ({
            servicio_id: s.servicio_id,
            descripcion: s.descripcion,
            cantidad: s.cantidad,
            precio_unitario: s.precio_unitario,
            subtotal: s.subtotal,
          }))
        }
      }
    });

    // Registrar en historial
    await prisma.or_historial.create({
      data: {
        orden_id: orden.id,
        estado_nuevo: "recibido",
        comentario: `Creada desde presupuesto P-${String(presupuesto.numero).padStart(4, "0")}`
      }
    });

    // Descontar stock
    for (const r of presupuesto.presupuesto_repuestos) {
      if (r.repuesto_id) {
        await prisma.repuestos.update({
          where: { id: r.repuesto_id },
          data: { stock_actual: { decrement: Number(r.cantidad) } }
        });
      }
    }

    // Marcar presupuesto como convertido
    await prisma.presupuestos.update({
      where: { id },
      data: { estado: "aprobado" }
    });

    return NextResponse.json(orden, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al convertir presupuesto" }, { status: 500 });
  }
}