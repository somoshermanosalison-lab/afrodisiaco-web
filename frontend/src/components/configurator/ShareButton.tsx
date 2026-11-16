import { encodeConfiguration } from '@afrodisiaco/shared';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useConfiguratorStore } from '@/store/configuratorStore';

/** Copia un enlace que abre el configurador con exactamente esta misma configuración. */
export function ShareButton() {
  const config = useConfiguratorStore((s) => s.config);
  const [state, setState] = useState<'idle' | 'copied' | 'manual'>('idle');
  const url = `${window.location.origin}${import.meta.env.BASE_URL}?config=${encodeConfiguration(config)}`;

  const share = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setState('copied');
      setTimeout(() => setState('idle'), 2500);
    } catch {
      // Sin permiso de portapapeles: se muestra el enlace para copiarlo a mano.
      setState('manual');
    }
  };

  return (
    <div>
      <Button variant="ghost" onClick={share} className="w-full">
        {state === 'copied' ? 'Enlace copiado ✓' : 'Compartir configuración'}
      </Button>
      <span className="sr-only" role="status">
        {state === 'copied' ? 'Enlace copiado al portapapeles' : ''}
      </span>
      {state === 'manual' && (
        <label className="mt-2 block text-xs text-ceniza">
          Copia este enlace:
          <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="mt-1 w-full rounded-sm border border-line bg-noir px-3 py-2 text-sm text-humo" />
        </label>
      )}
    </div>
  );
}
