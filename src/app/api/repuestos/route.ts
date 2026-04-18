/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const repuestos = await prisma.repuestos.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      include: {
        categorias_repuesto: { select: { id: true, nombre: true } }
      }
    });
    return NextResponse.json(repuestos);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener repuestos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categoria_id, codigo, nombre, descripcion, marca, unidad, precio_costo, precio_venta, stock_actual, stock_minimo } = body;

    if (!nombre) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    const repuesto = await prisma.repuestos.create({
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

    return NextResponse.json(repuesto, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un repuesto con ese código" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al crear repuesto" }, { status: 500 });
  }
}