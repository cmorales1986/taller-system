"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  const inputClass =
    "w-full border border-input rounded-lg px-3 py-3 text-base bg-background focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🔧</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TallerSystem</h1>
          <p className="text-muted-foreground text-sm mt-1">Ingresá a tu cuenta</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  onKeyDown={e => e.key === "Enter" && handleSubmit(e as any)}
                  className={inputClass}
                  placeholder="admin@taller.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    onKeyDown={e => e.key === "Enter" && handleSubmit(e as any)}
                    className={`${inputClass} pr-11`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white h-12 text-base"
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          TallerSystem v1.0 — Fase 1
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}