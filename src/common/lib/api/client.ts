import type { ZodType, output } from 'zod';
import { API_ENDPOINTS } from './endpoints';
import { ApiError, UnauthenticatedError, ValidationError } from './errors';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const CSRF_COOKIE = 'XSRF-TOKEN';

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const CSRF_MISMATCH_STATUS = 419;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type FetchApiOptions<TSchema extends ZodType> = {
    method?: HttpMethod;
    body?: unknown;
    schema?: TSchema;
    signal?: AbortSignal;
};

function readCookie(name: string): string | null {
    const match = document.cookie.match(
        new RegExp(`(?:^|;\\s*)${name}=([^;]*)`),
    );

    return match?.[1] ? decodeURIComponent(match[1]) : null;
}

let pendingCsrfCookie: Promise<void> | null = null;

async function requestCsrfCookie(): Promise<void> {
    pendingCsrfCookie ??= fetch(`${API_URL}${API_ENDPOINTS.csrfCookie}`, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
    })
        .then((response) => {
            if (!response.ok) {
                throw new ApiError(
                    'Could not obtain a CSRF cookie from the API.',
                    response.status,
                );
            }
        })
        .finally(() => {
            pendingCsrfCookie = null;
        });

    return pendingCsrfCookie;
}

async function ensureCsrfCookie(): Promise<void> {
    if (readCookie(CSRF_COOKIE)) {
        return;
    }

    await requestCsrfCookie();
}

function buildHeaders(body: unknown): Headers {
    const headers = new Headers({
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    });

    if (body !== undefined && !(body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    const token = readCookie(CSRF_COOKIE);

    if (token) {
        headers.set('X-XSRF-TOKEN', token);
    }

    return headers;
}

function serialiseBody(body: unknown): BodyInit | undefined {
    if (body === undefined) {
        return undefined;
    }

    return body instanceof FormData ? body : JSON.stringify(body);
}

async function readPayload(response: Response): Promise<unknown> {
    if (
        response.status === 204 ||
        response.headers.get('Content-Length') === '0'
    ) {
        return null;
    }

    const contentType = response.headers.get('Content-Type') ?? '';

    if (!contentType.includes('json')) {
        return await response.text();
    }

    try {
        return await response.json();
    } catch {
        return null;
    }
}

function messageFrom(payload: unknown, fallback: string): string {
    if (
        typeof payload === 'object' &&
        payload !== null &&
        'message' in payload &&
        typeof payload.message === 'string' &&
        !!payload.message
    ) {
        return payload.message;
    }

    return fallback;
}

function errorsFrom(payload: unknown): Record<string, string[]> {
    if (
        typeof payload === 'object' &&
        payload !== null &&
        'errors' in payload &&
        typeof payload.errors === 'object' &&
        payload.errors !== null
    ) {
        return payload.errors as Record<string, string[]>;
    }

    return {};
}

function throwForStatus(response: Response, payload: unknown): never {
    if (response.status === 422) {
        throw new ValidationError(
            messageFrom(payload, 'The given data was invalid.'),
            errorsFrom(payload),
            payload,
        );
    }

    if (response.status === 401) {
        throw new UnauthenticatedError(
            messageFrom(payload, 'Unauthenticated.'),
            payload,
        );
    }

    throw new ApiError(
        messageFrom(payload, `Request failed with status ${response.status}.`),
        response.status,
        payload,
    );
}

async function send(
    path: string,
    method: HttpMethod,
    body: unknown,
    signal?: AbortSignal,
): Promise<Response> {
    return await fetch(`${API_URL}${path}`, {
        method,
        credentials: 'include',
        headers: buildHeaders(body),
        body: serialiseBody(body),
        signal,
    });
}

export async function fetchApi<TSchema extends ZodType>(
    path: string,
    options: FetchApiOptions<TSchema> & { schema: TSchema },
): Promise<output<TSchema>>;
export async function fetchApi(
    path: string,
    options?: FetchApiOptions<ZodType>,
): Promise<null>;
export async function fetchApi<TSchema extends ZodType>(
    path: string,
    options: FetchApiOptions<TSchema> = {},
): Promise<output<TSchema> | null> {
    const { method = 'GET', body, schema, signal } = options;

    if (UNSAFE_METHODS.has(method)) {
        await ensureCsrfCookie();
    }

    let response = await send(path, method, body, signal);

    if (response.status === CSRF_MISMATCH_STATUS) {
        await requestCsrfCookie();
        response = await send(path, method, body, signal);
    }

    const payload = await readPayload(response);

    if (!response.ok) {
        throwForStatus(response, payload);
    }

    if (!schema) {
        return null;
    }

    return schema.parse(payload);
}
