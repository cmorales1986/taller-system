/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Usuario {
  id: string; nombre: string; email: string;
  rol: string; activo: boolean; creado_en: string;
}

const ROLES: Record<string, { label: string; color: string }> = {
  admin:          { label: "Administrador",  color: "bg-red-100 text-red-700 border-red-200" },
  administrativo: { label: "Administrativo", color: "bg-blue-100 text-blue-700 border-blue-200" },
  mecanico:       { label: "Mecánico",       color: "bg-orange-100 text-orange-700 border-orange-200" },
  consultas:      { label: "Consultas",      color: "bg-gray-100 text-gray-600 border-gray-200" },
};

const ROLES_OPTIONS = [
  { value: "admin",          label: "Administrador" },
  { value: "administrativo", label: "Administrativo" },
  { value: "mecanico",       label: "Mecánico" },
  { value: "consultas",      label: "Consultas" },
];

const formVacio = { nombre: "", email: "", password: "", rol: "mecanico" };

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState(formVacio);

  async function fetchUsuarios() {
    setLoading(true);
    const res = await fetch("/api/usuarios");
    setUsuarios(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchUsuarios(); }, []);

  function handleEditar(u: Usuario) {
    setEditando(u);
    setForm({ nombre: u.nombre, email: u.email, password: "", rol: u.rol });
    setShowForm(true);
  }

  function handleNuevo() {
    setEditando(null);
    setForm(formVacio);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);

    const url = editando ? `/api/usuarios/${editando.id}` : "/api/usuarios";
    const method = editando ? "PUT" : "POST";

    // Si editando y no cambió password, no lo mandamos
    const body = { ...form };
    if (editando && !body.password) delete (body as any).password;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) { alert(data.error); setGuardando(false); return; }

    setShowForm(false);
    setEditando(null);
    setForm(formVacio);
    setGuardando(false);
    fetchUsuarios();
  }

  async function handleEliminar(id: string, nombre: string) {
    if (!confirm(`¿Desactivar al usuario ${nombre}?`)) return;
    await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
    fetchUsuarios();
  }

  const inputClass = "w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring";
  const selectStyle = { color: "#111827" };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {usuarios.length} usuarios activos
          </p>
        </div>
        <Button onClick={handleNuevo}
          className="bg-orange-500 hover:bg-orange-600 text-white">
          + Nuevo Usuario
        </Button>
      </div>

      {/* Formulario */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold text-foreground mb-4">
              {editando ? "Editar Usuario" : "Nuevo Usuario"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Nombre *
                  </label>
                  <input required value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                    className={inputClass} placeholder="Nombre completo" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Email *
                  </label>
                  <input required type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className={inputClass} placeholder="usuario@taller.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    {editando ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña *"}
                  </label>
                  <input type="password" value={form.password}
                    required={!editando}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className={inputClass} placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Rol *
                  </label>
                  <select required value={form.rol}
                    onChange={e => setForm({ ...form, rol: e.target.value })}
                    style={selectStyle} className={`${inputClass} bg-white`}>
                    {ROLES_OPTIONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={guardando}
                  className="bg-orange-500 hover:bg-orange-600 text-white">
                  {guardando ? "Guardando..." : editando ? "Actualizar" : "Crear Usuario"}
                </Button>
                <Button type="button" variant="outline"
                  onClick={() => { setShowForm(false); setEditando(null); }}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Cargando...</div>
          ) : usuarios.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No hay usuarios registrados</div>
          ) : (
            <div>
              {usuarios.map((u, i) => (
                <div key={u.id}>
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {u.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{u.nombre}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ROLES[u.rol]?.color}`}>
                        {ROLES[u.rol]?.label || u.rol}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Desde {new Date(u.creado_en).toLocaleDateString("es-PY")}
                      </p>
                      <Button variant="ghost" size="sm"
                        onClick={() => handleEditar(u)}
                        className="text-orange-500 hover:text-orange-600 text-xs">
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm"
                        onClick={() => handleEliminar(u.id, u.nombre)}
                        className="text-red-400 hover:text-red-500 text-xs">
                        Desactivar
                      </Button>
                    </div>
                  </div>
                  {i < usuarios.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}