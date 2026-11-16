import type { Notice } from '@afrodisiaco/shared';

const STYLES: Record<Notice['severity'], { box: string; icon: string; label: string }> = {
  info: { box: 'border-line text-ceniza', icon: 'ℹ', label: 'Nota' },
  warning: { box: 'border-champan/50 text-champan', icon: '⚠', label: 'Aviso' },
  error: { box: 'border-ember/70 text-ember', icon: '✕', label: 'Atención' },
};

export function NoticeList({ notices }: { notices: Notice[] }) {
  if (notices.length === 0) return null;
  return (
    <ul className="space-y-2" aria-label="Avisos de tu configuración">
      {notices.map((n) => (
        <li key={n.code} role={n.severity === 'error' ? 'alert' : undefined} className={`flex gap-2 rounded-sm border bg-noir-2 px-3 py-2 text-sm ${STYLES[n.severity].box}`}>
          <span aria-hidden="true">{STYLES[n.severity].icon}</span>
          <span>
            <span className="sr-only">{STYLES[n.severity].label}: </span>
            {n.message}
          </span>
        </li>
      ))}
    </ul>
  );
}
