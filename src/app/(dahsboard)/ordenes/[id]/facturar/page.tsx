/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Orden {
  id: string; numero: number; total: number;
  clientes: { nombre: string };
  vehiculos: { patente: string; marca: string; modelo: string };
  or_repuestos: { id: string; descripcion: string; cantidad: number; precio_unitario: number; subtotal: number }[];
  or_servicios: { id: string; descripcion: string; cantidad: number; precio_unitario: number; subtotal: number }[];
}

const METODOS = [
  { value: "efectivo",      label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "tarjeta",       label: "Tarjeta" },
  { value: "cheque",        label: "Cheque" },
  { value: "credito",       label: "Crédito" },
];

export default function FacturarOrdenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [orden, setOrden] = useState<Orden | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    metodo_pago: "", descuento: "0", notas: ""
  });

  useEffect(() => {
    fetch(`/api/ordenes/${id}`)
      .then(r => r.json())
      .then(data => { setOrden(data); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground">Cargando...</p>
    </div>
  );

  if (!orden) return null;

  const subtotal = Number(orden.total);
  const descuento = parseFloat(form.descuento) || 0;
  const ivaBase = subtotal - descuento;
  const ivaMonto = ivaBase * 0.10;
  const total = ivaBase + ivaMonto;

  const inputClass = "w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring";
  const selectStyle = { color: "#111827" };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    const res = await fetch(`/api/ordenes/${id}/facturar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.factura_id) {
        router.push(`/facturas/${data.factura_id}`);
      } else {
        alert(data.error);
        setGuardando(false);
      }
      return;
    }
    router.push(`/facturas/${data.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}
          className="text-muted-foreground">← Volver</Button>
        <div>
          <h1 className="text-2xl font-bold">Emitir Factura</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            OR-{String(orden.numero).padStart(4, "0")} · {orden.clientes.nombre} · {orden.vehiculos.patente}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Resumen OR */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resumen de la orden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {orden.or_repuestos.map((r, i) => (
                <div key={r.id}>
                  <div className="flex justify-between py-2.5 text-sm">
                    <span className="text-muted-foreground">{r.descripcion} × {r.cantidad}</span>
                    <span className="font-medium">{Number(r.subtotal).toLocaleString("es-PY")} Gs.</span>
                  </div>
                  {i < orden.or_repuestos.length - 1 && <Separator />}
                </div>
              ))}
              {orden.or_repuestos.length > 0 && orden.or_servicios.length > 0 && <Separator />}
              {orden.or_servicios.map((s, i) => (
                <div key={s.id}>
                  <div className="flex justify-between py-2.5 text-sm">
                    <span className="text-muted-foreground">{s.descripcion} × {s.cantidad}</span>
                    <span className="font-medium">{Number(s.subtotal).toLocaleString("es-PY")} Gs.</span>
                  </div>
                  {i < orden.or_servicios.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Datos de facturación */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Datos de facturación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                Método de pago
              </label>
              <select value={form.metodo_pago}
                onChange={e => setForm({ ...form, metodo_pago: e.target.value })}
                style={selectStyle} className={`${inputClass} bg-white`}>
                <option value="">Seleccionar...</option>
                {METODOS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                Descuento (Gs.)
              </label>
              <input type="number" value={form.descuento} min="0"
                onChange={e => setForm({ ...form, descuento: e.target.value })}
                className={inputClass} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                Notas
              </label>
              <textarea value={form.notas}
                onChange={e => setForm({ ...form, notas: e.target.value })}
                className={inputClass} rows={2} placeholder="Observaciones de la factura..." />
            </div>
          </CardContent>
        </Card>

        {/* Resumen financiero */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{subtotal.toLocaleString("es-PY")} Gs.</span>
              </div>
              {descuento > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descuento</span>
                  <span className="text-red-500">- {descuento.toLocaleString("es-PY")} Gs.</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (10%)</span>
                <span>{ivaMonto.toLocaleString("es-PY")} Gs.</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl">{total.toLocaleString("es-PY")} Gs.</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}
                className="bg-orange-500 hover:bg-orange-600 text-white flex-1">
                {guardando ? "Emitiendo..." : "Emitir Factura"}
              </Button>
            </div>
          </CardContent>
        </Card>

      </form>
    </div>
  );
}