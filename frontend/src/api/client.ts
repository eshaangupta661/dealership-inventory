const TOKEN_KEY = 'token';
let sessionExpiryHandler: (() => void) | undefined;
let sessionExpiryNotified = false;

export function setSessionExpiryHandler(handler: (() => void) | undefined) {
  sessionExpiryHandler = handler;
}

export function resetSessionExpiryNotification() {
  sessionExpiryNotified = false;
}

function notifySessionExpiry() {
  if (sessionExpiryNotified) return;
  sessionExpiryNotified = true;
  sessionExpiryHandler?.();
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

function messageFrom(body: unknown, fallback: string) {
  if (!body || typeof body !== 'object' || !('message' in body)) return fallback;
  const message = (body as { message?: unknown }).message;
  return Array.isArray(message) ? message.join(', ') : typeof message === 'string' ? message : fallback;
}

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
  if (!baseUrl) throw new Error('VITE_API_URL is not configured.');

  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const body = response.status === 204 ? undefined : await response.json().catch(() => undefined);

  if (!response.ok) {
    if (response.status === 401 && token) notifySessionExpiry();
    throw new ApiError(response.status, messageFrom(body, response.statusText || 'Request failed'));
  }
  return body as T;
}
