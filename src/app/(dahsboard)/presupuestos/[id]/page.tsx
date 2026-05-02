"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PresupuestoPDF } from "@/components/pdf/PresupuestoPDF";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then(mod => mod.PDFDownloadLink),
  { ssr: false }
);

interface Presupuesto {
  id: string; numero: number; estado: string;
  total: number; subtotal: number; descuento: number;
  validez_dias: number; notas: string | null;
  kilometraje: number | null; creado_en: string;
  fecha_aprobacion: string | null;
  clientes: { id: string; nombre: string; telefono: string | null; email: string | null; ruc_ci?: string | null };
  vehiculos: { id: string; patente: string; marca: string; modelo: string; anio: number | null; color: string | null };
  presupuesto_repuestos: { id: string; descripcion: string; cantidad: number; precio_unitario: number; subtotal: number }[];
  presupuesto_servicios: { id: string; descripcion: string; cantidad: number; precio_unitario: number; subtotal: number }[];
}

const ESTADOS: Record<string, { label: string; color: string }> = {
  borrador:  { label: "Borrador",  color: "bg-gray-100 text-gray-600 border-gray-200" },
  enviado:   { label: "Enviado",   color: "bg-blue-100 text-blue-700 border-blue-200" },
  aprobado:  { label: "Aprobado",  color: "bg-green-100 text-green-700 border-green-200" },
  rechazado: { label: "Rechazado", color: "bg-red-100 text-red-700 border-red-200" },
  vencido:   { label: "Vencido",   color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
};

export default function PresupuestoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [showConvertir, setShowConvertir] = useState(false);
  const [descripcionProblema, setDescripcionProblema] = useState("");

  useEffect(() => { fetchPresupuesto(); }, []);

  async function fetchPresupuesto() {
    setLoading(true);
    const res = await fetch(`/api/presupuestos/${id}`);
    setPresupuesto(await res.json());
    setLoading(false);
  }

  async function cambiarEstado(nuevoEstado: string) {
    setActualizando(true);
    await fetch(`/api/presupuestos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    await fetchPresupuesto();
    setActualizando(false);
  }

  async function convertirAOrden() {
    if (!descripcionProblema.trim()) { alert("Ingresá la descripción del problema"); return; }
    setActualizando(true);
    const res = await fetch(`/api/presupuestos/${id}/convertir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion_problema: descripcionProblema }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error); setActualizando(false); return; }
    router.push(`/ordenes/${data.id}`);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Cargando...</p></div>;
  if (!presupuesto) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Presupuesto no encontrado</p></div>;

  const inputClass = "w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-orange-400";
  const vencimiento = new Date(presupuesto.creado_en);
  vencimiento.setDate(vencimiento.getDate() + presupuesto.validez_dias);

  return (
    <div className="space-y-4 lg:space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted-foreground shrink-0 mt-1">← Volver</Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold">P-{String(presupuesto.numero).padStart(4, "0")}</h1>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${ESTADOS[presupuesto.estado]?.color}`}>
              {ESTADOS[presupuesto.estado]?.label}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            Creado el {new Date(presupuesto.creado_en).toLocaleDateString("es-PY", { day: "2-digit", month: "long", year: "numeric" })}
            {" · "}Válido {presupuesto.validez_dias} días
            {" · "}Vence {vencimiento.toLocaleDateString("es-PY")}
          </p>
          {/* Botón PDF */}
          <div className="mt-2">
            <PDFDownloadLink
              document={<PresupuestoPDF presupuesto={presupuesto} />}
              fileName={`P-${String(presupuesto.numero).padStart(4, "0")}.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <button className="text-xs bg-gray-800 hover:bg-gray-900 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5">
                  {pdfLoading ? "Generando..." : "⬇ Descargar Presupuesto PDF"}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      </div>

      {/* Acciones */}
      {presupuesto.estado !== "rechazado" && presupuesto.estado !== "vencido" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Acciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {presupuesto.estado === "borrador" && (
                <Button onClick={() => cambiarEstado("enviado")} disabled={actualizando}
                  className="bg-blue-500 hover:bg-blue-600 text-white">
                  Marcar como enviado
                </Button>
              )}
              {(presupuesto.estado === "borrador" || presupuesto.estado === "enviado") && (
                <>
                  <Button onClick={() => cambiarEstado("aprobado")} disabled={actualizando}
                    className="bg-green-500 hover:bg-green-600 text-white">
                    ✓ Aprobar
                  </Button>
                  <Button onClick={() => cambiarEstado("rechazado")} disabled={actualizando}
                    variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                    ✕ Rechazar
                  </Button>
                </>
              )}
              {presupuesto.estado === "aprobado" && !showConvertir && (
                <Button onClick={() => setShowConvertir(true)} disabled={actualizando}
                  className="bg-orange-500 hover:bg-orange-600 text-white">
                  🔧 Convertir en Orden
                </Button>
              )}
            </div>

            {showConvertir && (
              <>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <p className="text-sm font-medium">Descripción del problema para la Orden:</p>
                  <textarea value={descripcionProblema} onChange={e => setDescripcionProblema(e.target.value)}
                    className={inputClass} rows={3} placeholder="¿Qué problema reporta el cliente?" />
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={convertirAOrden} disabled={actualizando}
                      className="bg-orange-500 hover:bg-orange-600 text-white">
                      {actualizando ? "Creando orden..." : "Crear Orden de Reparación"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowConvertir(false)}>Cancelar</Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cliente · Vehículo · Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-orange-500 font-bold">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-semibold">{presupuesto.clientes.nombre}</p>
            {presupuesto.clientes.telefono && <p className="text-sm text-muted-foreground">{presupuesto.clientes.telefono}</p>}
            {presupuesto.clientes.email && <p className="text-sm text-muted-foreground break-all">{presupuesto.clientes.email}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-orange-500 font-bold">Vehículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <span className="bg-foreground text-background text-xs font-bold px-2 py-1 rounded">{presupuesto.vehiculos.patente}</span>
            <p className="font-semibold pt-1">{presupuesto.vehiculos.marca} {presupuesto.vehiculos.modelo}</p>
            <p className="text-sm text-muted-foreground">{presupuesto.vehiculos.anio} · {presupuesto.vehiculos.color}</p>
            {presupuesto.kilometraje && <p className="text-sm text-muted-foreground">{presupuesto.kilometraje.toLocaleString()} km</p>}
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-orange-500 font-bold">Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {presupuesto.fecha_aprobacion && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Aprobado:</span>{" "}
                {new Date(presupuesto.fecha_aprobacion).toLocaleDateString("es-PY")}
              </p>
            )}
            {presupuesto.notas && <p className="text-sm text-muted-foreground">{presupuesto.notas}</p>}
            <p className="text-2xl font-bold pt-2">{Number(presupuesto.total).toLocaleString("es-PY")} Gs.</p>
          </CardContent>
        </Card>
      </div>

      {/* Repuestos + Servicios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-orange-500 font-bold">Repuestos</CardTitle>
          </CardHeader>
          <CardContent>
            {presupuesto.presupuesto_repuestos.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Sin repuestos</p>
            ) : (
              <div>
                {presupuesto.presupuesto_repuestos.map((r, i) => (
                  <div key={r.id}>
                    <div className="flex justify-between items-start py-3">
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="text-sm font-medium">{r.descripcion}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.cantidad} × {Number(r.precio_unitario).toLocaleString("es-PY")} Gs.</p>
                      </div>
                      <span className="text-sm font-semibold shrink-0">{Number(r.subtotal).toLocaleString("es-PY")} Gs.</span>
                    </div>
                    {i < presupuesto.presupuesto_repuestos.length - 1 && <Separator />}
                  </div>
                ))}
                <Separator className="mt-1" />
                <div className="flex justify-between pt-3">
                  <span className="text-sm text-muted-foreground">Total repuestos</span>
                  <span className="font-bold">{presupuesto.presupuesto_repuestos.reduce((acc, r) => acc + Number(r.subtotal), 0).toLocaleString("es-PY")} Gs.</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-orange-500 font-bold">Mano de obra</CardTitle>
          </CardHeader>
          <CardContent>
            {presupuesto.presupuesto_servicios.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Sin servicios</p>
            ) : (
              <div>
                {presupuesto.presupuesto_servicios.map((s, i) => (
                  <div key={s.id}>
                    <div className="flex justify-between items-start py-3">
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="text-sm font-medium">{s.descripcion}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.cantidad} × {Number(s.precio_unitario).toLocaleString("es-PY")} Gs.</p>
                      </div>
                      <span className="text-sm font-semibold shrink-0">{Number(s.subtotal).toLocaleString("es-PY")} Gs.</span>
                    </div>
                    {i < presupuesto.presupuesto_servicios.length - 1 && <Separator />}
                  </div>
                ))}
                <Separator className="mt-1" />
                <div className="flex justify-between pt-3">
                  <span className="text-sm text-muted-foreground">Total mano de obra</span>
                  <span className="font-bold">{presupuesto.presupuesto_servicios.reduce((acc, s) => acc + Number(s.subtotal), 0).toLocaleString("es-PY")} Gs.</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Total general */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Repuestos: <span className="font-medium text-foreground">
                {presupuesto.presupuesto_repuestos.reduce((acc, r) => acc + Number(r.subtotal), 0).toLocaleString("es-PY")} Gs.
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Mano de obra: <span className="font-medium text-foreground">
                {presupuesto.presupuesto_servicios.reduce((acc, s) => acc + Number(s.subtotal), 0).toLocaleString("es-PY")} Gs.
              </span>
            </p>
            <Separator className="my-2" />
            <p className="text-2xl font-bold">Total: {Number(presupuesto.total).toLocaleString("es-PY")} Gs.</p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}