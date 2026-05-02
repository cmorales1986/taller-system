export default function LoadingCar() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <img
        src="/Loading.gif"
        alt="Cargando..."
        className="w-48 h-48 object-contain"
        style={{ mixBlendMode: "multiply" }}
      />
      <p className="text-sm text-muted-foreground animate-pulse">Cargando...</p>
    </div>
  );
}