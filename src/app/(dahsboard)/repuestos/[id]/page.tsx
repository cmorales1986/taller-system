"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Repuesto {
  id: string; codigo: string | null; nombre: string;
  descripcion: string | null; marca: string | null; unidad: string;
  precio_costo: number; precio_venta: number;
  stock_actual: number; stock_minimo: number;
  categorias_repuesto: { id: string; nombre: string } | null;
}

interface Categoria { id: string; nombre: string; }
const UNIDADES = ["unidad", "litro", "kg", "metro", "par", "juego"];

export default function RepuestoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [repuesto, setRepuesto] = useState<Repuesto | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    categoria_id: "", codigo: "", nombre: "", descripcion: "",
    marca: "", unidad: "unidad", precio_costo: "", precio_venta: "",
    stock_actual: "", stock_minimo: ""
  });

  useEffect(() => {
    fetchRepuesto();
    fetch("/api/categorias").then(r => r.json()).then(setCategorias);
  }, []);

  async function fetchRepuesto() {
    setLoading(true);
    const res = await fetch(`/api/repuestos/${id}`);
    const data = await res.json();
    setRepuesto(data);
    setForm({
      categoria_id: data.categorias_repuesto?.id || "",
      codigo: data.codigo || "",
      nombre: data.nombre || "",
      descripcion: data.descripcion || "",
      marca: data.marca || "",
      unidad: data.unidad || "unidad",
      precio_costo: data.precio_costo?.toString() || "",
      precio_venta: data.precio_venta?.toString() || "",
      stock_actual: data.stock_actual?.toString() || "",
      stock_minimo: data.stock_minimo?.toString() || "",
    });
    setLoading(false);
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    await fetch(`/api/repuestos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditando(false);
    setGuardando(false);
    fetchRepuesto();
  }

  async function handleEliminar() {
    if (!confirm("¿Eliminar este repuesto?")) return;
    await fetch(`/api/repuestos/${id}`, { method: "DELETE" });
    router.push("/repuestos");
  }

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Cargando...</p></div>;
  if (!repuesto) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Repuesto no encontrado</p></div>;

  const stockAlerta = repuesto.stock_actual <= repuesto.stock_minimo;
  const margen = repuesto.precio_costo > 0
    ? (((repuesto.precio_venta - repuesto.precio_costo) / repuesto.precio_costo) * 100).toFixed(1)
    : null;

  const inputClass = "w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-orange-400";
  const selectStyle = { color: "#111827" };

  return (
    <div className="space-y-4 lg:space-y-6 pb-10 max-w-2xl">

      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted-foreground shrink-0 mt-1">
          ← Volver
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl lg:text-2xl font-bold">{repuesto.nombre}</h1>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stockAlerta ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                  {stockAlerta ? "⚠ Stock bajo" : "✓ Stock OK"}
                </span>
              </div>
              {repuesto.codigo && <p className="text-muted-foreground text-sm font-mono mt-0.5">{repuesto.codigo}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditando(!editando)} className="shrink-0">
                {editando ? "Cancelar" : "Editar"}
              </Button>
              <Button variant="outline" onClick={handleEliminar}
                className="text-red-500 border-red-200 hover:bg-red-50 shrink-0">
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario edición */}
      {editando && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Editar repuesto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGuardar} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Nombre *</label>
                  <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Código</label>
                  <input value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Marca</label>
                  <input value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Categoría</label>
                  <select value={form.categoria_id} onChange={e => setForm({ ...form, categoria_id: e.target.value })} style={selectStyle} className={`${inputClass} bg-background`}>
                    <option value="">Sin categoría</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Unidad</label>
                  <select value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })} style={selectStyle} className={`${inputClass} bg-background`}>
                    {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Precio Costo</label>
                  <input type="number" value={form.precio_costo} onChange={e => setForm({ ...form, precio_costo: e.target.value })} className={inputClass} min="0" step="100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Precio Venta</label>
                  <input type="number" value={form.precio_venta} onChange={e => setForm({ ...form, precio_venta: e.target.value })} className={inputClass} min="0" step="100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Stock Actual</label>
                  <input type="number" value={form.stock_actual} onChange={e => setForm({ ...form, stock_actual: e.target.value })} className={inputClass} min="0" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Stock Mínimo</label>
                  <input type="number" value={form.stock_minimo} onChange={e => setForm({ ...form, stock_minimo: e.target.value })} className={inputClass} min="0" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Descripción</label>
                  <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className={inputClass} rows={2} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={guardando} className="bg-orange-500 hover:bg-orange-600 text-white">
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditando(false)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats — 2 cols mobile, 4 desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Stock actual</p>
            <p className={`text-3xl font-bold ${stockAlerta ? "text-red-500" : "text-foreground"}`}>{repuesto.stock_actual}</p>
            <p className="text-xs text-muted-foreground mt-1">{repuesto.unidad}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Stock mínimo</p>
            <p className="text-3xl font-bold">{repuesto.stock_minimo}</p>
            <p className="text-xs text-muted-foreground mt-1">{repuesto.unidad}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Precio venta</p>
            <p className="text-xl font-bold">{repuesto.precio_venta.toLocaleString("es-PY")}</p>
            <p className="text-xs text-muted-foreground mt-1">Guaraníes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Margen</p>
            <p className="text-2xl font-bold text-green-600">{margen ? `${margen}%` : "—"}</p>
            <p className="text-xs text-muted-foreground mt-1">sobre costo</p>
          </CardContent>
        </Card>
      </div>

      {/* Ficha */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-widest text-orange-500 font-bold">Ficha del repuesto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="text-sm font-medium">{repuesto.nombre}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Código</p>
              <p className="text-sm font-medium font-mono">{repuesto.codigo || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Marca</p>
              <p className="text-sm font-medium">{repuesto.marca || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Categoría</p>
              <p className="text-sm font-medium">{repuesto.categorias_repuesto?.nombre || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unidad</p>
              <p className="text-sm font-medium capitalize">{repuesto.unidad}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Precio costo</p>
              <p className="text-sm font-medium">{repuesto.precio_costo.toLocaleString("es-PY")} Gs.</p>
            </div>
          </div>
          {repuesto.descripcion && (
            <>
              <Separator className="my-3" />
              <div>
                <p className="text-xs text-muted-foreground">Descripción</p>
                <p className="text-sm text-muted-foreground italic mt-0.5">{repuesto.descripcion}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

    </div>
  );
}