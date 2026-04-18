"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  clientes: { id: string; nombre: string; telefono: string | null; email: string | null };
  vehiculos: { id: string; patente: string; marca: string; modelo: string; anio: number | null; color: string | null };
  usuarios_ordenes_reparacion_asignado_aTousuarios: { nombre: string } | null;
  or_repuestos: { id: string; descripcion: string; cantidad: number; precio_unitario: number; subtotal: number }[];
  or_servicios: { id: string; descripcion: string; cantidad: number; precio_unitario: number; subtotal: number }[];
  or_historial: { id: string; estado_anterior: string | null; estado_nuevo: string; comentario: string | null; creado_en: string; usuarios: { nombre: string } | null }[];
}

const ESTADOS: Record<string, { label: string; color: string }> = {
  recibido:            { label: "Recibido",            color: "bg-blue-100 text-blue-600" },
  en_diagnostico:      { label: "En diagnóstico",      color: "bg-purple-100 text-purple-600" },
  esperando_repuestos: { label: "Esperando repuestos", color: "bg-yellow-100 text-yellow-600" },
  en_reparacion:       { label: "En reparación",       color: "bg-orange-100 text-orange-600" },
  listo:               { label: "Listo",               color: "bg-green-100 text-green-600" },
  entregado:           { label: "Entregado",           color: "bg-gray-100 text-gray-600" },
  cancelado:           { label: "Cancelado",           color: "bg-red-100 text-red-600" },
};

const ORDEN_ESTADOS = ["recibido", "en_diagnostico", "esperando_repuestos", "en_reparacion", "listo", "entregado"];

