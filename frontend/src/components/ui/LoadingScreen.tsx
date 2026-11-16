export function LoadingScreen({ label = 'Cargando…', compact = false }: { label?: string; compact?: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 text-ceniza ${compact ? 'h-full min-h-40' : 'min-h-[60vh]'}`}
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-champan" aria-hidden="true" />
      <span className="text-sm tracking-wide">{label}</span>
    </div>
  );
}
