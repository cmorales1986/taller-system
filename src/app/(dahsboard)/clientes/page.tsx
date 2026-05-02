"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingCar from "@/components/ui/LoadingCar";

interface Cliente {
  id: string;
  nombre: string;
  ruc_ci: string | null;
  telefono: string | null;
  email: string | null;
  _count: { vehiculos: number };
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetch("/api/clientes")
      .then(r => r.json())
      .then(data => { setClientes(data); setLoading(false); });
  }, []);

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.ruc_ci?.includes(busqueda) ||
    c.telefono?.includes(busqueda)
  );

  return (
    <div className="space-y-4 lg:space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Clientes</h1>
          <p className="text-gray-500 text-sm mt-1">{clientes.length} clientes registrados</p>
        </div>
        <Link
          href="/clientes/nuevo"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nuevo Cliente
        </Link>
      </div>

      {/* Buscador */}
      <input
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        placeholder="Buscar por nombre, RUC o teléfono..."
      />

      {/* Tabla desktop / Cards mobile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <LoadingCar />
        ) : filtrados.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {busqueda ? "No se encontraron clientes" : "No hay clientes registrados aún"}
          </div>
        ) : (
          <>
            {/* Tabla — solo en desktop */}
            <table className="w-full text-sm hidden md:table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Nombre</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">RUC / CI</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Teléfono</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Email</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Vehículos</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">{c.nombre}</td>
                    <td className="px-6 py-4 text-gray-500">{c.ruc_ci || "—"}</td>
                    <td className="px-6 py-4 text-gray-500">{c.telefono || "—"}</td>
                    <td className="px-6 py-4 text-gray-500">{c.email || "—"}</td>
                    <td className="px-6 py-4">
                      <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-1 rounded-full">
                        {c._count.vehiculos} vehículo{c._count.vehiculos !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/clientes/${c.id}`} className="text-orange-500 hover:text-orange-600 font-medium text-xs">
                        Ver detalle →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Cards — solo en mobile */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtrados.map(c => (
                <div key={c.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{c.nombre}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {c.telefono || c.ruc_ci || "Sin datos de contacto"}
                    </p>
                    <span className="inline-block mt-1 bg-orange-100 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {c._count.vehiculos} vehículo{c._count.vehiculos !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <Link href={`/clientes/${c.id}`} className="text-orange-500 hover:text-orange-600 font-medium text-xs shrink-0">
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