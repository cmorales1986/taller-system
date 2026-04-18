/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AutoComplete from "@/components/ui/AutoComplete";

interface Cliente {
  id: string;
  nombre: string;
}
interface Marca {
  id: string;
  nombre: string;
}
interface Modelo {
  id: string;
  nombre: string;
}
interface Vehiculo {
  id: string;
  patente: string;
  marca: string;
  modelo: string;
  anio: number | null;
  color: string | null;
  kilometraje: number | null;
  clientes: { id: string; nombre: string; telefono: string | null };
}

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [nuevaMarca, setNuevaMarca] = useState("");
  const [nuevoModelo, setNuevoModelo] = useState("");
  const [showNuevaMarca, setShowNuevaMarca] = useState(false);
  const [showNuevoModelo, setShowNuevoModelo] = useState(false);

  const [form, setForm] = useState({
    cliente_id: "",
    patente: "",
    marca_id: "",
    marca: "",
    modelo_id: "",
    modelo: "",
    anio: "",
    color: "",
    vin: "",
    kilometraje: "",
    notas: "",
  });

  useEffect(() => {
    fetchVehiculos();
    fetchClientes();
    fetchMarcas();
  }, []);

  async function fetchVehiculos() {
    setLoading(true);
    const res = await fetch("/api/vehiculos");
    setVehiculos(await res.json());
    setLoading(false);
  }

  async function fetchClientes() {
    const res = await fetch("/api/clientes");
    setClientes(await res.json());
  }

  async function fetchMarcas() {
    const res = await fetch("/api/marcas");
    setMarcas(await res.json());
  }

  async function handleMarcaChange(marca_id: string) {
    const marca = marcas.find((m) => m.id === marca_id);
    setForm({
      ...form,
      marca_id,
      marca: marca?.nombre || "",
      modelo_id: "",
      modelo: "",
    });
    setModelos([]);
    if (!marca_id) return;
    const res = await fetch(`/api/modelos?marca_id=${marca_id}`);
    setModelos(await res.json());
  }

  async function handleGuardarMarca() {
    if (!form.marca.trim()) return;
    const res = await fetch("/api/marcas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: form.marca.trim() }),
    });
    const data = await res.json();
    setMarcas(
      [...marcas, data].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    );
    setForm({ ...form, marca_id: data.id, modelo: "", modelo_id: "" });
    setModelos([]);
  }

  async function handleGuardarModelo() {
    if (!form.modelo.trim() || !form.marca_id) return;
    const res = await fetch("/api/modelos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.modelo.trim(),
        marca_id: form.marca_id,
      }),
    });
    const data = await res.json();
    setModelos(
      [...modelos, data].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    );
    setForm({ ...form, modelo_id: data.id });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    const res = await fetch("/api/vehiculos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        marca: form.marca,
        modelo: form.modelo,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      setGuardando(false);
      return;
    }
    setForm({
      cliente_id: "",
      patente: "",
      marca_id: "",
      marca: "",
      modelo_id: "",
      modelo: "",
      anio: "",
      color: "",
      vin: "",
      kilometraje: "",
      notas: "",
    });
    setModelos([]);
    setShowForm(false);
    setGuardando(false);
    fetchVehiculos();
  }

  const selectStyle = { color: "#111827" };
  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400";

  const filtrados = vehiculos.filter(
    (v) =>
      v.patente.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.modelo.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.clientes?.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vehículos</h1>
          <p className="text-gray-500 text-sm mt-1">
            {vehiculos.length} vehículos registrados
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nuevo Vehículo
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Nuevo Vehículo
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Cliente */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Cliente *
              </label>
              <select
                required
                value={form.cliente_id}
                onChange={(e) =>
                  setForm({ ...form, cliente_id: e.target.value })
                }
                style={selectStyle}
                className={`${inputClass} bg-white`}
              >
                <option value="">Seleccionar cliente...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Patente */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Patente *
              </label>
              <input
                required
                value={form.patente}
                onChange={(e) =>
                  setForm({ ...form, patente: e.target.value.toUpperCase() })
                }
                className={inputClass}
                placeholder="ABC 123"
              />
            </div>

            {/* Marca */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Marca *
              </label>
              <AutoComplete
                opciones={marcas}
                value={form.marca}
                placeholder="Escribí para buscar..."
                required
                onChange={async (valor, opcion) => {
                  if (opcion) {
                    setForm({
                      ...form,
                      marca: valor,
                      marca_id: opcion.id,
                      modelo: "",
                      modelo_id: "",
                    });
                    const res = await fetch(
                      `/api/modelos?marca_id=${opcion.id}`,
                    );
                    setModelos(await res.json());
                  } else {
                    setForm({
                      ...form,
                      marca: valor,
                      marca_id: "",
                      modelo: "",
                      modelo_id: "",
                    });
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
                  setMarcas(
                    [...marcas, data].sort((a, b) =>
                      a.nombre.localeCompare(b.nombre),
                    ),
                  );
                  setForm({
                    ...form,
                    marca: data.nombre,
                    marca_id: data.id,
                    modelo: "",
                    modelo_id: "",
                  });
                  setModelos([]);
                }}
              />
            </div>

            {/* Modelo */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Modelo *
              </label>
              <AutoComplete
                opciones={modelos}
                value={form.modelo}
                placeholder={
                  form.marca_id
                    ? "Escribí para buscar..."
                    : "Primero seleccioná una marca"
                }
                disabled={!form.marca_id}
                required
                onChange={(valor, opcion) => {
                  setForm({
                    ...form,
                    modelo: valor,
                    modelo_id: opcion?.id || "",
                  });
                }}
                onNuevo={async (valor) => {
                  const res = await fetch("/api/modelos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      nombre: valor.trim(),
                      marca_id: form.marca_id,
                    }),
                  });
                  const data = await res.json();
                  setModelos(
                    [...modelos, data].sort((a, b) =>
                      a.nombre.localeCompare(b.nombre),
                    ),
                  );
                  setForm({ ...form, modelo: data.nombre, modelo_id: data.id });
                }}
              />
            </div>

            {/* Año */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Año
              </label>
              <input
                type="number"
                value={form.anio}
                onChange={(e) => setForm({ ...form, anio: e.target.value })}
                className={inputClass}
                placeholder="2020"
                min="1950"
                max="2030"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Color
              </label>
              <input
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className={inputClass}
                placeholder="Blanco, Negro, Rojo..."
              />
            </div>

            {/* Kilometraje */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Kilometraje
              </label>
              <input
                type="number"
                value={form.kilometraje}
                onChange={(e) =>
                  setForm({ ...form, kilometraje: e.target.value })
                }
                className={inputClass}
                placeholder="50000"
              />
            </div>

            {/* VIN */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                VIN / Chasis
              </label>
              <input
                value={form.vin}
                onChange={(e) => setForm({ ...form, vin: e.target.value })}
                className={inputClass}
                placeholder="Número de chasis"
              />
            </div>

            {/* Notas */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Notas
              </label>
              <textarea
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                className={inputClass}
                rows={2}
                placeholder="Observaciones adicionales"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={guardando}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Guardar Vehículo"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Buscador */}
      <div className="mb-4">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Buscar por patente, marca, modelo o cliente..."
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {busqueda
              ? "No se encontraron vehículos"
              : "No hay vehículos registrados aún"}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Patente
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Vehículo
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Año
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Color
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Kilometraje
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Cliente
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded">
                      {v.patente}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {v.marca} {v.modelo}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{v.anio || "—"}</td>
                  <td className="px-6 py-4 text-gray-500">{v.color || "—"}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {v.kilometraje
                      ? `${v.kilometraje.toLocaleString()} km`
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {v.clientes?.nombre}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/vehiculos/${v.id}`}
                      className="text-orange-500 hover:text-orange-600 font-medium text-xs"
                    >
                      Ver detalle →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
