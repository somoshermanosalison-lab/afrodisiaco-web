import { useEffect, useId, useState } from 'react';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  integer?: boolean;
  onChange: (value: number) => void;
}

/**
 * Campo numérico validado. Solo avisa al padre cuando el valor es un número
 * dentro del rango; mientras tanto muestra el error y conserva el último valor válido.
 */
export function NumberField({ label, value, min, max, step = 1, unit, integer = false, onChange }: Props) {
  const id = useId();
  const [text, setText] = useState(String(value));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText((prev) => (Number(prev) === value ? prev : String(value)));
    setError(null);
  }, [value]);

  const handle = (raw: string) => {
    setText(raw);
    const n = Number(raw.replace(',', '.'));
    if (raw.trim() === '' || !Number.isFinite(n)) return setError('Escribe un número');
    if (integer && !Number.isInteger(n)) return setError('Debe ser un número entero');
    if (n < min) return setError(`Mínimo ${min}${unit ? ` ${unit}` : ''}`);
    if (n > max) return setError(`Máximo ${max}${unit ? ` ${unit}` : ''}`);
    setError(null);
    onChange(n);
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-ceniza">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode={integer ? 'numeric' : 'decimal'}
          min={min}
          max={max}
          step={step}
          value={text}
          onChange={(e) => handle(e.target.value)}
          onBlur={() => error && (setText(String(value)), setError(null))}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`min-h-12 w-full rounded-sm border bg-noir-2 px-4 py-3 text-base text-humo ${unit ? 'pr-12' : ''} ${error ? 'border-ember' : 'border-line'}`}
        />
        {unit && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ceniza">{unit}</span>}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-ember">
          {error}
        </p>
      )}
    </div>
  );
}
