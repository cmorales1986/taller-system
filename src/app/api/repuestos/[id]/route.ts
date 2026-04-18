import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { categoria_id, codigo, nombre, descripcion, marca, unidad, precio_costo, precio_venta, stock_actual, stock_minimo } = body;

    const repuesto = await prisma.repuestos.update({
      where: { id },
      data: {
        categoria_id: categoria_id || null,
        codigo: codigo || null,
        nombre,
        descripcion: descripcion || null,
        marca: marca || null,
        unidad: unidad || "unidad",
        precio_costo: parseFloat(precio_costo) || 0,
        precio_venta: parseFloat(precio_venta) || 0,
        stock_actual: parseInt(stock_actual) || 0,
        stock_minimo: parseInt(stock_minimo) || 0,
      }
    });

    return NextResponse.json(repuesto);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar repuesto" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.repuestos.update({
      where: { id },
      data: { activo: false }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar repuesto" }, { status: 500 });
  }
}