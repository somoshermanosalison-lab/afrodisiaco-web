import { STEPS, type StepId } from '@/store/configuratorStore';

const LABELS: Record<StepId, string> = {
  event: 'Evento',
  guests: 'Invitados',
  venue: 'Espacio',
  level: 'Producción',
  addons: 'Extras',
};

interface Props {
  current: number;
  completed: boolean[];
  onSelect: (step: number) => void;
}

export function ConfiguratorStepper({ current, completed, onSelect }: Props) {
  return (
    <nav aria-label="Pasos del configurador">
      <ol className="flex gap-1.5">
        {STEPS.map((id, i) => {
          const active = i === current;
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={active ? 'step' : undefined}
                className="group w-full text-left"
              >
                <span className={`block h-1 rounded-full transition ${active ? 'bg-champan' : completed[i] ? 'bg-ember' : 'bg-line group-hover:bg-ceniza'}`} />
                <span className={`mt-2 block text-[11px] font-semibold uppercase tracking-[0.14em] ${active ? 'text-champan' : 'text-ceniza'}`}>
                  <span className="mr-1 tabular-nums">{i + 1}.</span>
                  <span className="hidden sm:inline">{LABELS[id]}</span>
                  <span className="sr-only sm:hidden">{LABELS[id]}</span>
                  {completed[i] && <span className="sr-only"> (completado)</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
