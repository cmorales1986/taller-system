import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const usuarios = await prisma.usuarios.findMany({
      where: { activo: true },
      orderBy: { creado_en: "desc" },
      select: {
        id: true, nombre: true, email: true,
        rol: true, activo: true, creado_en: true
      }
    });
    return NextResponse.json(usuarios);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, email, password, rol } = body;

    if (!nombre || !email || !password || !rol) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    // Verificar email duplicado
    const existe = await prisma.usuarios.findUnique({ where: { email } });
    if (existe) {
      return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuarios.create({
      data: { nombre, email, password_hash, rol },
      select: { id: true, nombre: true, email: true, rol: true, creado_en: true }
    });

    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}