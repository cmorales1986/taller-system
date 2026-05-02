"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import LoadingCar from "@/components/ui/LoadingCar";

interface VehiculoDetalle {
  id: string; patente: string; marca: string; modelo: string;
  anio: number | null; color: string | null; vin: string | null;
  kilometraje: number | null; notas: string | null; creado_en: string;
  clientes: { id: string; nombre: string; telefono: string | null; email: string | null };
}

interface OrdenResumen {
  id: string; numero: number; estado: string;
  total: number; creado_en: string;
  descripcion_problema: string; diagnostico: string | null;
  trabajo_realizado: string | null; kilometraje: number | null;
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

export default function VehiculoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [vehiculo, setVehiculo] = useState<VehiculoDetalle | null>(null);
  const [ordenes, setOrdenes] = useState<OrdenResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    marca: "", modelo: "", anio: "", color: "",
    vin: "", kilometraje: "", notas: ""
  });

  useEffect(() => { fetchVehiculo(); }, []);

  async function fetchVehiculo() {
    setLoading(true);
    const [vehiculoRes, ordenesRes] = await Promise.all([
      fetch(`/api/vehiculos/${id}`),
      fetch(`/api/ordenes?vehiculo_id=${id}`)
    ]);
    const vehiculoData = await vehiculoRes.json();
    const ordenesData = await ordenesRes.json();
    setVehiculo(vehiculoData);
    setOrdenes(Array.isArray(ordenesData) ? ordenesData : []);
    setForm({
      marca: vehiculoData.marca || "",
      modelo: vehiculoData.modelo || "",
      anio: vehiculoData.anio?.toString() || "",
      color: vehiculoData.color || "",
      vin: vehiculoData.vin || "",
      kilometraje: vehiculoData.kilometraje?.toString() || "",
      notas: vehiculoData.notas || "",
    });
    setLoading(false);
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    await fetch(`/api/vehiculos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditando(false);
    setGuardando(false);
    fetchVehiculo();
  }

  if (loading) return (
    <LoadingCar />
  );

  if (!vehiculo?.patente) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground">Vehículo no encontrado</p>
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
            <div className="flex items-center gap-3 flex-wrap">
              <span className="bg-gray-900 text-white text-base font-bold px-3 py-1.5 rounded-lg shrink-0">
                {vehiculo.patente}
              </span>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold">
                  {vehiculo.marca} {vehiculo.modelo}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {[vehiculo.anio, vehiculo.color, vehiculo.kilometraje ? `${vehiculo.kilometraje.toLocaleString()} km` : null]
                    .filter(Boolean).join(" · ")}
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
            <CardTitle className="text-base">Editar vehículo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGuardar} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Marca</label>
                  <input value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Modelo</label>
                  <input value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Año</label>
                  <input type="number" value={form.anio} onChange={e => setForm({ ...form, anio: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Color</label>
                  <input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Kilometraje</label>
                  <input type="number" value={form.kilometraje} onChange={e => setForm({ ...form, kilometraje: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">VIN / Chasis</label>
                  <input value={form.vin} onChange={e => setForm({ ...form, vin: e.target.value })} className={inputClass} />
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
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Servicios</p>
            <p className="text-3xl font-bold">{ordenes.length}</p>
            <p className="text-xs text-muted-foreground mt-1">total de visitas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Activas</p>
            <p className="text-3xl font-bold text-orange-500">
              {ordenes.filter(o => !["entregado", "cancelado"].includes(o.estado)).length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">en el taller ahora</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Último km</p>
            <p className="text-2xl font-bold">
              {vehiculo.kilometraje ? vehiculo.kilometraje.toLocaleString() : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">registrado</p>
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

      {/* ── FICHA + PROPIETARIO — 1 col mobile, 2 desktop ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">

        {/* Ficha técnica */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-orange-500 font-bold">Ficha técnica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Marca</p>
                <p className="text-sm font-medium">{vehiculo.marca}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Modelo</p>
                <p className="text-sm font-medium">{vehiculo.modelo}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Año</p>
                <p className="text-sm font-medium">{vehiculo.anio || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Color</p>
                <p className="text-sm font-medium">{vehiculo.color || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Kilometraje</p>
                <p className="text-sm font-medium">
                  {vehiculo.kilometraje ? `${vehiculo.kilometraje.toLocaleString()} km` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">VIN / Chasis</p>
                <p className="text-sm font-medium font-mono break-all">{vehiculo.vin || "—"}</p>
              </div>
            </div>
            {vehiculo.notas && (
              <>
                <Separator className="my-3" />
                <div>
                  <p className="text-xs text-muted-foreground">Notas</p>
                  <p className="text-sm text-muted-foreground italic mt-0.5">{vehiculo.notas}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Propietario */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-orange-500 font-bold">Propietario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold shrink-0">
                {vehiculo.clientes.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{vehiculo.clientes.nombre}</p>
                {vehiculo.clientes.telefono && (
                  <p className="text-sm text-muted-foreground">{vehiculo.clientes.telefono}</p>
                )}
                {vehiculo.clientes.email && (
                  <p className="text-sm text-muted-foreground break-all">{vehiculo.clientes.email}</p>
                )}
              </div>
            </div>
            <Separator />
            <Link href={`/clientes/${vehiculo.clientes.id}`}
              className="text-xs text-orange-500 hover:text-orange-600 font-medium">
              Ver perfil del cliente →
            </Link>
          </CardContent>
        </Card>

      </div>

      {/* ── HISTORIAL DE REPARACIONES ── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Historial de reparaciones</CardTitle>
            <Link href={`/ordenes/nueva?vehiculo_id=${vehiculo.id}`}
              className="text-xs text-orange-500 hover:text-orange-600 font-medium">
              + Nueva orden →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {ordenes.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Sin reparaciones registradas</p>
          ) : (
            <div>
              {ordenes.map((o, i) => (
                <div key={o.id}>
                  <div className="py-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    {/* Info principal */}
                    <div className="flex gap-3">
                      <span className="font-mono text-xs font-bold text-muted-foreground shrink-0 mt-0.5">
                        OR-{String(o.numero).padStart(4, "0")}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{o.descripcion_problema}</p>
                        {o.trabajo_realizado && (
                          <p className="text-xs text-muted-foreground mt-0.5">✓ {o.trabajo_realizado}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <p className="text-xs text-muted-foreground">
                            {new Date(o.creado_en).toLocaleDateString("es-PY")}
                          </p>
                          {o.kilometraje && (
                            <p className="text-xs text-muted-foreground">{o.kilometraje.toLocaleString()} km</p>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Estado + monto + ver */}
                    <div className="flex items-center gap-3 ml-9 sm:ml-0 flex-wrap shrink-0">
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