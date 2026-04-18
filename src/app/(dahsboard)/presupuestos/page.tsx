/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

 

  async function fetchPresupuestos() {
    setLoading(true);
    const res = await fetch("/api/presupuestos");
    setPresupuestos(await res.json());
    setLoading(false);
  }

   useEffect(() => { fetchPresupuestos(); }, []);

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
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Presupuestos</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{presupuestos.length} presupuestos registrados</p>
        </div>
        <Button onClick={() => router.push("/presupuestos/nueva")}
          className="bg-orange-500 hover:bg-orange-600 text-white">
          + Nuevo Presupuesto
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3">
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
          className="w-full max-w-sm border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          placeholder="Buscar por cliente, patente o número..." />
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          style={selectStyle}
          className="border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Cargando...</div>
          ) : filtrados.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {busqueda || filtroEstado ? "No se encontraron presupuestos" : "No hay presupuestos registrados aún"}
            </div>
          ) : (
            <div>
              {filtrados.map((p, i) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between px-6 py-4">
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
                      <Link href={`/presupuestos/${p.id}`}
                        className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                        Ver →
                      </Link>
                    </div>
                  </div>
                  {i < filtrados.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}