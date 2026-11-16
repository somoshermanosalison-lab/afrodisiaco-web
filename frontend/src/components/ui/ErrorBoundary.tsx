import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Qué mostrar si algo falla. Por defecto, una pantalla completa de error. */
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  failed: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ui] error capturado:', error, info.componentStack);
    this.props.onError?.(error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    if (this.props.fallback !== undefined) return this.props.fallback;
    return (
      <div role="alert" className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="font-display text-3xl font-black">Algo no salió bien</h1>
        <p className="text-ceniza">Tu configuración está guardada. Recarga la página para continuar.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-sm bg-ember px-6 py-3 font-medium text-white transition hover:bg-oxblood"
        >
          Recargar
        </button>
      </div>
    );
  }
}
