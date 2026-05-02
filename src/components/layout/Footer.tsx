export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-3 px-6 flex items-center justify-center gap-2">
      <img
        src="/logo_cdm.jpeg"
        alt="CDM Software"
        className="h-5 w-auto object-contain opacity-70"
      />
      <p className="text-xs text-muted-foreground">
        Desarrollado por <span className="font-medium text-gray-600">CDM Software</span> © 2026
      </p>
    </footer>
  );
}