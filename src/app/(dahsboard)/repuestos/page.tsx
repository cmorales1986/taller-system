"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Categoria { id: string; nombre: string; }
interface Repuesto {
  id: string; codigo: string | null; nombre: string;
  marca: string | null; unidad: string;
  precio_costo: number; precio_venta: number;
  stock_actual: number; stock_minimo: number;
  categorias_repuesto: { id: string; nombre: string } | null;
}

export default function RepuestosPage() {
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  useEffect(() => {
    fetchRepuestos();
    fetch("/api/categorias").then(r => r.json()).then(setCategorias);
  }, []);

  async function fetchRepuestos() {
    setLoading(true);
    const res = await fetch("/api/repuestos");
    setRepuestos(await res.json());
    setLoading(false);
  }

  const filtrados = repuestos.filter(r => {
    const matchBusqueda =
      r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.marca?.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = filtroCategoria ? r.categorias_repuesto?.id === filtroCategoria : true;
    return matchBusqueda && matchCategoria;
  });

  const stockBajo = repuestos.filter(r => r.stock_actual <= r.stock_minimo).length;
  const selectStyle = { color: "#111827" };

  return (
    <div className="space-y-4 lg:space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Repuestos</h1>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-2 flex-wrap">
            {repuestos.length} repuestos registrados
            {stockBajo > 0 && (
              <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                ⚠ {stockBajo} con stock bajo
              </span>
            )}
          </p>
        </div>
        <Link href="/repuestos/nuevo"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
          + Nuevo Repuesto
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
          className="w-full sm:max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Buscar por nombre, código o marca..." />
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
          style={selectStyle}
          className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400">
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      {/* Tabla desktop / Cards mobile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {busqueda ? "No se encontraron repuestos" : "No hay repuestos registrados aún"}
          </div>
        ) : (
          <>
            {/* Tabla — desktop */}
            <table className="w-full text-sm hidden lg:table">
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
                      <td className="px-4 py-3 text-right text-gray-500">{r.precio_costo.toLocaleString("es-PY")} Gs.</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800">{r.precio_venta.toLocaleString("es-PY")} Gs.</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${stockAlerta ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                          {r.stock_actual} {r.unidad}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/repuestos/${r.id}`} className="text-orange-500 hover:text-orange-600 text-xs font-medium">
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Cards — mobile */}
            <div className="lg:hidden divide-y divide-gray-100">
              {filtrados.map(r => {
                const stockAlerta = r.stock_actual <= r.stock_minimo;
                return (
                  <div key={r.id} className="p-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {r.codigo && <span className="text-xs font-mono text-gray-400">{r.codigo}</span>}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stockAlerta ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                          {r.stock_actual} {r.unidad}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{r.nombre}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {[r.categorias_repuesto?.nombre, r.marca].filter(Boolean).join(" · ")}
                      </p>
                      <p className="text-sm font-bold text-gray-800 mt-1">
                        {r.precio_venta.toLocaleString("es-PY")} Gs.
                        <span className="text-xs text-gray-400 font-normal ml-1">venta</span>
                      </p>
                    </div>
                    <Link href={`/repuestos/${r.id}`} className="text-orange-500 text-xs font-medium shrink-0">
                      Ver →
                    </Link>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}