"use client";

import { useState, useRef, useEffect } from "react";

interface Opcion {
  id: string;
  nombre: string;
}

interface Props {
  opciones: Opcion[];
  value: string;
  onChange: (valor: string, opcion?: Opcion) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  onNuevo?: (valor: string) => void; // Si se pasa, muestra botón "+ Guardar nuevo"
}

export default function AutoComplete({
  opciones, value, onChange, placeholder, disabled, required, onNuevo
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [filtradas, setFiltradas] = useState<Opcion[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange(val, undefined);
    const filtro = opciones.filter(o =>
      o.nombre.toLowerCase().includes(val.toLowerCase())
    );
    setFiltradas(filtro);
    setAbierto(true);
  }

  function handleSelect(opcion: Opcion) {
    onChange(opcion.nombre, opcion);
    setAbierto(false);
  }

  function handleFocus() {
    setFiltradas(opciones);
    setAbierto(true);
  }

  const exacta = opciones.find(o => o.nombre.toLowerCase() === value.toLowerCase());
  const mostrarNuevo = onNuevo && value.trim() && !exacta;

  return (
    <div ref={ref} className="relative">
      <input
        required={required}
        disabled={disabled}
        value={value}
        onChange={handleInput}
        onFocus={handleFocus}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${
          disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" : "border-gray-300 bg-white"
        }`}
      />

      {abierto && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {filtradas.length === 0 && !mostrarNuevo ? (
            <div className="px-4 py-3 text-sm text-gray-400">Sin resultados</div>
          ) : (
            <>
              {filtradas.map(op => (
                <button
                  key={op.id}
                  type="button"
                  onMouseDown={() => handleSelect(op)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                >
                  {op.nombre}
                </button>
              ))}
              {mostrarNuevo && (
                <button
                  type="button"
                  onMouseDown={() => { onNuevo!(value); setAbierto(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-orange-500 hover:bg-orange-50 border-t border-gray-100 font-medium"
                >
                  + Guardar <b>{value}</b> como nuevo
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}