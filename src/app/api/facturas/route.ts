import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const facturas = await prisma.facturas.findMany({
      where: { estado: { not: "anulada" } },
      orderBy: { creado_en: "desc" },
      include: {
        clientes: { select: { id: true, nombre: true } },
        ordenes_reparacion: {
          select: {
            id: true, numero: true,
            vehiculos: { select: { patente: true, marca: true, modelo: true } }
          }
        }
      }
    });
    return NextResponse.json(facturas);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener facturas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orden_id, cliente_id, metodo_pago, descuento, notas } = body;

    if (!orden_id || !cliente_id) {
      return NextResponse.json({ error: "Orden y cliente son obligatorios" }, { status: 400 });
    }

    // Obtener total de la orden
    const orden = await prisma.ordenes_reparacion.findUnique({
      where: { id: orden_id },
      select: { total: true, subtotal: true }
    });

    if (!orden) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    const subtotal = Number(orden.total);
    const descuentoNum = parseFloat(descuento) || 0;
    const ivaBase = subtotal - descuentoNum;
    const ivaMonto = ivaBase * 0.10; // IVA 10% Paraguay
    const total = ivaBase + ivaMonto;

    const factura = await prisma.facturas.create({
      data: {
        orden_id,
        cliente_id,
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

    return NextResponse.json(factura, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear factura" }, { status: 500 });
  }
}