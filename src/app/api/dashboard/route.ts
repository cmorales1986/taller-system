import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

    // Órdenes activas (todo lo que no es entregado ni cancelado)
    const ordenesActivas = await prisma.ordenes_reparacion.count({
      where: { estado: { notIn: ["entregado", "cancelado"] } }
    });

    // Órdenes listas para entregar
    const ordenesListas = await prisma.ordenes_reparacion.count({
      where: { estado: "listo" }
    });

    // Órdenes del mes actual
    const ordenesMes = await prisma.ordenes_reparacion.count({
      where: { creado_en: { gte: inicioMes } }
    });

    // Facturación del mes
    const facturacionMes = await prisma.ordenes_reparacion.aggregate({
      where: {
        estado: "entregado",
        fecha_entrega: { gte: inicioMes }
      },
      _sum: { total: true }
    });

    // Facturación mes anterior
    const facturacionMesAnterior = await prisma.ordenes_reparacion.aggregate({
      where: {
        estado: "entregado",
        fecha_entrega: { gte: inicioMesAnterior, lte: finMesAnterior }
      },
      _sum: { total: true }
    });

    // Total clientes
    const totalClientes = await prisma.clientes.count({
      where: { activo: true }
    });

    // Total vehículos
    const totalVehiculos = await prisma.vehiculos.count({
      where: { activo: true }
    });

    // Repuestos con stock bajo
    const stockBajo = await prisma.repuestos.count({
      where: {
        activo: true,
        stock_actual: { lte: prisma.repuestos.fields.stock_minimo }
      }
    });

    // Órdenes por estado
    const ordenesPorEstado = await prisma.ordenes_reparacion.groupBy({
      by: ["estado"],
      where: { estado: { notIn: ["cancelado"] } },
      _count: { estado: true }
    });

    // Últimas 5 órdenes
    const ultimasOrdenes = await prisma.ordenes_reparacion.findMany({
      take: 5,
      orderBy: { creado_en: "desc" },
      include: {
        clientes: { select: { nombre: true } },
        vehiculos: { select: { patente: true, marca: true, modelo: true } }
      }
    });

    // Repuestos con stock bajo (detalle)
    const repuestosStockBajo = await prisma.repuestos.findMany({
      where: {
        activo: true,
        stock_actual: { lte: 2 }
      },
      orderBy: { stock_actual: "asc" },
      take: 5
    });

    return NextResponse.json({
      ordenesActivas,
      ordenesListas,
      ordenesMes,
      facturacionMes: Number(facturacionMes._sum.total || 0),
      facturacionMesAnterior: Number(facturacionMesAnterior._sum.total || 0),
      totalClientes,
      totalVehiculos,
      ordenesPorEstado,
      ultimasOrdenes,
      repuestosStockBajo,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener datos del dashboard" }, { status: 500 });
  }
}