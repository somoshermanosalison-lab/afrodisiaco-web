import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost' | 'gold' | 'whatsapp';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ember text-white hover:bg-oxblood',
  gold: 'bg-champan text-noir hover:brightness-110',
  ghost: 'border border-line text-humo hover:border-champan hover:text-champan',
  whatsapp: 'bg-wa text-noir hover:brightness-110',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'primary', className = '', type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-sm px-6 py-3 text-[15px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  );
}
