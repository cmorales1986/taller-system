"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import LoadingCar from "@/components/ui/LoadingCar";

interface DashboardData {
  ordenesActivas: number;
  ordenesListas: number;
  ordenesMes: number;
  facturacionMes: number;
  facturacionMesAnterior: number;
  totalClientes: number;
  totalVehiculos: number;
  ordenesPorEstado: { estado: string; _count: { estado: number } }[];
  ultimasOrdenes: {
    id: string; numero: number; estado: string; total: number; creado_en: string;
    clientes: { nombre: string };
    vehiculos: { patente: string; marca: string; modelo: string };
  }[];
  repuestosStockBajo: {
    id: string; nombre: string; stock_actual: number; stock_minimo: number;
  }[];
}

const ESTADOS: Record<string, { label: string; color: string }> = {
  recibido:            { label: "Recibido",            color: "bg-blue-100 text-blue-700 border-blue-200" },
  en_diagnostico:      { label: "En diagnóstico",      color: "bg-purple-100 text-purple-700 border-purple-200" },
  esperando_repuestos: { label: "Esperando repuestos", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  en_reparacion:       { label: "En reparación",       color: "bg-orange-100 text-orange-700 border-orange-200" },
  listo:               { label: "Listo",               color: "bg-green-100 text-green-700 border-green-200" },
  entregado:           { label: "Entregado",           color: "bg-gray-100 text-gray-600 border-gray-200" },
  cancelado:           { label: "Cancelado",           color: "bg-red-100 text-red-700 border-red-200" },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingCar />
    </div>
  );

  if (!data) return null;

  const variacionFacturacion = data.facturacionMesAnterior > 0
    ? ((data.facturacionMes - data.facturacionMesAnterior) / data.facturacionMesAnterior * 100).toFixed(1)
    : null;

  const mes = new Date().toLocaleDateString("es-PY", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">

      {/* ── HEADER ── */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5 capitalize">{mes}</p>
      </div>

      {/* ── MÉTRICAS PRINCIPALES ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px" }}>

        {/* Órdenes activas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Órdenes activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-foreground">{data.ordenesActivas}</p>
            <p className="text-xs text-muted-foreground mt-1">en el taller ahora</p>
            {data.ordenesListas > 0 && (
              <p className="text-xs text-green-600 font-medium mt-2">
                {data.ordenesListas} lista{data.ordenesListas > 1 ? "s" : ""} para entregar
              </p>
            )}
          </CardContent>
        </Card>

        {/* Órdenes del mes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Órdenes este mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-foreground">{data.ordenesMes}</p>
            <p className="text-xs text-muted-foreground mt-1">ingresadas en {mes}</p>
          </CardContent>
        </Card>

        {/* Facturación del mes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Facturación del mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {data.facturacionMes.toLocaleString("es-PY")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Guaraníes</p>
            {variacionFacturacion && (
              <p className={`text-xs font-medium mt-2 ${
                Number(variacionFacturacion) >= 0 ? "text-green-600" : "text-red-500"
              }`}>
                {Number(variacionFacturacion) >= 0 ? "▲" : "▼"} {Math.abs(Number(variacionFacturacion))}% vs mes anterior
              </p>
            )}
          </CardContent>
        </Card>

        {/* Clientes y vehículos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Base de datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Clientes</span>
                <span className="text-xl font-bold">{data.totalClientes}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Vehículos</span>
                <span className="text-xl font-bold">{data.totalVehiculos}</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ── FILA 2: ÓRDENES POR ESTADO + STOCK BAJO ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

        {/* Órdenes por estado */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Órdenes por estado</CardTitle>
          </CardHeader>
          <CardContent>
            {data.ordenesPorEstado.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Sin órdenes</p>
            ) : (
              <div className="space-y-3">
                {data.ordenesPorEstado
                  .sort((a, b) => b._count.estado - a._count.estado)
                  .map(item => (
                    <div key={item.estado} className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ESTADOS[item.estado]?.color}`}>
                        {ESTADOS[item.estado]?.label || item.estado}
                      </span>
                      <div className="flex items-center gap-3 flex-1 mx-4">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-orange-400 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min((item._count.estado / Math.max(...data.ordenesPorEstado.map(o => o._count.estado))) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-foreground w-6 text-right">
                        {item._count.estado}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock bajo */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Repuestos con stock bajo</CardTitle>
              {data.repuestosStockBajo.length > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">
                  ⚠ {data.repuestosStockBajo.length}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {data.repuestosStockBajo.length === 0 ? (
              <div className="flex items-center gap-2 py-4">
                <span className="text-green-500 text-lg">✓</span>
                <p className="text-sm text-muted-foreground">Todo el stock está en orden</p>
              </div>
            ) : (
              <div className="space-y-0">
                {data.repuestosStockBajo.map((r, i) => (
                  <div key={r.id}>
                    <div className="flex justify-between items-center py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.nombre}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Mínimo: {r.stock_minimo} unidades
                        </p>
                      </div>
                      <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${
                        r.stock_actual === 0
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {r.stock_actual} und.
                      </span>
                    </div>
                    {i < data.repuestosStockBajo.length - 1 && <Separator />}
                  </div>
                ))}
                <Separator className="mt-1" />
                <div className="pt-3">
                  <Link href="/repuestos"
                    className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                    Ver todos los repuestos →
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* ── ÚLTIMAS ÓRDENES ── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Últimas órdenes</CardTitle>
            <Link href="/ordenes"
              className="text-xs text-orange-500 hover:text-orange-600 font-medium">
              Ver todas →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {data.ultimasOrdenes.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Sin órdenes registradas</p>
          ) : (
            <div>
              {data.ultimasOrdenes.map((o, i) => (
                <div key={o.id}>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-muted-foreground w-20">
                        OR-{String(o.numero).padStart(4, "0")}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{o.clientes.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          <span className="bg-foreground text-background text-xs font-bold px-1.5 py-0.5 rounded mr-1">
                            {o.vehiculos.patente}
                          </span>
                          {o.vehiculos.marca} {o.vehiculos.modelo}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ESTADOS[o.estado]?.color}`}>
                        {ESTADOS[o.estado]?.label}
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {Number(o.total).toLocaleString("es-PY")} Gs.
                      </span>
                      <Link href={`/ordenes/${o.id}`}
                        className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                        Ver →
                      </Link>
                    </div>
                  </div>
                  {i < data.ultimasOrdenes.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}