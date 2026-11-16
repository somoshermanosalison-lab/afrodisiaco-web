import type { ReactNode } from 'react';

interface Props {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
  className?: string;
  badge?: string;
}

/** Tarjeta que funciona como opción de un grupo (un solo valor seleccionado). */
export function SelectableCard({ selected, onSelect, children, className = '', badge }: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`relative rounded-md border p-4 text-left transition ${
        selected
          ? 'border-champan bg-noir-3 shadow-[0_0_0_1px_var(--color-champan),0_8px_30px_rgb(198_161_91/0.15)]'
          : 'border-line bg-noir-2 hover:border-ceniza'
      } ${className}`}
    >
      {badge && (
        <span className="absolute -top-2.5 right-3 rounded-full bg-champan px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-noir">
          {badge}
        </span>
      )}
      {children}
    </button>
  );
}
