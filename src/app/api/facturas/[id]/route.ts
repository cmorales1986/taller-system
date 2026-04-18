import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const factura = await prisma.facturas.findUnique({
      where: { id },
      include: {
        clientes: true,
        ordenes_reparacion: {
          include: {
            vehiculos: true,
            or_repuestos: true,
            or_servicios: true,
          }
        }
      }
    });

    if (!factura) {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
    }

    return NextResponse.json(factura);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener factura" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { estado, metodo_pago } = await request.json();

    const factura = await prisma.facturas.update({
      where: { id },
      data: {
        estado,
        metodo_pago: metodo_pago || undefined,
        fecha_pago: estado === "pagada" ? new Date() : undefined,
      }
    });

    return NextResponse.json(factura);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar factura" }, { status: 500 });
  }
}