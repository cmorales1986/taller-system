export default function LoadingCar() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      {/* Ruta */}
      <div className="relative w-64 h-16 flex items-end">
        {/* Auto que se mueve */}
        <div className="absolute animate-bounce" style={{ animation: "carDrive 2s ease-in-out infinite" }}>
          <span className="text-4xl">🚗</span>
        </div>
        {/* Línea de ruta */}
        <div className="w-full h-0.5 bg-gray-200 rounded-full relative overflow-hidden">
          <div className="absolute h-full bg-orange-400 rounded-full animate-pulse" style={{ width: "40%" }} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">Cargando...</p>

      <style jsx>{`
        @keyframes carDrive {
          0%   { left: 0px;   }
          50%  { left: 200px; }
          100% { left: 0px;   }
        }
      `}</style>
    </div>
  );
}