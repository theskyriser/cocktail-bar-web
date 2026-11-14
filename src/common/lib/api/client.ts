import {
    ApiError,
    errorsFrom,
    UnauthenticatedError,
    ValidationError,
} from './errors';
import { API_ENDPOINTS } from './endpoints';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:80';

const CSRF_COOKIE = 'XSRF-TOKEN';

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const CSRF_MISMATCH_STATUS = 419;

type THttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type TFetchApiOptions<TSchema> = {
    method?: THttpMethod;
    body?: unknown;
    signal?: AbortSignal;
    parse?: (input: unknown) => TSchema;
};

function readCookie(name: string): string | null {
    const match = document.cookie.match(
        new RegExp(`(?:^|;\\s*)${name}=([^;]*)`),
    );

    return match?.[1] ? decodeURIComponent(match[1]) : null;
}

let pendingCsrfCookie: Promise<void> | null = null;

async function ensureCsrfCookie(): Promise<void> {
    if (readCookie(CSRF_COOKIE)) {
        //don't fetch again
        return;
    }

    await requestCsrfCookie();
}

//get csrf if it doesn't exist
async function requestCsrfCookie(): Promise<void> {
    pendingCsrfCookie ??= fetch(`${API_URL}${API_ENDPOINTS.csrfCookie}`, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
    })
        .then((response) => {
            if (!response.ok) {
                throw new ApiError(
                    'Could not read CSRF Cookie',
                    response.status,
                );
            }
        })
        .finally(() => {
            pendingCsrfCookie = null;
        });

    return pendingCsrfCookie;
}

function serialiseBody(body: unknown): BodyInit | undefined {
    if (body === undefined) {
        return undefined;
    }

    //then form data data and serialise
    return body instanceof FormData ? body : JSON.stringify(body);
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

async function send(
    path: string,
    method: THttpMethod,
    body: unknown,
    signal?: AbortSignal,
): Promise<Response> {
    return await fetch(`${API_URL}${path}`, {
        body: serialiseBody(body),
        method: method,
        credentials: 'include',
        headers: buildHeaders(body),
        signal,
    });
}

//type 1 - we parse, and so force it to return TSchema using the parser
export async function fetchApi<TSchema>(
    path: string,
    options: TFetchApiOptions<TSchema> & { parse: (input: unknown) => TSchema },
): Promise<TSchema>;

//type 2 - we have no parse, so it can return null
export async function fetchApi<_TSchema>(
    path: string,
    options: Omit<TFetchApiOptions<never>, 'parse'>,
): Promise<null>;

export async function fetchApi<TSchema>(
    path: string,
    options: TFetchApiOptions<TSchema>,
): Promise<TSchema | null> {
    const { method = 'GET', body, parse, signal } = options;

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
        toApiError(response, payload);
    }

    if (!parse) {
        return null;
    }

    return parse(payload);
}

function toApiError(response: Response, payload: unknown): never {
    if (response.status === 422) {
        const errors = errorsFrom(payload);
        throw new ValidationError('Validation Error', errors, payload);
    }

    if (response.status === 401) {
        throw new UnauthenticatedError('Unauthenticated', payload);
    }

    throw new ApiError('Internal Server Error', response.status, payload);
}
