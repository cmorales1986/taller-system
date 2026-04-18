/* eslint-disable react-hooks/immutability */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Orden {
  id: string; numero: number; estado: string;
  descripcion_problema: string; total: number;
  fecha_prometida: string | null; creado_en: string;
  clientes: { nombre: string; telefono: string | null };
  vehiculos: { patente: string; marca: string; modelo: string };
  usuarios_ordenes_reparacion_asignado_aTousuarios: { nombre: string } | null;
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

export default function OrdenesPage() {
  const router = useRouter();
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  useEffect(() => {
    fetchOrdenes();
  }, []);

  async function fetchOrdenes() {
    setLoading(true);
    const res = await fetch("/api/ordenes");
    setOrdenes(await res.json());
    setLoading(false);
  }

  const filtradas = ordenes.filter(o => {
    const matchBusqueda =
      o.vehiculos.patente.toLowerCase().includes(busqueda.toLowerCase()) ||
      o.clientes.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      `OR-${String(o.numero).padStart(4, "0")}`.includes(busqueda);
    const matchEstado = filtroEstado ? o.estado === filtroEstado : true;
    return matchBusqueda && matchEstado;
  });

  const selectStyle = { color: "#111827" };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Órdenes de Reparación</h1>
          <p className="text-gray-500 text-sm mt-1">{ordenes.length} órdenes registradas</p>
        </div>
        <button
          onClick={() => router.push("/ordenes/nueva")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Nueva Orden
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-4">
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Buscar por patente, cliente o número..." />
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          style={selectStyle}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400">
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : filtradas.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {busqueda || filtroEstado ? "No se encontraron órdenes" : "No hay órdenes registradas aún"}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">N°</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Vehículo</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Cliente</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Problema</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Estado</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Mecánico</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Total</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtradas.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-bold text-gray-600">
                      OR-{String(o.numero).padStart(4, "0")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded mr-2">
                      {o.vehiculos.patente}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {o.vehiculos.marca} {o.vehiculos.modelo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{o.clientes.nombre}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                    {o.descripcion_problema}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${ESTADOS[o.estado]?.color}`}>
                      {ESTADOS[o.estado]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {o.usuarios_ordenes_reparacion_asignado_aTousuarios?.nombre || "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">
                    {Number(o.total).toLocaleString("es-PY")} Gs.
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/ordenes/${o.id}`}
                      className="text-orange-500 hover:text-orange-600 font-medium text-xs">
                      Ver detalle →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}