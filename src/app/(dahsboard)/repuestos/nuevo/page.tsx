"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Categoria { id: string; nombre: string; }

const UNIDADES = ["unidad", "litro", "kg", "metro", "par", "juego"];

export default function NuevoRepuestoPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    categoria_id: "", codigo: "", nombre: "", descripcion: "",
    marca: "", unidad: "unidad", precio_costo: "", precio_venta: "",
    stock_actual: "0", stock_minimo: "0"
  });

  useEffect(() => {
    fetch("/api/categorias").then(r => r.json()).then(setCategorias);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const res = await fetch("/api/repuestos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Error al guardar"); setGuardando(false); return; }
    router.push("/repuestos");
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400";
  const selectStyle = { color: "#111827" };

  return (
    <div className="space-y-6 max-w-2xl lg:max-w-none">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 transition-colors">
          ← Volver
        </button>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Nuevo Repuesto</h1>
          <p className="text-gray-500 text-sm mt-0.5">Completá los datos del repuesto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Nombre *</label>
            <input required value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className={inputClass} placeholder="Nombre del repuesto" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Código</label>
            <input value={form.codigo}
              onChange={e => setForm({ ...form, codigo: e.target.value })}
              className={inputClass} placeholder="REP-001" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Marca</label>
            <input value={form.marca}
              onChange={e => setForm({ ...form, marca: e.target.value })}
              className={inputClass} placeholder="Marca del repuesto" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Categoría</label>
            <select value={form.categoria_id}
              onChange={e => setForm({ ...form, categoria_id: e.target.value })}
              style={selectStyle} className={`${inputClass} bg-white`}>
              <option value="">Sin categoría</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Unidad</label>
            <select value={form.unidad}
              onChange={e => setForm({ ...form, unidad: e.target.value })}
              style={selectStyle} className={`${inputClass} bg-white`}>
              {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Precio Costo (Gs.)</label>
            <input type="number" value={form.precio_costo}
              onChange={e => setForm({ ...form, precio_costo: e.target.value })}
              className={inputClass} placeholder="0" min="0" step="100" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Precio Venta (Gs.)</label>
            <input type="number" value={form.precio_venta}
              onChange={e => setForm({ ...form, precio_venta: e.target.value })}
              className={inputClass} placeholder="0" min="0" step="100" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Stock Actual</label>
            <input type="number" value={form.stock_actual}
              onChange={e => setForm({ ...form, stock_actual: e.target.value })}
              className={inputClass} placeholder="0" min="0" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Stock Mínimo</label>
            <input type="number" value={form.stock_minimo}
              onChange={e => setForm({ ...form, stock_minimo: e.target.value })}
              className={inputClass} placeholder="0" min="0" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
            <textarea value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              className={inputClass} rows={2} placeholder="Descripción adicional" />
          </div>

        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button type="submit" disabled={guardando}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {guardando ? "Guardando..." : "Guardar Repuesto"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
            Cancelar
          </button>
        </div>
      </form>

    </div>
  );
}