export default function OrdenDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [orden, setOrden] = useState<OrdenDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [diagnostico, setDiagnostico] = useState("");
  const [trabajoRealizado, setTrabajoRealizado] = useState("");

  useEffect(() => { fetchOrden(); }, []);

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
      body: JSON.stringify({ estado: nuevoEstado, diagnostico, trabajo_realizado: trabajoRealizado }),
    });
    await fetchOrden();
    setActualizando(false);
  }

  async function guardarNotas() {
    setActualizando(true);
    await fetch(`/api/ordenes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: orden?.estado, diagnostico, trabajo_realizado: trabajoRealizado }),
    });
    await fetchOrden();
    setActualizando(false);
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Cargando...</div>;
  if (!orden || !orden.clientes || !orden.vehiculos)
    return <div className="p-8 text-center text-gray-400">Orden no encontrada</div>;

  const estadoActualIndex = ORDEN_ESTADOS.indexOf(orden.estado);
  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* ── HEADER ── */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-600 text-sm transition-colors flex-shrink-0">
          ← Volver
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-800">
              OR-{String(orden.numero).padStart(4, "0")}
            </h1>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${ESTADOS[orden.estado]?.color}`}>
              {ESTADOS[orden.estado]?.label}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            Creada el {new Date(orden.creado_en).toLocaleDateString("es-PY", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* ── PROGRESO DE ESTADOS ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-700 mb-6">Estado de la orden</h2>
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
                    className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${
                      esActual ? "bg-orange-500 text-white scale-110 shadow-md" :
                      esPasado ? "bg-green-500 text-white cursor-pointer hover:scale-105" :
                      "bg-gray-200 text-gray-400 cursor-pointer hover:bg-gray-300"
                    }`}>
                    {esPasado ? "✓" : i + 1}
                  </button>
                  <span className={`text-xs mt-2 text-center leading-tight w-16 ${
                    esActual ? "text-orange-600 font-medium" :
                    esPasado ? "text-green-600" : "text-gray-400"
                  }`}>
                    {ESTADOS[est]?.label}
                  </span>
                </div>
                {i < ORDEN_ESTADOS.length - 1 && (
                  <div className={`h-0.5 flex-1 mb-6 ${i < estadoActualIndex ? "bg-green-400" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
        {orden.estado !== "entregado" && orden.estado !== "cancelado" && (
          <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
            {estadoActualIndex < ORDEN_ESTADOS.length - 1 && (
              <button
                onClick={() => cambiarEstado(ORDEN_ESTADOS[estadoActualIndex + 1])}
                disabled={actualizando}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {actualizando ? "Actualizando..." : `Avanzar a "${ESTADOS[ORDEN_ESTADOS[estadoActualIndex + 1]]?.label}"`}
              </button>
            )}
            <button
              onClick={() => cambiarEstado("cancelado")}
              disabled={actualizando}
              className="bg-gray-100 hover:bg-red-50 text-red-500 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Cancelar orden
            </button>
          </div>
        )}
      </div>

      {/* ── CARDS: CLIENTE · VEHÍCULO · DETALLES (3 columnas) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>

        {/* CARD CLIENTE */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-orange-500 mb-3">Cliente</h3>
          <p className="font-medium text-gray-800">{orden.clientes.nombre}</p>
          {orden.clientes.telefono && <p className="text-sm text-gray-500 mt-1">{orden.clientes.telefono}</p>}
          {orden.clientes.email && <p className="text-sm text-gray-500">{orden.clientes.email}</p>}
        </div>

        {/* CARD VEHÍCULO */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-orange-500 mb-3">Vehículo</h3>
          <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded">
            {orden.vehiculos.patente}
          </span>
          <p className="font-medium text-gray-800 mt-2">{orden.vehiculos.marca} {orden.vehiculos.modelo}</p>
          <p className="text-sm text-gray-500">{orden.vehiculos.anio} · {orden.vehiculos.color}</p>
          {orden.kilometraje && <p className="text-sm text-gray-500">{orden.kilometraje.toLocaleString()} km</p>}
        </div>

        {/* CARD DETALLES */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-orange-500 mb-3">Detalles</h3>
          {orden.usuarios_ordenes_reparacion_asignado_aTousuarios && (
            <p className="text-sm text-gray-600">
              <span className="text-gray-400">Mecánico:</span>{" "}
              {orden.usuarios_ordenes_reparacion_asignado_aTousuarios.nombre}
            </p>
          )}
          {orden.fecha_prometida && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="text-gray-400">Entrega est.:</span>{" "}
              {new Date(orden.fecha_prometida).toLocaleDateString("es-PY")}
            </p>
          )}
          {orden.fecha_entrega && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="text-gray-400">Entregado:</span>{" "}
              {new Date(orden.fecha_entrega).toLocaleDateString("es-PY")}
            </p>
          )}
          <p className="text-xl font-bold text-gray-800 mt-3">
            {Number(orden.total).toLocaleString("es-PY")} Gs.
          </p>
        </div>

      </div>

      {/* ── DIAGNÓSTICO Y TRABAJO ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Diagnóstico y trabajo</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Problema reportado por el cliente
            </label>
            <p className="text-gray-800 bg-gray-50 rounded-lg p-3 text-sm border border-gray-100">
              {orden.descripcion_problema}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Diagnóstico del mecánico</label>
            <textarea value={diagnostico} onChange={e => setDiagnostico(e.target.value)}
              className={inputClass} rows={3} placeholder="Describí el diagnóstico técnico..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Trabajo realizado</label>
            <textarea value={trabajoRealizado} onChange={e => setTrabajoRealizado(e.target.value)}
              className={inputClass} rows={3} placeholder="Describí el trabajo realizado..." />
          </div>
          <button onClick={guardarNotas} disabled={actualizando}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {actualizando ? "Guardando..." : "Guardar notas"}
          </button>
        </div>
      </div>

      {/* ── REPUESTOS Y MANO DE OBRA (2 columnas) ── */}
      <div >

        {/* CARD REPUESTOS */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-orange-500 mb-4">Repuestos</h3>
          {orden.or_repuestos.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Sin repuestos</p>
          ) : (
            <div>
              {orden.or_repuestos.map(r => (
                <div key={r.id} className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-gray-700 font-medium text-sm">{r.descripcion}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {r.cantidad} × {Number(r.precio_unitario).toLocaleString("es-PY")} Gs.
                    </p>
                  </div>
                  <span className="font-semibold text-gray-800 text-sm flex-shrink-0">
                    {Number(r.subtotal).toLocaleString("es-PY")} Gs.
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3">
                <span className="text-sm text-gray-500">Total repuestos</span>
                <span className="font-bold text-gray-800">
                  {orden.or_repuestos.reduce((acc, r) => acc + Number(r.subtotal), 0).toLocaleString("es-PY")} Gs.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* CARD MANO DE OBRA */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-orange-500 mb-4">Mano de obra</h3>
          {orden.or_servicios.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Sin servicios</p>
          ) : (
            <div>
              {orden.or_servicios.map(s => (
                <div key={s.id} className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-gray-700 font-medium text-sm">{s.descripcion}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {s.cantidad} × {Number(s.precio_unitario).toLocaleString("es-PY")} Gs.
                    </p>
                  </div>
                  <span className="font-semibold text-gray-800 text-sm flex-shrink-0">
                    {Number(s.subtotal).toLocaleString("es-PY")} Gs.
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3">
                <span className="text-sm text-gray-500">Total mano de obra</span>
                <span className="font-bold text-gray-800">
                  {orden.or_servicios.reduce((acc, s) => acc + Number(s.subtotal), 0).toLocaleString("es-PY")} Gs.
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── HISTORIAL DE CAMBIOS ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Historial de cambios</h2>
        {orden.or_historial.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Sin historial</p>
        ) : (
          <div className="space-y-4">
            {orden.or_historial.map(h => (
              <div key={h.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    {h.estado_anterior ? (
                      <>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADOS[h.estado_anterior]?.color}`}>
                          {ESTADOS[h.estado_anterior]?.label}
                        </span>
                        <span className="text-gray-400 mx-2">→</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADOS[h.estado_nuevo]?.color}`}>
                          {ESTADOS[h.estado_nuevo]?.label}
                        </span>
                      </>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADOS[h.estado_nuevo]?.color}`}>
                        Orden creada — {ESTADOS[h.estado_nuevo]?.label}
                      </span>
                    )}
                  </p>
                  {h.comentario && <p className="text-xs text-gray-500 mt-1">{h.comentario}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(h.creado_en).toLocaleString("es-PY")}
                    {h.usuarios && ` · ${h.usuarios.nombre}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}