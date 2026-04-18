"use client";

import { useEffect, useState } from "react";

interface Categoria { id: string; nombre: string; }
interface Repuesto {
  id: string; codigo: string | null; nombre: string;
  marca: string | null; unidad: string;
  precio_costo: number; precio_venta: number;
  stock_actual: number; stock_minimo: number;
  categorias_repuesto: { id: string; nombre: string } | null;
}

const UNIDADES = ["unidad", "litro", "kg", "metro", "par", "juego"];

export default function RepuestosPage() {
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState<Repuesto | null>(null);

  const formVacio = {
    categoria_id: "", codigo: "", nombre: "", descripcion: "",
    marca: "", unidad: "unidad", precio_costo: "", precio_venta: "",
    stock_actual: "", stock_minimo: ""
  };
  const [form, setForm] = useState(formVacio);

  useEffect(() => {
    fetchRepuestos();
    fetchCategorias();
  }, []);

  async function fetchRepuestos() {
    setLoading(true);
    const res = await fetch("/api/repuestos");
    setRepuestos(await res.json());
    setLoading(false);
  }

  async function fetchCategorias() {
    const res = await fetch("/api/categorias");
    setCategorias(await res.json());
  }

  function handleEditar(r: Repuesto) {
    setEditando(r);
    setForm({
      categoria_id: r.categorias_repuesto?.id || "",
      codigo: r.codigo || "",
      nombre: r.nombre,
      descripcion: "",
      marca: r.marca || "",
      unidad: r.unidad,
      precio_costo: r.precio_costo.toString(),
      precio_venta: r.precio_venta.toString(),
      stock_actual: r.stock_actual.toString(),
      stock_minimo: r.stock_minimo.toString(),
    });
    setShowForm(true);
  }

  function handleNuevo() {
    setEditando(null);
    setForm(formVacio);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);

    const url = editando ? `/api/repuestos/${editando.id}` : "/api/repuestos";
    const method = editando ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) { alert(data.error); setGuardando(false); return; }

    setForm(formVacio);
    setShowForm(false);
    setEditando(null);
    setGuardando(false);
    fetchRepuestos();
  }

  async function handleEliminar(id: string) {
    if (!confirm("¿Eliminár este repuesto?")) return;
    await fetch(`/api/repuestos/${id}`, { method: "DELETE" });
    fetchRepuestos();
  }

  const filtrados = repuestos.filter(r => {
    const matchBusqueda =
      r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.marca?.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = filtroCategoria
      ? r.categorias_repuesto?.id === filtroCategoria
      : true;
    return matchBusqueda && matchCategoria;
  });

  const stockBajo = repuestos.filter(r => r.stock_actual <= r.stock_minimo).length;
  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400";
  const selectStyle = { color: "#111827" };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Repuestos</h1>
          <p className="text-gray-500 text-sm mt-1">
            {repuestos.length} repuestos registrados
            {stockBajo > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                ⚠ {stockBajo} con stock bajo
              </span>
            )}
          </p>
        </div>
        <button onClick={handleNuevo}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Nuevo Repuesto
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {editando ? "Editar Repuesto" : "Nuevo Repuesto"}
          </h2>
          <div className="grid grid-cols-3 gap-4">

            <div className="col-span-2">
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
              <label className="block text-sm font-medium text-gray-600 mb-1">Categoría</label>
              <select value={form.categoria_id}
                onChange={e => setForm({ ...form, categoria_id: e.target.value })}
                style={selectStyle} className={`${inputClass} bg-white`}>
                <option value="">Sin categoría</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Marca</label>
              <input value={form.marca}
                onChange={e => setForm({ ...form, marca: e.target.value })}
                className={inputClass} placeholder="Marca del repuesto" />
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
              <label className="block text-sm font-medium text-gray-600 mb-1">Precio Costo</label>
              <input type="number" value={form.precio_costo}
                onChange={e => setForm({ ...form, precio_costo: e.target.value })}
                className={inputClass} placeholder="0" min="0" step="100" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Precio Venta</label>
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

            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
              <textarea value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                className={inputClass} rows={2} placeholder="Descripción adicional" />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={guardando}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {guardando ? "Guardando..." : editando ? "Actualizar" : "Guardar Repuesto"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditando(null); }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Filtros */}
      <div className="flex gap-3 mb-4">
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
          className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Buscar por nombre, código o marca..." />
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
          style={selectStyle} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {busqueda ? "No se encontraron repuestos" : "No hay repuestos registrados aún"}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Código</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Categoría</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Marca</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">P. Costo</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">P. Venta</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Stock</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.map(r => {
                const stockAlerta = r.stock_actual <= r.stock_minimo;
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{r.codigo || "—"}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{r.nombre}</td>
                    <td className="px-4 py-3 text-gray-500">{r.categorias_repuesto?.nombre || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{r.marca || "—"}</td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {r.precio_costo.toLocaleString("es-PY")} Gs.
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {r.precio_venta.toLocaleString("es-PY")} Gs.
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        stockAlerta
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}>
                        {r.stock_actual} {r.unidad}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3 justify-end">
                        <button onClick={() => handleEditar(r)}
                          className="text-orange-500 hover:text-orange-600 text-xs font-medium">
                          Editar
                        </button>
                        <button onClick={() => handleEliminar(r.id)}
                          className="text-red-400 hover:text-red-500 text-xs font-medium">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}