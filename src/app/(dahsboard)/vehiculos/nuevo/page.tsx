/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AutoComplete from "@/components/ui/AutoComplete";

interface Cliente { id: string; nombre: string; }
interface Marca { id: string; nombre: string; }
interface Modelo { id: string; nombre: string; }

export default function NuevoVehiculoPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    cliente_id: "", patente: "",
    marca_id: "", marca: "",
    modelo_id: "", modelo: "",
    anio: "", color: "", vin: "", kilometraje: "", notas: "",
  });

  useEffect(() => {
    fetch("/api/clientes").then(r => r.json()).then(setClientes);
    fetch("/api/marcas").then(r => r.json()).then(setMarcas);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const res = await fetch("/api/vehiculos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, marca: form.marca, modelo: form.modelo }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error al guardar el vehículo.");
      setGuardando(false);
      return;
    }

    router.push("/vehiculos");
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400";
  const selectStyle = { color: "#111827" };

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 transition-colors">
          ← Volver
        </button>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Nuevo Vehículo</h1>
          <p className="text-gray-500 text-sm mt-0.5">Completá los datos del vehículo</p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Cliente */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Cliente *</label>
            <select
              required
              value={form.cliente_id}
              onChange={e => setForm({ ...form, cliente_id: e.target.value })}
              style={selectStyle}
              className={`${inputClass} bg-white`}
            >
              <option value="">Seleccionar cliente...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* Patente */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Patente *</label>
            <input
              required
              value={form.patente}
              onChange={e => setForm({ ...form, patente: e.target.value.toUpperCase() })}
              className={inputClass}
              placeholder="ABC 123"
            />
          </div>

          {/* Marca */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Marca *</label>
            <AutoComplete
              opciones={marcas}
              value={form.marca}
              placeholder="Escribí para buscar..."
              required
              onChange={async (valor, opcion) => {
                if (opcion) {
                  setForm({ ...form, marca: valor, marca_id: opcion.id, modelo: "", modelo_id: "" });
                  const res = await fetch(`/api/modelos?marca_id=${opcion.id}`);
                  setModelos(await res.json());
                } else {
                  setForm({ ...form, marca: valor, marca_id: "", modelo: "", modelo_id: "" });
                  setModelos([]);
                }
              }}
              onNuevo={async (valor) => {
                const res = await fetch("/api/marcas", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ nombre: valor.trim() }),
                });
                const data = await res.json();
                setMarcas([...marcas, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
                setForm({ ...form, marca: data.nombre, marca_id: data.id, modelo: "", modelo_id: "" });
                setModelos([]);
              }}
            />
          </div>

          {/* Modelo */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Modelo *</label>
            <AutoComplete
              opciones={modelos}
              value={form.modelo}
              placeholder={form.marca_id ? "Escribí para buscar..." : "Primero seleccioná una marca"}
              disabled={!form.marca_id}
              required
              onChange={(valor, opcion) => {
                setForm({ ...form, modelo: valor, modelo_id: opcion?.id || "" });
              }}
              onNuevo={async (valor) => {
                const res = await fetch("/api/modelos", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ nombre: valor.trim(), marca_id: form.marca_id }),
                });
                const data = await res.json();
                setModelos([...modelos, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
                setForm({ ...form, modelo: data.nombre, modelo_id: data.id });
              }}
            />
          </div>

          {/* Año */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Año</label>
            <input
              type="number"
              value={form.anio}
              onChange={e => setForm({ ...form, anio: e.target.value })}
              className={inputClass}
              placeholder="2020"
              min="1950" max="2030"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Color</label>
            <input
              value={form.color}
              onChange={e => setForm({ ...form, color: e.target.value })}
              className={inputClass}
              placeholder="Blanco, Negro, Rojo..."
            />
          </div>

          {/* Kilometraje */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Kilometraje</label>
            <input
              type="number"
              value={form.kilometraje}
              onChange={e => setForm({ ...form, kilometraje: e.target.value })}
              className={inputClass}
              placeholder="50000"
            />
          </div>

          {/* VIN */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">VIN / Chasis</label>
            <input
              value={form.vin}
              onChange={e => setForm({ ...form, vin: e.target.value })}
              className={inputClass}
              placeholder="Número de chasis"
            />
          </div>

          {/* Notas */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Notas</label>
            <textarea
              value={form.notas}
              onChange={e => setForm({ ...form, notas: e.target.value })}
              className={inputClass}
              rows={3}
              placeholder="Observaciones adicionales"
            />
          </div>

        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={guardando}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar Vehículo"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>

    </div>
  );
}