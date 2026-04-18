import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { metodo_pago, descuento, notas } = body;

    const orden = await prisma.ordenes_reparacion.findUnique({
      where: { id },
      select: { total: true, cliente_id: true, estado: true }
    });

    if (!orden) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    // Verificar que no tenga ya una factura
    const facturaExistente = await prisma.facturas.findFirst({
      where: { orden_id: id, estado: { not: "anulada" } }
    });

    if (facturaExistente) {
      return NextResponse.json({ error: "Esta orden ya tiene una factura emitida", factura_id: facturaExistente.id }, { status: 400 });
    }

    const subtotal = Number(orden.total);
    const descuentoNum = parseFloat(descuento) || 0;
    const ivaBase = subtotal - descuentoNum;
    const ivaMonto = ivaBase * 0.10;
    const total = ivaBase + ivaMonto;

    const factura = await prisma.facturas.create({
      data: {
        orden_id: id,
        cliente_id: orden.cliente_id,
        metodo_pago: metodo_pago || null,
        subtotal,
        iva_porcentaje: 10,
        iva_monto: ivaMonto,
        descuento: descuentoNum,
        total,
        notas: notas || null,
        estado: "emitida",
      }
    });

    // Marcar orden como entregada si no lo está
    if (orden.estado !== "entregado") {
      await prisma.ordenes_reparacion.update({
        where: { id },
        data: { estado: "entregado", fecha_entrega: new Date() }
      });

      await prisma.or_historial.create({
        data: {
          orden_id: id,
          estado_anterior: orden.estado,
          estado_nuevo: "entregado",
          comentario: "Factura emitida — vehículo entregado"
        }
      });
    }

    return NextResponse.json(factura, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al facturar orden" }, { status: 500 });
  }
}