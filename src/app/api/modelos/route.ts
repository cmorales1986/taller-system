/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const marca_id = searchParams.get("marca_id");

    if (!marca_id) return NextResponse.json([]);

    const relaciones = await prisma.marca_modelo.findMany({
      where: { marca_id },
      include: { modelos_vehiculo: true },
      orderBy: { modelos_vehiculo: { nombre: "asc" } }
    });

    const modelos = relaciones.map(r => r.modelos_vehiculo);
    return NextResponse.json(modelos);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener modelos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nombre, marca_id } = await request.json();

    // Crear modelo si no existe
    let modelo = await prisma.modelos_vehiculo.findFirst({
      where: { nombre: { equals: nombre, mode: "insensitive" } }
    });

    if (!modelo) {
      modelo = await prisma.modelos_vehiculo.create({ data: { nombre } });
    }

    // Crear relación con la marca
    await prisma.marca_modelo.upsert({
      where: { marca_id_modelo_id: { marca_id, modelo_id: modelo.id } },
      update: {},
      create: { marca_id, modelo_id: modelo.id }
    });

    return NextResponse.json(modelo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear modelo" }, { status: 500 });
  }
}