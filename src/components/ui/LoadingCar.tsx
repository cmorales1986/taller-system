export default function LoadingCar() {
  return (
    <div className="flex flex-col items-center justify-center h-46 gap-3">
      <img
        src="/Loading.gif"
        alt="Cargando..."
        className="w-52 h-52 object-contain"
        style={{ mixBlendMode: "multiply" }}
      />
    </div>
  );
}