import { SchemaError } from './errors';

type TExpect<T> = (input: unknown, field: string) => T;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function received(value: unknown): string {
    if (value === null) {
        return 'null';
    }

    if (Array.isArray(value)) {
        return 'an array';
    }

    return typeof value;
}

function fail(expected: string, field: string, value: unknown): never {
    throw new SchemaError(
        `Expected ${expected} at "${field}", received ${received(value)}`,
        value,
    );
}

export function expectRecord(
    input: unknown,
    field: string,
): Record<string, unknown> {
    if (!isRecord(input)) {
        fail('an object', field, input);
    }

    return input;
}

export function expectString(input: unknown, field: string): string {
    if (typeof input !== 'string') {
        fail('a string', field, input);
    }

    return input;
}

export function expectNumber(input: unknown, field: string): number {
    if (typeof input !== 'number' || !Number.isFinite(input)) {
        fail('a number', field, input);
    }

    return input;
}

export function expectBoolean(input: unknown, field: string): boolean {
    if (typeof input !== 'boolean') {
        fail('a boolean', field, input);
    }

    return input;
}

export function expectArray(input: unknown, field: string): unknown[] {
    if (!Array.isArray(input)) {
        fail('an array', field, input);
    }

    return input;
}

export function expectNullable<T>(
    input: unknown,
    field: string,
    expect: TExpect<T>,
): T | null {
    return input === null ? null : expect(input, field);
}

export function expectEach<T>(
    input: unknown,
    field: string,
    expect: TExpect<T>,
): T[] {
    return expectArray(input, field).map((item, index) =>
        expect(item, `${field}[${index}]`),
    );
}
