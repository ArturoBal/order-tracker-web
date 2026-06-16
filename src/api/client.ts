const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function buildHeaders(withAuth: boolean): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const token = localStorage.getItem('access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function extractMessage(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json();
    if (data && typeof data === 'object' && 'message' in data) {
      const m = (data as { message?: unknown }).message;
      if (typeof m === 'string') return m;
      if (Array.isArray(m))
        return m.filter((s): s is string => typeof s === 'string').join(' ');
    }
  } catch {
    // keep default
  }
  return res.statusText || `Error ${res.status}`;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  withAuth = false,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: buildHeaders(withAuth),
      ...init,
    });
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Verifica tu conexion e intenta de nuevo.',
      0,
    );
  }

  if (!response.ok) {
    const message = await extractMessage(response);
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
