import { formatMXN } from '@afrodisiaco/shared';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrice } from '@/services/pricingService';
import { useCatalogStore } from '@/store/catalogStore';

export function PriceSummary({ showLines = true }: { showLines?: boolean }) {
  const price = usePrice();
  const disclaimer = useCatalogStore((s) => s.catalog.pricing.disclaimer);

  return (
    <div>
      {showLines && price.lines.length > 0 && (
        <ul className="mb-3 space-y-1 text-sm">
          {price.lines.map((l) => (
            <li key={l.label} className="flex justify-between gap-3">
              <span className="text-ceniza">{l.label}</span>
              <span className="tabular-nums">{formatMXN(l.amount)}</span>
            </li>
          ))}
          {price.complexityAmount !== 0 && (
            <li className="flex justify-between gap-3">
              <span className="text-ceniza">Complejidad del evento</span>
              <span className="tabular-nums">{formatMXN(price.complexityAmount)}</span>
            </li>
          )}
        </ul>
      )}
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ceniza">Precio estimado</p>
      <p className="font-display text-4xl font-black leading-tight text-champan" aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={price.total}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="inline-block tabular-nums"
          >
            {price.total > 0 ? formatMXN(price.total) : 'Elige un nivel'}
          </motion.span>
        </AnimatePresence>
      </p>
      <p className="mt-2 text-xs leading-relaxed text-ceniza">{disclaimer}</p>
    </div>
  );
}
