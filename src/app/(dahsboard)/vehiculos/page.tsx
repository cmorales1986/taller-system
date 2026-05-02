"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Vehiculo {
  id: string;
  patente: string;
  marca: string;
  modelo: string;
  anio: number | null;
  color: string | null;
  kilometraje: number | null;
  clientes: { id: string; nombre: string; telefono: string | null };
}

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetch("/api/vehiculos")
      .then(r => r.json())
      .then(data => { setVehiculos(data); setLoading(false); });
  }, []);

  const filtrados = vehiculos.filter(v =>
    v.patente.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.modelo.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.clientes?.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-4 lg:space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Vehículos</h1>
          <p className="text-gray-500 text-sm mt-1">{vehiculos.length} vehículos registrados</p>
        </div>
        <Link
          href="/vehiculos/nuevo"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nuevo Vehículo
        </Link>
      </div>

      {/* Buscador */}
      <input
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        placeholder="Buscar por patente, marca, modelo o cliente..."
      />

      {/* Tabla desktop / Cards mobile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {busqueda ? "No se encontraron vehículos" : "No hay vehículos registrados aún"}
          </div>
        ) : (
          <>
            {/* Tabla — solo desktop */}
            <table className="w-full text-sm hidden md:table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Patente</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Vehículo</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Año</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Color</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Kilometraje</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Cliente</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded">
                        {v.patente}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{v.marca} {v.modelo}</td>
                    <td className="px-6 py-4 text-gray-500">{v.anio || "—"}</td>
                    <td className="px-6 py-4 text-gray-500">{v.color || "—"}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {v.kilometraje ? `${v.kilometraje.toLocaleString()} km` : "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{v.clientes?.nombre}</td>
                    <td className="px-6 py-4">
                      <Link href={`/vehiculos/${v.id}`} className="text-orange-500 hover:text-orange-600 font-medium text-xs">
                        Ver detalle →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Cards — solo mobile */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtrados.map(v => (
                <div key={v.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-gray-900 text-white text-xs font-bold px-2 py-0.5 rounded">
                        {v.patente}
                      </span>
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {v.marca} {v.modelo}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {[v.anio, v.color, v.kilometraje ? `${v.kilometraje.toLocaleString()} km` : null]
                        .filter(Boolean).join(" · ")}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{v.clientes?.nombre}</p>
                  </div>
                  <Link href={`/vehiculos/${v.id}`} className="text-orange-500 hover:text-orange-600 font-medium text-xs shrink-0">
                    Ver →
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}