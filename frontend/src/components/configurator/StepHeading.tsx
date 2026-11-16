export function StepHeading({ eyebrow, title, lede }: { eyebrow: string; title: string; lede?: string }) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-ember">{eyebrow}</p>
      <h2 className="font-display text-3xl font-black leading-tight">{title}</h2>
      {lede && <p className="mt-2 text-ceniza">{lede}</p>}
    </div>
  );
}
