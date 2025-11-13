import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error('Missing required API_URL environment variable');
}

export interface ApiError {
  message: string;
  error?: unknown; // sau khi parse json string thì để unknown/object
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

export async function fetcher<T>(url: string, init?: RequestInit): Promise<T> {
  const reqUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
  const session = await getSession();
  if (!session || !session.accessToken) {
    throw new Error('No authentication information provided');
  }
  const reqOption: RequestInit = {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...{ Authorization: `Bearer ${session.accessToken}` },
      'Content-Type': 'application/json',
      ...(session?.user?.fhir
        ? { 'X-Patient-ID': session.user.fhir?.patient ?? '' }
        : { 'X-Practitioner-ID': session.user.fhir?.practitioner ?? '' }),
    },
  };
  let res: Response;
  try {
    res = await fetch(reqUrl, reqOption);
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
