export class ApiError extends Error {
    readonly status: number;

    readonly payload: unknown;

    constructor(message: string, status: number, payload: unknown = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.payload = payload;
    }
}

export class ValidationError extends ApiError {
    readonly errors: Record<string, string[]>;

    constructor(
        message: string,
        errors: Record<string, string[]>,
        payload: unknown = null,
    ) {
        super(message, 422, payload);
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

export class UnauthenticatedError extends ApiError {
    constructor(message = 'Unauthenticated.', payload: unknown = null) {
        super(message, 401, payload);
        this.name = 'UnauthenticatedError';
    }
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

export function isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
}

export function isUnauthenticatedError(
    error: unknown,
): error is UnauthenticatedError {
    return error instanceof UnauthenticatedError;
}
