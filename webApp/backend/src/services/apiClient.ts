// ================================================================================
// ? Import 
// =====================================================================

import { NetworkError } from '../errors/NetworkError';

// =====================================================================

type JsonRequestInit = RequestInit & {
  timeoutMs?: number;
};

export type ApiClientJsonResponse<T> = {
  ok: boolean;
  status: number;
  data: T | null;
};


// =====================================================================

async function requestJson<T>(input: string, init?: JsonRequestInit): Promise<ApiClientJsonResponse<T>> {
  const timeoutMs = init?.timeoutMs ?? 8000;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Perform the HTTP request with a JSON Accept header, then attempt to parse the response body as JSON
    const res = await fetch(input, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init?.headers ?? {}),
      },
    });

    // If the response body is not valid JSON (or is empty), we fall back to `null`( to keep the return type stable)
    let data: T | null = null;
    try {
      data = (await res.json()) as T;
      
    } catch {
      data = null;
    }

    return { ok: res.ok, status: res.status, data };

  // --------------------------------
  } catch (err) {
    void err;
    throw new NetworkError();
  // --------------------------------
  } finally {
    clearTimeout(timeout);
  }
}


// =====================================================================

export const apiClient = {
  getJson: <T>(url: string, init?: JsonRequestInit) => requestJson<T>(url, { ...init, method: 'GET' }),
};

