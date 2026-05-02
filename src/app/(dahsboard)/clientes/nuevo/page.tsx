"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevoClientePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: "", ruc_ci: "", telefono: "", email: "", direccion: "", notas: ""
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const res = await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setError("Error al guardar el cliente. Intentá de nuevo.");
      setGuardando(false);
      return;
    }

    router.push("/clientes");
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400";

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Volver
        </button>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Nuevo Cliente</h1>
          <p className="text-gray-500 text-sm mt-0.5">Completá los datos del cliente</p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Nombre *</label>
            <input
              required
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className={inputClass}
              placeholder="Nombre completo o razón social"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">RUC / CI</label>
            <input
              value={form.ruc_ci}
              onChange={e => setForm({ ...form, ruc_ci: e.target.value })}
              className={inputClass}
              placeholder="RUC o cédula"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono</label>
            <input
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
              className={inputClass}
              placeholder="0981 000 000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className={inputClass}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Dirección</label>
            <input
              value={form.direccion}
              onChange={e => setForm({ ...form, direccion: e.target.value })}
              className={inputClass}
              placeholder="Dirección"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Notas</label>
            <textarea
              value={form.notas}
              onChange={e => setForm({ ...form, notas: e.target.value })}
              className={inputClass}
              rows={3}
              placeholder="Observaciones adicionales"
            />
          </div>

        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={guardando}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar Cliente"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>

    </div>
  );
}