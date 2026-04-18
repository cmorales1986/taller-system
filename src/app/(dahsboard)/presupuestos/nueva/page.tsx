"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Cliente { id: string; nombre: string; }
interface Vehiculo { id: string; patente: string; marca: string; modelo: string; cliente_id: string; }
interface Repuesto { id: string; nombre: string; precio_venta: number; unidad: string; }
interface Servicio { id: string; nombre: string; precio: number; }
interface ItemOR { ref_id: string; descripcion: string; cantidad: string; precio_unitario: string; }

export default function NuevoPresupuestoPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    cliente_id: "", vehiculo_id: "",
    kilometraje: "", validez_dias: "15", notas: ""
  });

  const [itemsRepuesto, setItemsRepuesto] = useState<ItemOR[]>([]);
  const [itemsServicio, setItemsServicio] = useState<ItemOR[]>([]);

  const vehiculosFiltrados = vehiculos.filter(v => v.cliente_id === form.cliente_id);

  useEffect(() => {
    fetch("/api/clientes").then(r => r.json()).then(setClientes);
    fetch("/api/vehiculos").then(r => r.json()).then(setVehiculos);
    fetch("/api/repuestos").then(r => r.json()).then(setRepuestos);
    fetch("/api/servicios").then(r => r.json()).then(setServicios);
  }, []);

  function agregarRepuesto() {
    setItemsRepuesto([...itemsRepuesto, { ref_id: "", descripcion: "", cantidad: "1", precio_unitario: "0" }]);
  }

  function agregarServicio() {
    setItemsServicio([...itemsServicio, { ref_id: "", descripcion: "", cantidad: "1", precio_unitario: "0" }]);
  }

  function handleRepuestoSelect(index: number, id: string) {
    const rep = repuestos.find(r => r.id === id);
    const nuevos = [...itemsRepuesto];
    nuevos[index] = { ref_id: id, descripcion: rep?.nombre || "", cantidad: "1", precio_unitario: rep?.precio_venta.toString() || "0" };
    setItemsRepuesto(nuevos);
  }

  function handleServicioSelect(index: number, id: string) {
    const srv = servicios.find(s => s.id === id);
    const nuevos = [...itemsServicio];
    nuevos[index] = { ref_id: id, descripcion: srv?.nombre || "", cantidad: "1", precio_unitario: srv?.precio.toString() || "0" };
    setItemsServicio(nuevos);
  }

  const totalRepuestos = itemsRepuesto.reduce((acc, r) =>
    acc + (parseFloat(r.cantidad) || 0) * (parseFloat(r.precio_unitario) || 0), 0);
  const totalServicios = itemsServicio.reduce((acc, s) =>
    acc + (parseFloat(s.cantidad) || 0) * (parseFloat(s.precio_unitario) || 0), 0);
  const totalGeneral = totalRepuestos + totalServicios;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    const res = await fetch("/api/presupuestos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        repuestos: itemsRepuesto.map(r => ({
          repuesto_id: r.ref_id, descripcion: r.descripcion,
          cantidad: r.cantidad, precio_unitario: r.precio_unitario
        })),
        servicios: itemsServicio.map(s => ({
          servicio_id: s.ref_id, descripcion: s.descripcion,
          cantidad: s.cantidad, precio_unitario: s.precio_unitario
        })),
      }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error); setGuardando(false); return; }
    router.push("/presupuestos");
  }

  const inputClass = "w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring";
  const selectStyle = { color: "#111827" };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}
          className="text-muted-foreground">← Volver</Button>
        <div>
          <h1 className="text-2xl font-bold">Nuevo Presupuesto</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Completá los datos para generar el presupuesto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Sección 1: Vehículo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
              Datos del vehículo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Cliente *</label>
                <select required value={form.cliente_id}
                  onChange={e => setForm({ ...form, cliente_id: e.target.value, vehiculo_id: "" })}
                  style={selectStyle} className={`${inputClass} bg-white`}>
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Vehículo *</label>
                <select required value={form.vehiculo_id}
                  onChange={e => setForm({ ...form, vehiculo_id: e.target.value })}
                  style={selectStyle} className={`${inputClass} bg-white`}
                  disabled={!form.cliente_id}>
                  <option value="">{form.cliente_id ? "Seleccionar vehículo..." : "Primero seleccioná un cliente"}</option>
                  {vehiculosFiltrados.map(v => (
                    <option key={v.id} value={v.id}>{v.patente} — {v.marca} {v.modelo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Kilometraje</label>
                <input type="number" value={form.kilometraje}
                  onChange={e => setForm({ ...form, kilometraje: e.target.value })}
                  className={inputClass} placeholder="125000" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Validez (días)</label>
                <input type="number" value={form.validez_dias}
                  onChange={e => setForm({ ...form, validez_dias: e.target.value })}
                  className={inputClass} placeholder="15" min="1" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Notas</label>
                <textarea value={form.notas}
                  onChange={e => setForm({ ...form, notas: e.target.value })}
                  className={inputClass} rows={2}
                  placeholder="Observaciones del presupuesto..." />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección 2: Repuestos */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                Repuestos
              </CardTitle>
              <Button type="button" variant="ghost" size="sm"
                onClick={agregarRepuesto} className="text-orange-500 hover:text-orange-600">
                + Agregar repuesto
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {itemsRepuesto.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-4">
                No hay repuestos — hacé click en <b>+ Agregar repuesto</b>
              </p>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground px-2">
                  <div className="flex-1">Repuesto</div>
                  <div className="w-20 flex-shrink-0">Cantidad</div>
                  <div className="w-32 flex-shrink-0">Precio unit.</div>
                  <div className="w-28 flex-shrink-0 text-right">Subtotal</div>
                  <div className="w-5 flex-shrink-0"></div>
                </div>
                {itemsRepuesto.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center bg-muted/50 rounded-lg p-2">
                    <div className="flex-1 min-w-0">
                      <select value={item.ref_id}
                        onChange={e => handleRepuestoSelect(i, e.target.value)}
                        style={selectStyle} className={`${inputClass} bg-white`}>
                        <option value="">Seleccionar repuesto...</option>
                        {repuestos.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                      </select>
                    </div>
                    <div className="w-20 flex-shrink-0">
                      <input type="number" value={item.cantidad} min="1"
                        onChange={e => { const n = [...itemsRepuesto]; n[i].cantidad = e.target.value; setItemsRepuesto(n); }}
                        className={inputClass} />
                    </div>
                    <div className="w-32 flex-shrink-0">
                      <input type="number" value={item.precio_unitario}
                        onChange={e => { const n = [...itemsRepuesto]; n[i].precio_unitario = e.target.value; setItemsRepuesto(n); }}
                        className={inputClass} />
                    </div>
                    <div className="w-28 flex-shrink-0 text-right text-sm font-medium">
                      {((parseFloat(item.cantidad) || 0) * (parseFloat(item.precio_unitario) || 0)).toLocaleString("es-PY")} Gs.
                    </div>
                    <button type="button"
                      onClick={() => setItemsRepuesto(itemsRepuesto.filter((_, idx) => idx !== i))}
                      className="w-5 flex-shrink-0 text-red-400 hover:text-red-500 text-xl font-bold leading-none text-center">×</button>
                  </div>
                ))}
                <div className="text-right text-sm text-muted-foreground pr-2 pt-1">
                  Subtotal: <span className="font-semibold text-foreground">{totalRepuestos.toLocaleString("es-PY")} Gs.</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sección 3: Servicios */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                Mano de obra / Servicios
              </CardTitle>
              <Button type="button" variant="ghost" size="sm"
                onClick={agregarServicio} className="text-orange-500 hover:text-orange-600">
                + Agregar servicio
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {itemsServicio.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-4">
                No hay servicios — hacé click en <b>+ Agregar servicio</b>
              </p>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground px-2">
                  <div className="flex-1">Servicio</div>
                  <div className="w-20 flex-shrink-0">Cantidad</div>
                  <div className="w-32 flex-shrink-0">Precio unit.</div>
                  <div className="w-28 flex-shrink-0 text-right">Subtotal</div>
                  <div className="w-5 flex-shrink-0"></div>
                </div>
                {itemsServicio.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center bg-muted/50 rounded-lg p-2">
                    <div className="flex-1 min-w-0">
                      <select value={item.ref_id}
                        onChange={e => handleServicioSelect(i, e.target.value)}
                        style={selectStyle} className={`${inputClass} bg-white`}>
                        <option value="">Seleccionar servicio...</option>
                        {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                      </select>
                    </div>
                    <div className="w-20 flex-shrink-0">
                      <input type="number" value={item.cantidad} min="1"
                        onChange={e => { const n = [...itemsServicio]; n[i].cantidad = e.target.value; setItemsServicio(n); }}
                        className={inputClass} />
                    </div>
                    <div className="w-32 flex-shrink-0">
                      <input type="number" value={item.precio_unitario}
                        onChange={e => { const n = [...itemsServicio]; n[i].precio_unitario = e.target.value; setItemsServicio(n); }}
                        className={inputClass} />
                    </div>
                    <div className="w-28 flex-shrink-0 text-right text-sm font-medium">
                      {((parseFloat(item.cantidad) || 0) * (parseFloat(item.precio_unitario) || 0)).toLocaleString("es-PY")} Gs.
                    </div>
                    <button type="button"
                      onClick={() => setItemsServicio(itemsServicio.filter((_, idx) => idx !== i))}
                      className="w-5 flex-shrink-0 text-red-400 hover:text-red-500 text-xl font-bold leading-none text-center">×</button>
                  </div>
                ))}
                <div className="text-right text-sm text-muted-foreground pr-2 pt-1">
                  Subtotal: <span className="font-semibold text-foreground">{totalServicios.toLocaleString("es-PY")} Gs.</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total y botones */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Repuestos: <span className="font-medium text-foreground">{totalRepuestos.toLocaleString("es-PY")} Gs.</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Mano de obra: <span className="font-medium text-foreground">{totalServicios.toLocaleString("es-PY")} Gs.</span>
                </p>
                <Separator className="my-2" />
                <p className="text-xl font-bold">Total: {totalGeneral.toLocaleString("es-PY")} Gs.</p>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={guardando}
                  className="bg-orange-500 hover:bg-orange-600 text-white">
                  {guardando ? "Guardando..." : "Crear Presupuesto"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      </form>
    </div>
  );
}