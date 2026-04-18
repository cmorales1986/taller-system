/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Factura {
  id: string; numero: number; estado: string;
  total: number; subtotal: number; iva_monto: number;
  metodo_pago: string | null; creado_en: string; fecha_pago: string | null;
  clientes: { nombre: string };
  ordenes_reparacion: {
    numero: number;
    vehiculos: { patente: string; marca: string; modelo: string };
  } | null;
}

const ESTADOS: Record<string, { label: string; color: string }> = {
  emitida: { label: "Emitida",  color: "bg-blue-100 text-blue-700 border-blue-200" },
  pagada:  { label: "Pagada",   color: "bg-green-100 text-green-700 border-green-200" },
  anulada: { label: "Anulada",  color: "bg-red-100 text-red-700 border-red-200" },
};

const METODOS: Record<string, string> = {
  efectivo:      "Efectivo",
  transferencia: "Transferencia",
  tarjeta:       "Tarjeta",
  cheque:        "Cheque",
  credito:       "Crédito",
};

export default function FacturasPage() {
  const router = useRouter();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  async function fetchFacturas() {
    setLoading(true);
    const res = await fetch("/api/facturas");
    setFacturas(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchFacturas(); }, []);

  const filtradas = facturas.filter(f => {
    const matchBusqueda =
      f.clientes.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      `F-${String(f.numero).padStart(4, "0")}`.includes(busqueda) ||
      f.ordenes_reparacion?.vehiculos.patente.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado ? f.estado === filtroEstado : true;
    return matchBusqueda && matchEstado;
  });

  const totalFacturado = facturas
    .filter(f => f.estado === "pagada")
    .reduce((acc, f) => acc + Number(f.total), 0);

  const selectStyle = { color: "#111827" };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Facturas</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {facturas.length} facturas · {totalFacturado.toLocaleString("es-PY")} Gs. cobrados
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Total emitidas</p>
            <p className="text-3xl font-bold">{facturas.filter(f => f.estado === "emitida").length}</p>
            <p className="text-xs text-muted-foreground mt-1">pendientes de cobro</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Total pagadas</p>
            <p className="text-3xl font-bold text-green-600">{facturas.filter(f => f.estado === "pagada").length}</p>
            <p className="text-xs text-muted-foreground mt-1">cobradas exitosamente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Monto cobrado</p>
            <p className="text-2xl font-bold text-green-600">{totalFacturado.toLocaleString("es-PY")}</p>
            <p className="text-xs text-muted-foreground mt-1">Guaraníes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-3">
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
          className="w-full max-w-sm border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
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

      {/* Lista */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Cargando...</div>
          ) : filtradas.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {busqueda || filtroEstado ? "No se encontraron facturas" : "No hay facturas registradas aún"}
            </div>
          ) : (
            <div>
              {filtradas.map((f, i) => (
                <div key={f.id}>
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs font-bold text-muted-foreground w-20">
                        F-{String(f.numero).padStart(4, "0")}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{f.clientes.nombre}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {f.ordenes_reparacion && (
                            <>
                              <span className="bg-foreground text-background text-xs font-bold px-1.5 py-0.5 rounded">
                                {f.ordenes_reparacion.vehiculos.patente}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {f.ordenes_reparacion.vehiculos.marca} {f.ordenes_reparacion.vehiculos.modelo}
                              </span>
                              <span className="text-xs text-muted-foreground">·</span>
                              <span className="font-mono text-xs text-muted-foreground">
                                OR-{String(f.ordenes_reparacion.numero).padStart(4, "0")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{new Date(f.creado_en).toLocaleDateString("es-PY")}</p>
                        {f.metodo_pago && <p>{METODOS[f.metodo_pago] || f.metodo_pago}</p>}
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ESTADOS[f.estado]?.color}`}>
                        {ESTADOS[f.estado]?.label}
                      </span>
                      <span className="text-sm font-bold text-foreground w-40 text-right">
                        {Number(f.total).toLocaleString("es-PY")} Gs.
                      </span>
                      <Link href={`/facturas/${f.id}`}
                        className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                        Ver →
                      </Link>
                    </div>
                  </div>
                  {i < filtradas.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}