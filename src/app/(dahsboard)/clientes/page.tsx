"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  const [showForm, setShowForm] = useState(false);

  // Formulario
  const [form, setForm] = useState({
    nombre: "", ruc_ci: "", telefono: "", email: "", direccion: "", notas: ""
  });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    fetchClientes();
  }, []);

  async function fetchClientes() {
    setLoading(true);
    const res = await fetch("/api/clientes");
    const data = await res.json();
    setClientes(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ nombre: "", ruc_ci: "", telefono: "", email: "", direccion: "", notas: "" });
    setShowForm(false);
    setGuardando(false);
    fetchClientes();
  }

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.ruc_ci?.includes(busqueda) ||
    c.telefono?.includes(busqueda)
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
          <p className="text-gray-500 text-sm mt-1">{clientes.length} clientes registrados</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nuevo Cliente
        </button>
      </div>

      {/* Formulario nuevo cliente */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Nuevo Cliente</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nombre *</label>
              <input
                required
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Nombre completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">RUC / CI</label>
              <input
                value={form.ruc_ci}
                onChange={e => setForm({ ...form, ruc_ci: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="RUC o cédula"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono</label>
              <input
                value={form.telefono}
                onChange={e => setForm({ ...form, telefono: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="0981 000 000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Dirección</label>
              <input
                value={form.direccion}
                onChange={e => setForm({ ...form, direccion: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Dirección"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Notas</label>
              <textarea
                value={form.notas}
                onChange={e => setForm({ ...form, notas: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                rows={2}
                placeholder="Observaciones adicionales"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={guardando}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Guardar Cliente"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Buscador */}
      <div className="mb-4">
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Buscar por nombre, RUC o teléfono..."
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {busqueda ? "No se encontraron clientes" : "No hay clientes registrados aún"}
          </div>
        ) : (
          <table className="w-full text-sm">
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
                    <Link
                      href={`/clientes/${c.id}`}
                      className="text-orange-500 hover:text-orange-600 font-medium text-xs"
                    >
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