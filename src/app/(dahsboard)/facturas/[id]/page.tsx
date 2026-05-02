/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import LoadingCar from "@/components/ui/LoadingCar";

interface Factura {
  id: string; numero: number; estado: string;
  total: number; subtotal: number; iva_monto: number;
  iva_porcentaje: number; descuento: number;
  metodo_pago: string | null; notas: string | null;
  creado_en: string; fecha_pago: string | null;
  clientes: { nombre: string; telefono: string | null; email: string | null; ruc_ci: string | null };
  ordenes_reparacion: {
    id: string; numero: number;
    vehiculos: { patente: string; marca: string; modelo: string; anio: number | null };
    or_repuestos: { id: string; descripcion: string; cantidad: number; precio_unitario: number; subtotal: number }[];
    or_servicios: { id: string; descripcion: string; cantidad: number; precio_unitario: number; subtotal: number }[];
  } | null;
}

const ESTADOS: Record<string, { label: string; color: string }> = {
  emitida: { label: "Emitida", color: "bg-blue-100 text-blue-700 border-blue-200" },
  pagada:  { label: "Pagada",  color: "bg-green-100 text-green-700 border-green-200" },
  anulada: { label: "Anulada", color: "bg-red-100 text-red-700 border-red-200" },
};

const METODOS = [
  { value: "efectivo",      label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "tarjeta",       label: "Tarjeta" },
  { value: "cheque",        label: "Cheque" },
  { value: "credito",       label: "Crédito" },
];

