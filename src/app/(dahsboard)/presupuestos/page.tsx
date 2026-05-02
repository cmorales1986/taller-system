/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Presupuesto {
  id: string; numero: number; estado: string;
  total: number; validez_dias: number; creado_en: string;
  clientes: { nombre: string };
  vehiculos: { patente: string; marca: string; modelo: string };
  presupuesto_repuestos: { id: string }[];
  presupuesto_servicios: { id: string }[];
}

const ESTADOS: Record<string, { label: string; color: string }> = {
  borrador:  { label: "Borrador",  color: "bg-gray-100 text-gray-600 border-gray-200" },
  enviado:   { label: "Enviado",   color: "bg-blue-100 text-blue-700 border-blue-200" },
  aprobado:  { label: "Aprobado",  color: "bg-green-100 text-green-700 border-green-200" },
  rechazado: { label: "Rechazado", color: "bg-red-100 text-red-700 border-red-200" },
  vencido:   { label: "Vencido",   color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
};

export default function PresupuestosPage() {
  const router = useRouter();
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  useEffect(() => { fetchPresupuestos(); }, []);

  async function fetchPresupuestos() {
    setLoading(true);
    const res = await fetch("/api/presupuestos");
    setPresupuestos(await res.json());
    setLoading(false);
  }

  const filtrados = presupuestos.filter(p => {
    const matchBusqueda =
      p.clientes.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.vehiculos.patente.toLowerCase().includes(busqueda.toLowerCase()) ||
      `P-${String(p.numero).padStart(4, "0")}`.includes(busqueda);
    const matchEstado = filtroEstado ? p.estado === filtroEstado : true;
    return matchBusqueda && matchEstado;
  });

  const selectStyle = { color: "#111827" };

  return (
    <div className="space-y-4 lg:space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold">Presupuestos</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{presupuestos.length} presupuestos registrados</p>
        </div>
        <Link href="/presupuestos/nueva"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
          + Nuevo Presupuesto
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
          className="w-full sm:max-w-xs border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-background"
          placeholder="Buscar por cliente, patente o número..." />
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          style={selectStyle}
          className="w-full sm:w-auto border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-orange-400">
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      {/* Lista */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Cargando...</div>
          ) : filtrados.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {busqueda || filtroEstado ? "No se encontraron presupuestos" : "No hay presupuestos registrados aún"}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtrados.map(p => (
                <div key={p.id} className="p-4">
                  {/* Mobile layout */}
                  <div className="flex items-start justify-between gap-2 mb-2 lg:hidden">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-bold text-muted-foreground">
                          P-{String(p.numero).padStart(4, "0")}
                        </span>
                        <span className="bg-foreground text-background text-xs font-bold px-1.5 py-0.5 rounded">
                          {p.vehiculos.patente}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ESTADOS[p.estado]?.color}`}>
                          {ESTADOS[p.estado]?.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{p.clientes.nombre}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.vehiculos.marca} {p.vehiculos.modelo}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.presupuesto_repuestos.length} repuesto{p.presupuesto_repuestos.length !== 1 ? "s" : ""} · {p.presupuesto_servicios.length} servicio{p.presupuesto_servicios.length !== 1 ? "s" : ""}
                      </p>
                      <p className="text-sm font-bold mt-1">{Number(p.total).toLocaleString("es-PY")} Gs.</p>
                    </div>
                    <Link href={`/presupuestos/${p.id}`} className="text-orange-500 text-xs font-medium shrink-0">
                      Ver →
                    </Link>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden lg:flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs font-bold text-muted-foreground w-20">
                        P-{String(p.numero).padStart(4, "0")}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.clientes.nombre}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <span className="bg-foreground text-background text-xs font-bold px-1.5 py-0.5 rounded mr-1">
                            {p.vehiculos.patente}
                          </span>
                          {p.vehiculos.marca} {p.vehiculos.modelo}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{p.presupuesto_repuestos.length} repuesto{p.presupuesto_repuestos.length !== 1 ? "s" : ""}</p>
                        <p>{p.presupuesto_servicios.length} servicio{p.presupuesto_servicios.length !== 1 ? "s" : ""}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ESTADOS[p.estado]?.color}`}>
                        {ESTADOS[p.estado]?.label}
                      </span>
                      <span className="text-sm font-bold text-foreground w-36 text-right">
                        {Number(p.total).toLocaleString("es-PY")} Gs.
                      </span>
                      <Link href={`/presupuestos/${p.id}`} className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                        Ver →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}