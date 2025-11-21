import {
  BadRequestException,
  InternalServerErrorException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { FetchResourceCallback } from '@aehrc/sdc-populate';
import { ConfigService } from '@nestjs/config';
import { Bundle, FhirResource } from 'fhir/r4';
@Injectable()
export class FhirService {
  private readonly logger = new Logger(FhirService.name);
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string> = {
    Accept: 'application/fhir+json',
    'Content-Type': 'application/fhir+json',
  };

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('HAPI_FHIR_URL');
    if (!url) {
      throw new InternalServerErrorException('HAPI_FHIR_URL is not configured');
    }
    this.baseUrl = url.endsWith('/') ? url : `${url}/`;
  }

  private buildUrl(path: string, searchParams?: Record<string, any>): URL {
    // Support absolute URLs (e.g., Bundle.link[next]) and relative paths
    const url = path.startsWith('http')
      ? new URL(path)
      : new URL(path.replace(/^\/?/, ''), this.baseUrl);

    if (searchParams) {
      Object.entries(searchParams)
        .filter(([, v]) => v !== undefined && v !== null && `${v}`.length > 0)
        .forEach(([k, v]) => url.searchParams.set(k, String(v)));
    }
    return url;
  }

  private async handleResponse<T>(
    res: Response,
    urlForLog: string,
  ): Promise<T> {
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('json');

    if (res.ok) {
      if (res.status === 204) return undefined as unknown as T;
      return (isJson ? await res.json() : await res.text()) as T;
    }

    // Try to extract FHIR OperationOutcome when available
    let details: unknown = undefined;
    if (isJson) {
      try {
        details = (await res.json()) as unknown;
      } catch {
        // ignore parse error
      }
    } else {
      try {
        details = await res.text();
      } catch {
        // ignore
      }
    }

    const message = `FHIR request failed ${res.status} ${res.statusText} for ${urlForLog}`;
    this.logger.error(
      message,
      typeof details === 'string' ? details : JSON.stringify(details),
    );

    switch (res.status) {
      case 400:
      case 422:
        throw new BadRequestException(details ?? message);
      case 404:
        throw new NotFoundException(details ?? message);
      default:
        throw new InternalServerErrorException(details ?? message);
    }
  }

  private async request<T>(
    method: string,
    path: string,
    {
      headers,
      body,
      searchParams,
      signal,
    }: {
      headers?: Record<string, string>;
      body?: unknown;
      searchParams?: Record<string, any>;
      signal?: AbortSignal;
    } = {},
  ): Promise<T> {
    const url = this.buildUrl(path, searchParams);
    const reqHeaders: HeadersInit = {
      ...this.defaultHeaders,
      ...(headers || {}),
    };
    const init: RequestInit = {
      method,
      headers: reqHeaders,
      signal,
    };

    if (body !== undefined && method !== 'GET' && method !== 'HEAD') {
      init.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    this.logger.log(`FHIR ${method} ${url.toString()}`);
    const res = await fetch(url, init);
    this.logger.log(
      `FHIR <= ${res.status} ${res.statusText} ${url.toString()}`,
    );
    return this.handleResponse<T>(res, url.toString());
  }

  // Basic HTTP wrappers
  async get<T>(
    path: string,
    options?: {
      headers?: Record<string, string>;
      searchParams?: Record<string, any>;
      signal?: AbortSignal;
    },
  ): Promise<T> {
    return this.request<T>('GET', path, options);
  }

  async post<T>(
    path: string,
    data: any,
    options?: {
      headers?: Record<string, string>;
      searchParams?: Record<string, any>;
      signal?: AbortSignal;
    },
  ): Promise<T> {
    return this.request<T>('POST', path, { ...(options || {}), body: data });
  }

  async put<T>(
    path: string,
    data: any,
    options?: {
      headers?: Record<string, string>;
      searchParams?: Record<string, any>;
      signal?: AbortSignal;
    },
  ): Promise<T> {
    return this.request<T>('PUT', path, { ...(options || {}), body: data });
  }

  async patch<T>(
    path: string,
    data: any,
    options?: {
      headers?: Record<string, string>;
      searchParams?: Record<string, any>;
      signal?: AbortSignal;
    },
  ): Promise<T> {
    return this.request<T>('PATCH', path, { ...(options || {}), body: data });
  }

  async delete<T>(
    path: string,
    options?: {
      headers?: Record<string, string>;
      searchParams?: Record<string, any>;
      signal?: AbortSignal;
    },
  ): Promise<T> {
    return this.request<T>('DELETE', path, options);
  }

  // Lightweight FHIR helpers (optional to use by callers)
  async read<T extends { resourceType: string }>(
    resourceType: string,
    id: string,
  ) {
    return this.get<T>(`/${resourceType}/${encodeURIComponent(id)}`);
  }

  async create<T extends { resourceType: string }>(
    resourceType: string,
    resource: T,
  ) {
    return this.post<T>(`/${resourceType}`, resource);
  }

  async update<T extends { resourceType: string }>(
    resourceType: string,
    id: string,
    resource: T,
  ) {
    return this.put<T>(`/${resourceType}/${encodeURIComponent(id)}`, resource);
  }

  async deleteResource(resourceType: string, id: string) {
    return this.delete(`/${resourceType}/${encodeURIComponent(id)}`);
  }

  async search<T = any>(resourceType: string, params: Record<string, any>) {
    return this.get<T>(`/${resourceType}`, { searchParams: params });
  }

  async fetchNextPage<T = any>(bundle: unknown): Promise<T | null> {
    type FhirLink = { relation?: string; url?: string };

    if (!bundle || typeof bundle !== 'object') return null;

    const links = (bundle as { link?: unknown }).link;
    if (!Array.isArray(links)) return null;

    const isFhirLink = (l: unknown): l is FhirLink =>
      !!l &&
      typeof l === 'object' &&
      typeof (l as Record<string, unknown>).relation === 'string' &&
      typeof (l as Record<string, unknown>).url === 'string';

    const nextLink = links.find(isFhirLink);
    const next = nextLink?.url;
    return next ? this.get<T>(next) : null;
  }

  async submitTransaction(bundle: Bundle<FhirResource>) {
    return await this.post<Bundle<FhirResource>>('', bundle);
  }

  async fetchResourceCallback(query: string): Promise<FetchResourceCallback> {
    const headers: Record<string, string> = {
      Accept: 'application/json;charset=utf-8',
    };
    const ABSOLUTE_URL_REGEX = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
    const sourceServerUrl = this.baseUrl;
    const requestUrl = ABSOLUTE_URL_REGEX.test(query)
      ? query
      : `${sourceServerUrl}${query}`;
    const response = await fetch(requestUrl, {
      headers: headers,
    });
    if (!response.ok) {
      throw new Error(
        `HTTP error when performing ${requestUrl}. Status: ${response.status}`,
      );
    }
    return (await response.json()) as FetchResourceCallback;
  }
}
