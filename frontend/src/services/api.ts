/** Base de la API. En producción es el mismo dominio; en desarrollo Vite la redirige al backend. */
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public detail?: unknown,
  ) {
    super(code);
  }
}

export async function apiRequest(path: string, init?: RequestInit): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`${API_BASE}/api${path}`, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
    const body: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const code = typeof body === 'object' && body !== null && 'error' in body ? String(body.error) : 'error';
      throw new ApiError(res.status, code, body);
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}
