import { LoadingScreen } from '@/components/ui/LoadingScreen';

/** Se muestra mientras se descarga la vista 3D. Vive aparte para no arrastrar three.js al arranque. */
export function ViewerFallback() {
  return (
    <div className="h-full w-full rounded-md border border-line bg-noir">
      <LoadingScreen compact label="Cargando vista 3D…" />
    </div>
  );
}
