import { useId, useState } from 'react';
import { patchAddon, patchEquipment, patchPackage, type AdminCatalog } from '@/services/adminService';
import { adminErrorMessage } from './AdminPage';

interface FieldDef {
  key: string;
  label: string;
  min: number;
  max: number;
  prefix?: string;
}

interface RowProps {
  title: string;
  subtitle?: string;
  fields: FieldDef[];
  values: Record<string, number>;
  active?: boolean;
  disabled: boolean;
  save: (values: Record<string, number>, active?: boolean) => Promise<unknown>;
  onSaved: () => Promise<void>;
}

/** Una fila editable: campos numéricos, interruptor opcional y botón de guardar. */
function EditableRow({ title, subtitle, fields, values, active, disabled, save, onSaved }: RowProps) {
  const id = useId();
  const [draft, setDraft] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((f) => [f.key, String(values[f.key])])));
  const [on, setOn] = useState(active);
  const [state, setState] = useState<{ kind: 'idle' | 'saving' | 'saved' } | { kind: 'error'; message: string }>({ kind: 'idle' });

  const parsed = Object.fromEntries(fields.map((f) => [f.key, Number(draft[f.key])]));
  const invalid = fields.find((f) => {
    const n = parsed[f.key];
    return draft[f.key].trim() === '' || !Number.isInteger(n) || n < f.min || n > f.max;
  });
  const dirty = fields.some((f) => parsed[f.key] !== values[f.key]) || on !== active;

  const submit = async () => {
    setState({ kind: 'saving' });
    try {
      await save(parsed, on);
      await onSaved();
      setState({ kind: 'saved' });
    } catch (err) {
      console.error('[admin] guardar:', err);
      setState({ kind: 'error', message: adminErrorMessage(err) });
    }
  };

  return (
    <li className="flex flex-wrap items-end gap-x-4 gap-y-3 rounded-md border border-line bg-noir-2 p-4">
      <div className="min-w-48 flex-1">
        <p className="font-medium">{title}</p>
        {subtitle && <p className="text-xs text-ceniza">{subtitle}</p>}
      </div>
      {fields.map((f) => (
        <div key={f.key}>
          <label htmlFor={`${id}-${f.key}`} className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.15em] text-ceniza">
            {f.label}
          </label>
          <div className="relative">
            {f.prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ceniza">{f.prefix}</span>}
            <input
              id={`${id}-${f.key}`}
              type="number"
              inputMode="numeric"
              min={f.min}
              max={f.max}
              disabled={disabled}
              value={draft[f.key]}
              onChange={(e) => {
                setDraft((d) => ({ ...d, [f.key]: e.target.value }));
                setState({ kind: 'idle' });
              }}
              className={`min-h-11 w-32 rounded-sm border border-line bg-noir px-3 text-base tabular-nums disabled:opacity-50 ${f.prefix ? 'pl-7' : ''}`}
            />
          </div>
        </div>
      ))}
      {active !== undefined && (
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={on}
            disabled={disabled}
            onChange={(e) => {
              setOn(e.target.checked);
              setState({ kind: 'idle' });
            }}
            className="h-5 w-5 accent-[var(--color-champan)]"
          />
          Activo
        </label>
      )}
      <button
        type="button"
        disabled={disabled || !dirty || !!invalid || state.kind === 'saving'}
        onClick={() => void submit()}
        className="min-h-11 rounded-sm bg-champan px-4 text-sm font-medium text-noir transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {state.kind === 'saving' ? 'Guardando…' : 'Guardar'}
      </button>
      <p role="status" className="w-full text-xs">
        {invalid && <span className="text-ember">{invalid.label}: entero entre {invalid.min} y {invalid.max}.</span>}
        {state.kind === 'saved' && <span className="text-champan">Guardado ✓</span>}
        {state.kind === 'error' && <span className="text-ember">{state.message}</span>}
      </p>
    </li>
  );
}

interface Props {
  tab: 'addons' | 'equipment' | 'packages';
  catalog: AdminCatalog;
  onSaved: () => Promise<void>;
}

const PRICE = { min: 0, max: 1_000_000, prefix: '$' };

export function CatalogEditor({ tab, catalog, onSaved }: Props) {
  const disabled = !catalog.editable;

  if (tab === 'addons') {
    return (
      <ul className="space-y-2">
        {catalog.addons.map((a) => (
          <EditableRow
            key={a.id}
            title={a.name}
            subtitle={a.description}
            fields={[
              { key: 'price', label: 'Precio c/u', ...PRICE },
              { key: 'maxQuantity', label: 'Máximo', min: 1, max: 20 },
            ]}
            values={{ price: a.price, maxQuantity: a.maxQuantity }}
            active={a.active}
            disabled={disabled}
            save={(v, active) => patchAddon(a.id, { price: v.price, maxQuantity: v.maxQuantity, active })}
            onSaved={onSaved}
          />
        ))}
      </ul>
    );
  }

  if (tab === 'equipment') {
    return (
      <ul className="space-y-2">
        {catalog.equipment.map((e) => (
          <EditableRow
            key={e.id}
            title={e.name}
            subtitle={e.description}
            fields={[{ key: 'quantityAvailable', label: 'Disponibles', min: 0, max: 1000 }]}
            values={{ quantityAvailable: e.quantityAvailable }}
            disabled={disabled}
            save={(v) => patchEquipment(e.id, { quantityAvailable: v.quantityAvailable })}
            onSaved={onSaved}
          />
        ))}
      </ul>
    );
  }

  return (
    <ul className="space-y-2">
      {catalog.packages.map((p) => (
        <EditableRow
          key={p.id}
          title={p.name}
          subtitle={`${p.description} · ${p.hours} hrs`}
          fields={[
            { key: 'basePrice', label: 'Precio base', ...PRICE },
            { key: 'maxGuests', label: 'Invitados máx.', min: 10, max: 2000 },
          ]}
          values={{ basePrice: p.basePrice, maxGuests: p.maxGuests }}
          disabled={disabled}
          save={(v) => patchPackage(p.id, { basePrice: v.basePrice, maxGuests: v.maxGuests })}
          onSaved={onSaved}
        />
      ))}
    </ul>
  );
}
