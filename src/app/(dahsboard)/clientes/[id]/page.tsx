/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import LoadingCar from "@/components/ui/LoadingCar";

interface ClienteDetalle {
  id: string;
  nombre: string;
  ruc_ci: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  notas: string | null;
  creado_en: string;
  vehiculos: {
    id: string;
    patente: string;
    marca: string;
    modelo: string;
    anio: number | null;
    color: string | null;
    kilometraje: number | null;
    activo: boolean;
  }[];
}

interface OrdenResumen {
  id: string;
  numero: number;
  estado: string;
  total: number;
  creado_en: string;
  descripcion_problema: string;
  vehiculos: { patente: string; marca: string; modelo: string };
}

const ESTADOS: Record<string, { label: string; color: string }> = {
  recibido:            { label: "Recibido",            color: "bg-blue-100 text-blue-700 border-blue-200" },
  en_diagnostico:      { label: "En diagnóstico",      color: "bg-purple-100 text-purple-700 border-purple-200" },
  esperando_repuestos: { label: "Esperando repuestos", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  en_reparacion:       { label: "En reparación",       color: "bg-orange-100 text-orange-700 border-orange-200" },
  listo:               { label: "Listo",               color: "bg-green-100 text-green-700 border-green-200" },
  entregado:           { label: "Entregado",           color: "bg-gray-100 text-gray-600 border-gray-200" },
  cancelado:           { label: "Cancelado",           color: "bg-red-100 text-red-700 border-red-200" },
};

export default function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [cliente, setCliente] = useState<ClienteDetalle | null>(null);
  const [ordenes, setOrdenes] = useState<OrdenResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    nombre: "", ruc_ci: "", telefono: "", email: "", direccion: "", notas: "",
  });

  useEffect(() => { fetchCliente(); }, []);

  async function fetchCliente() {
    setLoading(true);
    const [clienteRes, ordenesRes] = await Promise.all([
      fetch(`/api/clientes/${id}`),
      fetch(`/api/ordenes?cliente_id=${id}`),
    ]);
    const clienteData = await clienteRes.json();
    const ordenesData = await ordenesRes.json();
    setCliente(clienteData);
    setOrdenes(Array.isArray(ordenesData) ? ordenesData : []);
    setForm({
      nombre: clienteData.nombre || "",
      ruc_ci: clienteData.ruc_ci || "",
      telefono: clienteData.telefono || "",
      email: clienteData.email || "",
      direccion: clienteData.direccion || "",
      notas: clienteData.notas || "",
    });
    setLoading(false);
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    await fetch(`/api/clientes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditando(false);
    setGuardando(false);
    fetchCliente();
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><LoadingCar /></div>
  );

  if (!cliente?.nombre) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground">Cliente no encontrado</p>
    </div>
  );

  const totalFacturado = ordenes
    .filter(o => o.estado === "entregado")
    .reduce((acc, o) => acc + Number(o.total), 0);

  const inputClass = "w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-orange-400";

  return (
    <div className="space-y-4 lg:space-y-6 pb-10">

      {/* ── HEADER ── */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}
          className="text-muted-foreground shrink-0 mt-1">
          ← Volver
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold shrink-0">
                {cliente.nombre?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold">{cliente.nombre}</h1>
                <p className="text-muted-foreground text-sm">
                  Cliente desde {new Date(cliente.creado_en).toLocaleDateString("es-PY", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setEditando(!editando)} className="shrink-0">
              {editando ? "Cancelar" : "Editar datos"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── FORMULARIO EDICIÓN ── */}
      {editando && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Editar cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGuardar} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Nombre *</label>
                  <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">RUC / CI</label>
                  <input value={form.ruc_ci} onChange={e => setForm({ ...form, ruc_ci: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Teléfono</label>
                  <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Dirección</label>
                  <input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Notas</label>
                  <textarea value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} className={inputClass} rows={2} />
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

      {/* ── STATS — 2 cols mobile, 4 desktop ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Vehículos</p>
            <p className="text-3xl font-bold">{cliente.vehiculos?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Órdenes</p>
            <p className="text-3xl font-bold">{ordenes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Activas</p>
            <p className="text-3xl font-bold text-orange-500">
              {ordenes.filter(o => !["entregado", "cancelado"].includes(o.estado)).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Facturado</p>
            <p className="text-lg font-bold text-green-600">
              {totalFacturado.toLocaleString("es-PY")} Gs.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── INFO + VEHÍCULOS — 1 col mobile, 2 desktop ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">

        {/* Info personal */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-orange-500 font-bold">Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cliente.ruc_ci && (
              <div>
                <p className="text-xs text-muted-foreground">RUC / CI</p>
                <p className="text-sm font-medium">{cliente.ruc_ci}</p>
              </div>
            )}
            {cliente.telefono && (
              <div>
                <p className="text-xs text-muted-foreground">Teléfono</p>
                <p className="text-sm font-medium">{cliente.telefono}</p>
              </div>
            )}
            {cliente.email && (
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium break-all">{cliente.email}</p>
              </div>
            )}
            {cliente.direccion && (
              <div>
                <p className="text-xs text-muted-foreground">Dirección</p>
                <p className="text-sm font-medium">{cliente.direccion}</p>
              </div>
            )}
            {cliente.notas && (
              <div>
                <p className="text-xs text-muted-foreground">Notas</p>
                <p className="text-sm text-muted-foreground italic">{cliente.notas}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehículos */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-widest text-orange-500 font-bold">Vehículos</CardTitle>
              <Link href={`/vehiculos?cliente_id=${cliente.id}`}
                className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                + Agregar vehículo
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {cliente.vehiculos?.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Sin vehículos registrados</p>
            ) : (
              <div>
                {cliente.vehiculos.map((v, i) => (
                  <div key={v.id}>
                    <div className="flex items-center justify-between py-3 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="bg-foreground text-background text-xs font-bold px-2 py-1 rounded shrink-0">
                          {v.patente}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{v.marca} {v.modelo}</p>
                          <p className="text-xs text-muted-foreground">
                            {v.anio} · {v.color}
                            {v.kilometraje && ` · ${v.kilometraje.toLocaleString()} km`}
                          </p>
                        </div>
                      </div>
                      <Link href={`/vehiculos/${v.id}`}
                        className="text-xs text-orange-500 hover:text-orange-600 font-medium shrink-0">
                        Ver →
                      </Link>
                    </div>
                    {i < cliente.vehiculos.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── HISTORIAL DE ÓRDENES ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Historial de órdenes</CardTitle>
        </CardHeader>
        <CardContent>
          {ordenes.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Sin órdenes registradas</p>
          ) : (
            <div>
              {ordenes.map((o, i) => (
                <div key={o.id}>
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    {/* Info principal */}
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs font-bold text-muted-foreground shrink-0 mt-0.5">
                        OR-{String(o.numero).padStart(4, "0")}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{o.descripcion_problema}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="bg-foreground text-background text-xs font-bold px-1.5 py-0.5 rounded">
                            {o.vehiculos.patente}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {o.vehiculos.marca} {o.vehiculos.modelo}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(o.creado_en).toLocaleDateString("es-PY")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Estado + monto + ver */}
                    <div className="flex items-center gap-3 ml-9 sm:ml-0 flex-wrap">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ESTADOS[o.estado]?.color}`}>
                        {ESTADOS[o.estado]?.label}
                      </span>
                      <span className="text-sm font-bold">
                        {Number(o.total).toLocaleString("es-PY")} Gs.
                      </span>
                      <Link href={`/ordenes/${o.id}`}
                        className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                        Ver →
                      </Link>
                    </div>
                  </div>
                  {i < ordenes.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}