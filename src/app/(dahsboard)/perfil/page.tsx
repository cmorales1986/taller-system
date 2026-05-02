"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [form, setForm] = useState({
    nombre: "", email: "", password: "", password_confirm: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(data => {
        const u = data?.user;
        if (u) {
          setUsuario(u);
          setForm(f => ({ ...f, nombre: u.nombre || u.name || "", email: u.email || "" }));
        }
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setExito("");

    if (form.password && form.password !== form.password_confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setGuardando(true);
    const body: any = { nombre: form.nombre, email: form.email };
    if (form.password) body.password = form.password;

    const res = await fetch(`/api/usuarios/${usuario?.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error || "Error al guardar"); setGuardando(false); return; }

    setExito("Perfil actualizado correctamente");
    setForm(f => ({ ...f, password: "", password_confirm: "" }));
    setGuardando(false);
  }

  const inputClass = "w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-orange-400";

  if (!usuario) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground">Cargando...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Actualizá tus datos personales</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
              {form.nombre?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{form.nombre}</p>
              <p className="text-xs text-muted-foreground capitalize">{usuario?.rol}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Nombre *</label>
              <input required value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                className={inputClass} placeholder="Nombre completo" />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Email *</label>
              <input required type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={inputClass} />
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Cambiar contraseña <span className="normal-case font-normal">(dejar vacío para no cambiar)</span>
              </p>
              <div className="space-y-3">
                <div className="relative">
                  <input type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className={`${inputClass} pr-11`}
                    placeholder="Nueva contraseña" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <input type={showConfirm ? "text" : "password"}
                    value={form.password_confirm}
                    onChange={e => setForm({ ...form, password_confirm: e.target.value })}
                    className={`${inputClass} pr-11`}
                    placeholder="Confirmar nueva contraseña" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}
            {exito && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <p className="text-xs text-green-600 font-medium">✓ {exito}</p>
              </div>
            )}

            <Button type="submit" disabled={guardando}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white">
              {guardando ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}