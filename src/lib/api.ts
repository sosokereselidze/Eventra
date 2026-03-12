export function getApiUrl(path: string): string {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // If VITE_API_URL is exactly "/api" or "api", and the path already starts with "/api"
  // we just return the path directly to avoid "/api/api/..."
  if ((envUrl === '/api' || envUrl === 'api') && path.startsWith('/api')) {
    return path;
  }

  const base = (envUrl ?? 'http://localhost:3001').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  
  // Safety check: if base and path both contain /api at the boundary
  if (base.endsWith('/api') && p.startsWith('/api/')) {
    return `${base}${p.substring(4)}`;
  }
  
  return `${base}${p}`;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function fetchApi<T>(
  path: string,
  opts: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, ...init } = opts;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (!skipAuth) {
    const t = getToken();
    if (t) headers['Authorization'] = `Bearer ${t}`;
  }
  const res = await fetch(getApiUrl(path), { ...init, headers });
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const err = (data as { error?: string })?.error || res.statusText || 'Request failed';
    throw new Error(err);
  }
  return data as T;
}
