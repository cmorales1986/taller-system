"use client";

import { useState, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface Props {
  onResult: (texto: string) => void;
  contexto?: string; // ej: "problema mecánico", "diagnóstico técnico"
}

export default function MicButton({
  onResult,
  contexto = "descripción mecánica",
}: Props) {
  const [estado, setEstado] = useState<"idle" | "grabando" | "procesando">(
    "idle",
  );
  const [error, setError] = useState("");
  const recognitionRef = useRef<any>(null);
  const transcriptoRef = useRef("");

  function iniciarGrabacion() {
    setError("");
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Tu navegador no soporta reconocimiento de voz. Usá Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-PY";
    recognition.continuous = true;
    recognition.interimResults = true;
    transcriptoRef.current = "";

    recognition.onresult = (event: any) => {
      let texto = "";
      for (let i = 0; i < event.results.length; i++) {
        texto += event.results[i][0].transcript;
      }
      transcriptoRef.current = texto;
    };

    recognition.onerror = () => {
      setError("Error al grabar. Intentá de nuevo.");
      setEstado("idle");
    };

    recognition.onend = async () => {
      if (!transcriptoRef.current.trim()) {
        setEstado("idle");
        return;
      }
      setEstado("procesando");
      await mejorarConClaude(transcriptoRef.current);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setEstado("grabando");
  }

  function detenerGrabacion() {
    recognitionRef.current?.stop();
  }

  async function mejorarConClaude(textoRaw: string) {
    try {
      console.log("🎤 Texto original:", textoRaw);

      const response = await fetch("/api/mejorar-texto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: textoRaw, contexto }),
      });

      console.log("📡 Status respuesta:", response.status);

      const data = await response.json();
      console.log("✅ Respuesta completa:", data);

      const textoMejorado = data.texto || textoRaw;
      console.log("📝 Texto mejorado:", textoMejorado);

      onResult(textoMejorado);
    } catch (error) {
      console.error("❌ Error:", error);
      onResult(textoRaw);
    } finally {
      setEstado("idle");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={estado === "grabando" ? detenerGrabacion : iniciarGrabacion}
        disabled={estado === "procesando"}
        title={
          estado === "grabando" ? "Detener grabación" : "Hablar para dictar"
        }
        className={`p-2 rounded-full transition-all ${
          estado === "grabando"
            ? "bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg shadow-red-200"
            : estado === "procesando"
              ? "bg-orange-100 text-orange-400 cursor-not-allowed"
              : "bg-gray-100 hover:bg-orange-100 text-gray-500 hover:text-orange-500"
        }`}
      >
        {estado === "procesando" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : estado === "grabando" ? (
          <MicOff size={16} />
        ) : (
          <Mic size={16} />
        )}
      </button>
      {estado === "grabando" && (
        <span className="text-xs text-red-500 font-medium animate-pulse">
          Grabando...
        </span>
      )}
      {estado === "procesando" && (
        <span className="text-xs text-orange-500 font-medium">
          Mejorando con IA...
        </span>
      )}
      {error && (
        <span className="text-xs text-red-500 max-w-32 text-right">
          {error}
        </span>
      )}
    </div>
  );
}
