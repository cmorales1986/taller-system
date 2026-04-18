/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nombre, email, rol, password } = body;

    const data: any = { nombre, email, rol };

    if (password) {
      data.password_hash = await bcrypt.hash(password, 10);
    }

    const usuario = await prisma.usuarios.update({
      where: { id },
      data,
      select: { id: true, nombre: true, email: true, rol: true }
    });

    return NextResponse.json(usuario);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.usuarios.update({
      where: { id },
      data: { activo: false }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 });
  }
}