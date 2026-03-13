import AsyncStorage from '@react-native-async-storage/async-storage';

// For development, use your local machine's IP if testing on physical device
// For emulator, 10.0.2.2 maps to localhost on Android
// Change this to match your deployed backend URL in production
const API_URL = 'https://eventflow-pro-main.onrender.com';

const TOKEN_KEY = 'eventflow_token';

export function getApiUrl(path: string): string {
    const base = API_URL.replace(/\/$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
}

export async function getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string | null): Promise<void> {
    if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
        await AsyncStorage.removeItem(TOKEN_KEY);
    }
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
        const t = await getToken();
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
