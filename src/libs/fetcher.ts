import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error('Missing required API_URL environment variable');
}

export interface ApiError {
  message: string;
  error?: unknown;
  statusCode: number;
}

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
  }
}

const parseErrorField = (err: unknown): unknown => {
  if (typeof err !== 'string') return err;

  try {
    return JSON.parse(err);
  } catch {
    return err;
  }
};

// ⚠️ CHỈ SỬ DỤNG HÀM NÀY – KHÔNG DÙNG requestContentType như bản cũ nữa
const getHeader = (
  headers: HeadersInit | undefined | Headers,
  key: string
): string | undefined => {
  if (!headers) return undefined;
  if (headers instanceof Headers) return headers.get(key) ?? undefined;
  if (Array.isArray(headers)) {
    const found = headers.find(([k]) => k.toLowerCase() === key.toLowerCase());
    return found ? found[1] : undefined;
  }
  const record = headers as Record<string, string>;
  return record[key] ?? record[key.toLowerCase()];
};

export async function fetcher<T>(
  url: string,
  init: RequestInit = {}
): Promise<T> {
  const reqUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
  const session = await getSession();
  if (!session || !session.accessToken) {
    throw new Error('No authentication information provided');
  }

  const isFormData = init.body instanceof FormData;

  // Bắt đầu từ headers gốc (nếu có)
  const headers = new Headers(init.headers || {});

  // ❗ Chỉ set Content-Type mặc định nếu KHÔNG phải FormData
  if (!isFormData && !getHeader(headers, 'Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Auth + FHIR headers
  headers.set('Authorization', `Bearer ${session.accessToken}`);
  if (session?.user?.fhir?.patient) {
    headers.set('X-Patient-ID', session.user.fhir.patient ?? '');
  } else if (session?.user?.fhir?.practitioner) {
    headers.set('X-Practitioner-ID', session.user.fhir.practitioner ?? '');
  }

  let res: Response;
  try {
    res = await fetch(reqUrl, {
      ...init,
      headers,
    });
  } catch (error) {
    const apiError: ApiError = {
      message: 'Network error or server not reachable',
      statusCode: 0,
      error: error,
    };
    throw apiError;
  }

  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  const body = isJson ? await res.json().catch(() => undefined) : undefined;

  if (!res.ok) {
    const raw = (body ?? {}) as Partial<ApiError>;

    const apiError: ApiError = {
      message: raw.message ?? 'Unknown error',
      statusCode: raw.statusCode ?? res.status,
      error: parseErrorField(raw.error),
    };

    throw apiError;
  }

  return body as T;
}
