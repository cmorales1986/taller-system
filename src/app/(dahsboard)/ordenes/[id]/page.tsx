/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import LoadingCar from "@/components/ui/LoadingCar";
import { OrdenPDF } from "@/components/pdf/OrdenPDF";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false },
);

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

const ESTADOS: Record<string, { label: string; color: string }> = {
  recibido: {
    label: "Recibido",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  en_diagnostico: {
    label: "En diagnóstico",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  esperando_repuestos: {
    label: "Esperando repuestos",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  en_reparacion: {
    label: "En reparación",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  listo: {
    label: "Listo",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  entregado: {
    label: "Entregado",
    color: "bg-gray-100 text-gray-600 border-gray-200",
  },
  cancelado: {
    label: "Cancelado",
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
      .then((r) => r.json())
      .then((facturas: { id: string; orden_id: string }[]) => {
        const factura = facturas.find((f) => f.orden_id === ordenId);
        if (factura) {
          setTieneFactura(true);
          setFacturaId(factura.id);
        } else setTieneFactura(false);
      });
  }, [ordenId]);

  if (tieneFactura === null) return null;
  if (tieneFactura && facturaId) {
    return (
      <Button
        onClick={() => router.push(`/facturas/${facturaId}`)}
        variant="outline"
        className="text-green-600 border-green-200 hover:bg-green-50 text-xs mt-2"
      >
        ✓ Ver Factura emitida
      </Button>
    );
  }
  return (
    <Button
      onClick={() => router.push(`/ordenes/${ordenId}/facturar`)}
      className="bg-orange-500 hover:bg-orange-600 text-white text-xs mt-2"
    >
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

  if (loading) return <LoadingCar />;
  if (!orden?.clientes)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Orden no encontrada</p>
      </div>
    );

  const estadoActualIndex = ORDEN_ESTADOS.indexOf(orden.estado);
  const inputClass =
    "w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-orange-400";

  return (
    <div className="space-y-4 lg:space-y-6 pb-10">
      {/* ── HEADER ── */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-muted-foreground shrink-0 mt-1"
        >
          ← Volver
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold">
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
          <div className="flex flex-wrap gap-2 mt-2">
            {(orden.estado === "listo" || orden.estado === "entregado") && (
              <BotonFactura ordenId={id} />
            )}
            <PDFDownloadLink
              document={<OrdenPDF orden={orden} />}
              fileName={`OR-${String(orden.numero).padStart(4, "0")}.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <button className="text-xs bg-gray-800 hover:bg-gray-900 text-white px-3 py-1.5 rounded-lg font-medium transition-colors mt-2 flex items-center gap-1.5">
                  {pdfLoading ? "Generando..." : "⬇ Descargar PDF"}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      </div>

      {/* ── PROGRESO — scroll horizontal en mobile ── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Estado de la orden</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center min-w-max">
              {ORDEN_ESTADOS.map((est, i) => {
                const esActual = est === orden.estado;
                const esPasado = i < estadoActualIndex;
                return (
                  <div key={est} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => cambiarEstado(est)}
                        disabled={actualizando || esActual}
                        className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full text-xs font-bold transition-all border-2 ${
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
                        className={`text-xs mt-1.5 text-center leading-tight w-14 ${
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
                        className={`h-0.5 w-8 lg:w-12 mb-5 mx-1 transition-colors ${i < estadoActualIndex ? "bg-green-400" : "bg-border"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {orden.estado !== "entregado" && orden.estado !== "cancelado" && (
            <>
              <Separator className="mt-4 mb-4" />
              <div className="flex flex-wrap gap-2">
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

      {/* ── CLIENTE · VEHÍCULO · DETALLES ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-orange-500 font-bold">
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-semibold">{orden.clientes.nombre}</p>
            {orden.clientes.telefono && (
              <p className="text-sm text-muted-foreground">
                {orden.clientes.telefono}
              </p>
            )}
            {orden.clientes.email && (
              <p className="text-sm text-muted-foreground break-all">
                {orden.clientes.email}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widests text-orange-500 font-bold">
              Vehículo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <span className="bg-foreground text-background text-xs font-bold px-2 py-1 rounded">
              {orden.vehiculos.patente}
            </span>
            <p className="font-semibold pt-1">
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

        <Card className="sm:col-span-2 lg:col-span-1">
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
            <p className="text-2xl font-bold pt-2">
              {Number(orden.total).toLocaleString("es-PY")} Gs.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── DIAGNÓSTICO ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Diagnóstico y trabajo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Problema reportado
            </p>
            <div className="bg-muted rounded-lg p-3 text-sm border border-border">
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

      {/* ── REPUESTOS + SERVICIOS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
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
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="text-sm font-medium">{r.descripcion}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {r.cantidad} ×{" "}
                          {Number(r.precio_unitario).toLocaleString("es-PY")}{" "}
                          Gs.
                        </p>
                      </div>
                      <span className="text-sm font-semibold shrink-0">
                        {Number(r.subtotal).toLocaleString("es-PY")} Gs.
                      </span>
                    </div>
                    {i < orden.or_repuestos.length - 1 && <Separator />}
                  </div>
                ))}
                <Separator className="mt-1" />
                <div className="flex justify-between pt-3">
                  <span className="text-sm text-muted-foreground">
                    Total repuestos
                  </span>
                  <span className="font-bold">
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
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="text-sm font-medium">{s.descripcion}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {s.cantidad} ×{" "}
                          {Number(s.precio_unitario).toLocaleString("es-PY")}{" "}
                          Gs.
                        </p>
                      </div>
                      <span className="text-sm font-semibold shrink-0">
                        {Number(s.subtotal).toLocaleString("es-PY")} Gs.
                      </span>
                    </div>
                    {i < orden.or_servicios.length - 1 && <Separator />}
                  </div>
                ))}
                <Separator className="mt-1" />
                <div className="flex justify-between pt-3">
                  <span className="text-sm text-muted-foreground">
                    Total mano de obra
                  </span>
                  <span className="font-bold">
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

      {/* ── HISTORIAL ── */}
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
                    <div className="flex-1 min-w-0">
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
