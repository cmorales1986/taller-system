/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface OrdenDetalle {
  id: string;
  numero: number;
  estado: string;
  descripcion_problema: string;
  diagnostico: string | null;
  trabajo_realizado: string | null;
  notas: string | null;
  kilometraje: number | null;
  total: number;
  subtotal: number;
  fecha_prometida: string | null;
  fecha_entrega: string | null;
  creado_en: string;
  clientes: {
    id: string;
    nombre: string;
    telefono: string | null;
    email: string | null;
  };
  vehiculos: {
    id: string;
    patente: string;
    marca: string;
    modelo: string;
    anio: number | null;
    color: string | null;
  };
  usuarios_ordenes_reparacion_asignado_aTousuarios: { nombre: string } | null;
  or_repuestos: {
    id: string;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
  or_servicios: {
    id: string;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
  or_historial: {
    id: string;
    estado_anterior: string | null;
    estado_nuevo: string;
    comentario: string | null;
    creado_en: string;
    usuarios: { nombre: string } | null;
  }[];
}

const ESTADOS: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    color: string;
  }
> = {
  recibido: {
    label: "Recibido",
    variant: "secondary",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  en_diagnostico: {
    label: "En diagnóstico",
    variant: "secondary",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  esperando_repuestos: {
    label: "Esperando repuestos",
    variant: "secondary",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  en_reparacion: {
    label: "En reparación",
    variant: "secondary",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  listo: {
    label: "Listo",
    variant: "default",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  entregado: {
    label: "Entregado",
    variant: "outline",
    color: "bg-gray-100 text-gray-600 border-gray-200",
  },
  cancelado: {
    label: "Cancelado",
    variant: "destructive",
    color: "bg-red-100 text-red-700 border-red-200",
  },
};

const ORDEN_ESTADOS = [
  "recibido",
  "en_diagnostico",
  "esperando_repuestos",
  "en_reparacion",
  "listo",
  "entregado",
];

function BotonFactura({ ordenId }: { ordenId: string }) {
  const router = useRouter();
  const [tieneFactura, setTieneFactura] = useState<boolean | null>(null);
  const [facturaId, setFacturaId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/facturas?orden_id=${ordenId}`)
      .then(r => r.json())
      .then((facturas: { id: string; orden_id: string }[]) => {
        const factura = facturas.find(f => f.orden_id === ordenId);
        if (factura) {
          setTieneFactura(true);
          setFacturaId(factura.id);
        } else {
          setTieneFactura(false);
        }
      });
  }, [ordenId]);

  if (tieneFactura === null) return null;

  if (tieneFactura && facturaId) {
    return (
      <Button
        onClick={() => router.push(`/facturas/${facturaId}`)}
        variant="outline"
        className="text-green-600 border-green-200 hover:bg-green-50 text-xs mt-2">
        ✓ Ver Factura emitida
      </Button>
    );
  }

  return (
    <Button
      onClick={() => router.push(`/ordenes/${ordenId}/facturar`)}
      className="bg-orange-500 hover:bg-orange-600 text-white text-xs mt-2">
      🧾 Emitir Factura
    </Button>
  );
}

export default function OrdenDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [orden, setOrden] = useState<OrdenDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [diagnostico, setDiagnostico] = useState("");
  const [trabajoRealizado, setTrabajoRealizado] = useState("");

  useEffect(() => {
    fetchOrden();
  }, []);

  async function fetchOrden() {
    setLoading(true);
    const res = await fetch(`/api/ordenes/${id}`);
    const data = await res.json();
    setOrden(data);
    setDiagnostico(data.diagnostico || "");
    setTrabajoRealizado(data.trabajo_realizado || "");
    setLoading(false);
  }

  async function cambiarEstado(nuevoEstado: string) {
    setActualizando(true);
    await fetch(`/api/ordenes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estado: nuevoEstado,
        diagnostico,
        trabajo_realizado: trabajoRealizado,
      }),
    });
    await fetchOrden();
    setActualizando(false);
  }

  async function guardarNotas() {
    setActualizando(true);
    await fetch(`/api/ordenes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estado: orden?.estado,
        diagnostico,
        trabajo_realizado: trabajoRealizado,
      }),
    });
    await fetchOrden();
    setActualizando(false);
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );

  if (!orden || !orden.clientes || !orden.vehiculos)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Orden no encontrada</p>
      </div>
    );

  const estadoActualIndex = ORDEN_ESTADOS.indexOf(orden.estado);
  const inputClass =
    "w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="space-y-6 pb-10">
      {/* ── HEADER ── */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground"
        >
          ← Volver
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">
              OR-{String(orden.numero).padStart(4, "0")}
            </h1>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border ${ESTADOS[orden.estado]?.color}`}
            >
              {ESTADOS[orden.estado]?.label}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            Creada el{" "}
            {new Date(orden.creado_en).toLocaleDateString("es-PY", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
          {(orden.estado === "listo" || orden.estado === "entregado") && (
            <BotonFactura ordenId={id} />
          )}
        </div>
      </div>

      {/* ── PROGRESO DE ESTADOS ── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Estado de la orden</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            {ORDEN_ESTADOS.map((est, i) => {
              const esActual = est === orden.estado;
              const esPasado = i < estadoActualIndex;
              return (
                <div key={est} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <button
                      onClick={() => cambiarEstado(est)}
                      disabled={actualizando || esActual}
                      className={`w-9 h-9 rounded-full text-xs font-bold transition-all border-2 ${
                        esActual
                          ? "bg-orange-500 border-orange-500 text-white scale-110 shadow-md"
                          : esPasado
                            ? "bg-green-500 border-green-500 text-white hover:scale-105"
                            : "bg-background border-border text-muted-foreground hover:border-orange-300"
                      }`}
                    >
                      {esPasado ? "✓" : i + 1}
                    </button>
                    <span
                      className={`text-xs mt-2 text-center leading-tight w-16 ${
                        esActual
                          ? "text-orange-600 font-semibold"
                          : esPasado
                            ? "text-green-600"
                            : "text-muted-foreground"
                      }`}
                    >
                      {ESTADOS[est]?.label}
                    </span>
                  </div>
                  {i < ORDEN_ESTADOS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mb-6 transition-colors ${
                        i < estadoActualIndex ? "bg-green-400" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {orden.estado !== "entregado" && orden.estado !== "cancelado" && (
            <>
              <Separator className="mt-6 mb-4" />
              <div className="flex gap-2">
                {estadoActualIndex < ORDEN_ESTADOS.length - 1 && (
                  <Button
                    onClick={() =>
                      cambiarEstado(ORDEN_ESTADOS[estadoActualIndex + 1])
                    }
                    disabled={actualizando}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {actualizando
                      ? "Actualizando..."
                      : `Avanzar a "${ESTADOS[ORDEN_ESTADOS[estadoActualIndex + 1]]?.label}"`}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => cambiarEstado("cancelado")}
                  disabled={actualizando}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                >
                  Cancelar orden
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── CARDS: CLIENTE · VEHÍCULO · DETALLES ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
        }}
      >
        {/* CARD CLIENTE */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-orange-500 font-bold">
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-semibold text-foreground">
              {orden.clientes.nombre}
            </p>
            {orden.clientes.telefono && (
              <p className="text-sm text-muted-foreground">
                {orden.clientes.telefono}
              </p>
            )}
            {orden.clientes.email && (
              <p className="text-sm text-muted-foreground">
                {orden.clientes.email}
              </p>
            )}
          </CardContent>
        </Card>

        {/* CARD VEHÍCULO */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-orange-500 font-bold">
              Vehículo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div>
              <span className="bg-foreground text-background text-xs font-bold px-2 py-1 rounded">
                {orden.vehiculos.patente}
              </span>
            </div>
            <p className="font-semibold text-foreground pt-1">
              {orden.vehiculos.marca} {orden.vehiculos.modelo}
            </p>
            <p className="text-sm text-muted-foreground">
              {orden.vehiculos.anio} · {orden.vehiculos.color}
            </p>
            {orden.kilometraje && (
              <p className="text-sm text-muted-foreground">
                {orden.kilometraje.toLocaleString()} km
              </p>
            )}
          </CardContent>
        </Card>

        {/* CARD DETALLES */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-orange-500 font-bold">
              Detalles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {orden.usuarios_ordenes_reparacion_asignado_aTousuarios && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Mecánico:</span>{" "}
                {orden.usuarios_ordenes_reparacion_asignado_aTousuarios.nombre}
              </p>
            )}
            {orden.fecha_prometida && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  Entrega est.:
                </span>{" "}
                {new Date(orden.fecha_prometida).toLocaleDateString("es-PY")}
              </p>
            )}
            {orden.fecha_entrega && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Entregado:</span>{" "}
                {new Date(orden.fecha_entrega).toLocaleDateString("es-PY")}
              </p>
            )}
            <p className="text-2xl font-bold text-foreground pt-2">
              {Number(orden.total).toLocaleString("es-PY")} Gs.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── DIAGNÓSTICO Y TRABAJO ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Diagnóstico y trabajo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Problema reportado por el cliente
            </p>
            <div className="bg-muted rounded-lg p-3 text-sm text-foreground border border-border">
              {orden.descripcion_problema}
            </div>
          </div>
          <Separator />
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
              Diagnóstico del mecánico
            </label>
            <textarea
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              className={inputClass}
              rows={3}
              placeholder="Describí el diagnóstico técnico..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
              Trabajo realizado
            </label>
            <textarea
              value={trabajoRealizado}
              onChange={(e) => setTrabajoRealizado(e.target.value)}
              className={inputClass}
              rows={3}
              placeholder="Describí el trabajo realizado..."
            />
          </div>
          <Button
            onClick={guardarNotas}
            disabled={actualizando}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {actualizando ? "Guardando..." : "Guardar notas"}
          </Button>
        </CardContent>
      </Card>

      {/* ── REPUESTOS Y MANO DE OBRA ── */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        {/* CARD REPUESTOS */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-orange-500 font-bold">
              Repuestos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orden.or_repuestos.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Sin repuestos
              </p>
            ) : (
              <div>
                {orden.or_repuestos.map((r, i) => (
                  <div key={r.id}>
                    <div className="flex justify-between items-start py-3">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-sm font-medium text-foreground">
                          {r.descripcion}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {r.cantidad} ×{" "}
                          {Number(r.precio_unitario).toLocaleString("es-PY")}{" "}
                          Gs.
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-foreground shrink-0">
                        {Number(r.subtotal).toLocaleString("es-PY")} Gs.
                      </span>
                    </div>
                    {i < orden.or_repuestos.length - 1 && <Separator />}
                  </div>
                ))}
                <Separator className="mt-1" />
                <div className="flex justify-between items-center pt-3">
                  <span className="text-sm text-muted-foreground">
                    Total repuestos
                  </span>
                  <span className="font-bold text-foreground">
                    {orden.or_repuestos
                      .reduce((acc, r) => acc + Number(r.subtotal), 0)
                      .toLocaleString("es-PY")}{" "}
                    Gs.
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CARD MANO DE OBRA */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-orange-500 font-bold">
              Mano de obra
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orden.or_servicios.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Sin servicios
              </p>
            ) : (
              <div>
                {orden.or_servicios.map((s, i) => (
                  <div key={s.id}>
                    <div className="flex justify-between items-start py-3">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-sm font-medium text-foreground">
                          {s.descripcion}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {s.cantidad} ×{" "}
                          {Number(s.precio_unitario).toLocaleString("es-PY")}{" "}
                          Gs.
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-foreground shrink-0">
                        {Number(s.subtotal).toLocaleString("es-PY")} Gs.
                      </span>
                    </div>
                    {i < orden.or_servicios.length - 1 && <Separator />}
                  </div>
                ))}
                <Separator className="mt-1" />
                <div className="flex justify-between items-center pt-3">
                  <span className="text-sm text-muted-foreground">
                    Total mano de obra
                  </span>
                  <span className="font-bold text-foreground">
                    {orden.or_servicios
                      .reduce((acc, s) => acc + Number(s.subtotal), 0)
                      .toLocaleString("es-PY")}{" "}
                    Gs.
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── HISTORIAL DE CAMBIOS ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Historial de cambios</CardTitle>
        </CardHeader>
        <CardContent>
          {orden.or_historial.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Sin historial
            </p>
          ) : (
            <div className="space-y-4">
              {orden.or_historial.map((h, i) => (
                <div key={h.id}>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {h.estado_anterior ? (
                          <>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${ESTADOS[h.estado_anterior]?.color}`}
                            >
                              {ESTADOS[h.estado_anterior]?.label}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              →
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${ESTADOS[h.estado_nuevo]?.color}`}
                            >
                              {ESTADOS[h.estado_nuevo]?.label}
                            </span>
                          </>
                        ) : (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${ESTADOS[h.estado_nuevo]?.color}`}
                          >
                            Orden creada — {ESTADOS[h.estado_nuevo]?.label}
                          </span>
                        )}
                      </div>
                      {h.comentario && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {h.comentario}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(h.creado_en).toLocaleString("es-PY")}
                        {h.usuarios && ` · ${h.usuarios.nombre}`}
                      </p>
                    </div>
                  </div>
                  {i < orden.or_historial.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
