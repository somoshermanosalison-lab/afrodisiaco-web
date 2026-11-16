import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-impact text-7xl text-ember">404</p>
      <h1 className="font-display text-3xl font-black">Esta página no existe</h1>
      <p className="text-ceniza">Pero tu evento sí: vuelve al configurador y ármalo.</p>
      <Link to="/" className="inline-flex min-h-12 items-center rounded-sm bg-ember px-6 py-3 font-medium text-white transition hover:bg-oxblood">
        Ir al configurador
      </Link>
    </div>
  );
}