export default function FacturaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [factura, setFactura] = useState<Factura | null>(null);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [metodoPago, setMetodoPago] = useState("");

  useEffect(() => { fetchFactura(); }, []);

  async function fetchFactura() {
    setLoading(true);
    const res = await fetch(`/api/facturas/${id}`);
    const data = await res.json();
    setFactura(data);
    setMetodoPago(data.metodo_pago || "");
    setLoading(false);
  }

  async function marcarPagada() {
    if (!metodoPago) { alert("Seleccioná el método de pago"); return; }
    setActualizando(true);
    await fetch(`/api/facturas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "pagada", metodo_pago: metodoPago }),
    });
    await fetchFactura();
    setActualizando(false);
  }

  async function anularFactura() {
    if (!confirm("¿Estás seguro que querés anular esta factura?")) return;
    setActualizando(true);
    await fetch(`/api/facturas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "anulada" }),
    });
    await fetchFactura();
    setActualizando(false);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingCar /></div>;
  if (!factura) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Factura no encontrada</p></div>;

  const selectStyle = { color: "#111827" };
  const inputClass = "w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-orange-400";

  return (
    <div className="space-y-4 lg:space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted-foreground shrink-0 mt-1">
          ← Volver
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold">F-{String(factura.numero).padStart(4, "0")}</h1>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${ESTADOS[factura.estado]?.color}`}>
              {ESTADOS[factura.estado]?.label}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            Emitida el {new Date(factura.creado_en).toLocaleDateString("es-PY", { day: "2-digit", month: "long", year: "numeric" })}
            {factura.fecha_pago && ` · Pagada el ${new Date(factura.fecha_pago).toLocaleDateString("es-PY")}`}
          </p>
        </div>
      </div>

      {/* Acciones */}
      {factura.estado === "emitida" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Registrar pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="w-full sm:w-56">
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                  Método de pago *
                </label>
                <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)}
                  style={selectStyle} className={`${inputClass} bg-white`}>
                  <option value="">Seleccionar...</option>
                  {METODOS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={marcarPagada} disabled={actualizando}
                  className="bg-green-500 hover:bg-green-600 text-white">
                  ✓ Marcar como pagada
                </Button>
                <Button variant="outline" onClick={anularFactura} disabled={actualizando}
                  className="text-red-500 border-red-200 hover:bg-red-50">
                  Anular
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cliente · Vehículo · Pago — 1 col mobile, 3 desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-orange-500 font-bold">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-semibold">{factura.clientes.nombre}</p>
            {factura.clientes.ruc_ci && <p className="text-sm text-muted-foreground">RUC/CI: {factura.clientes.ruc_ci}</p>}
            {factura.clientes.telefono && <p className="text-sm text-muted-foreground">{factura.clientes.telefono}</p>}
            {factura.clientes.email && <p className="text-sm text-muted-foreground break-all">{factura.clientes.email}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-orange-500 font-bold">Vehículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {factura.ordenes_reparacion ? (
              <>
                <span className="bg-foreground text-background text-xs font-bold px-2 py-1 rounded">
                  {factura.ordenes_reparacion.vehiculos.patente}
                </span>
                <p className="font-semibold pt-1">
                  {factura.ordenes_reparacion.vehiculos.marca} {factura.ordenes_reparacion.vehiculos.modelo}
                </p>
                <p className="text-sm text-muted-foreground">{factura.ordenes_reparacion.vehiculos.anio}</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  OR-{String(factura.ordenes_reparacion.numero).padStart(4, "0")}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Sin orden asociada</p>
            )}
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-orange-500 font-bold">Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {factura.metodo_pago && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Método:</span>{" "}
                {METODOS.find(m => m.value === factura.metodo_pago)?.label || factura.metodo_pago}
              </p>
            )}
            {factura.fecha_pago && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Fecha pago:</span>{" "}
                {new Date(factura.fecha_pago).toLocaleDateString("es-PY")}
              </p>
            )}
            <p className="text-2xl font-bold pt-2">{Number(factura.total).toLocaleString("es-PY")} Gs.</p>
          </CardContent>
        </Card>
      </div>

      {/* Repuestos + Servicios — 1 col mobile, 2 desktop */}
      {factura.ordenes_reparacion && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-orange-500 font-bold">Repuestos</CardTitle>
            </CardHeader>
            <CardContent>
              {factura.ordenes_reparacion.or_repuestos.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Sin repuestos</p>
              ) : (
                <div>
                  {factura.ordenes_reparacion.or_repuestos.map((r, i) => (
                    <div key={r.id}>
                      <div className="flex justify-between items-start py-3">
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="text-sm font-medium">{r.descripcion}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {r.cantidad} × {Number(r.precio_unitario).toLocaleString("es-PY")} Gs.
                          </p>
                        </div>
                        <span className="text-sm font-semibold shrink-0">{Number(r.subtotal).toLocaleString("es-PY")} Gs.</span>
                      </div>
                      {i < factura.ordenes_reparacion!.or_repuestos.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widests text-orange-500 font-bold">Mano de obra</CardTitle>
            </CardHeader>
            <CardContent>
              {factura.ordenes_reparacion.or_servicios.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Sin servicios</p>
              ) : (
                <div>
                  {factura.ordenes_reparacion.or_servicios.map((s, i) => (
                    <div key={s.id}>
                      <div className="flex justify-between items-start py-3">
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="text-sm font-medium">{s.descripcion}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {s.cantidad} × {Number(s.precio_unitario).toLocaleString("es-PY")} Gs.
                          </p>
                        </div>
                        <span className="text-sm font-semibold shrink-0">{Number(s.subtotal).toLocaleString("es-PY")} Gs.</span>
                      </div>
                      {i < factura.ordenes_reparacion!.or_servicios.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resumen financiero */}
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-sm ml-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{Number(factura.subtotal).toLocaleString("es-PY")} Gs.</span>
            </div>
            {Number(factura.descuento) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Descuento</span>
                <span className="text-red-500">- {Number(factura.descuento).toLocaleString("es-PY")} Gs.</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IVA ({factura.iva_porcentaje}%)</span>
              <span>{Number(factura.iva_monto).toLocaleString("es-PY")} Gs.</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-xl">{Number(factura.total).toLocaleString("es-PY")} Gs.</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {factura.notas && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{factura.notas}</p>
          </CardContent>
        </Card>
      )}

    </div>
  );
}