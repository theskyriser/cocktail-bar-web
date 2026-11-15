import { describe, expect, it } from 'vite-plus/test';
import { parseBar } from './model.parsers.bar';
import { SchemaError } from '@/common/lib/api/errors';
import { makeBarPayload, makeCategoryPayload } from '../__fixtures/bar.fixture';

describe('parseBar', () => {
    it('returns a parsed bar for a well-formed payload', () => {
        const payload = makeBarPayload();
        const result = parseBar(payload);
        expect(result).toEqual(payload);
    });

    it('throws when categories is missing', () => {
        const payload = makeBarPayload({ bar: { categories: undefined } });

        let error: unknown;
        try {
            parseBar(payload);
        } catch (e) {
            error = e;
        }
        expect(error).toBeInstanceOf(SchemaError);
        expect((error as SchemaError).message).toContain('categories');
    });

    it('throws when an item amount is a string', () => {
        const payload = makeBarPayload({ item: { amount: '700' } });
        let error: unknown;
        try {
            parseBar(payload);
        } catch (e) {
            error = e;
        }
        expect(error).toBeInstanceOf(SchemaError);
        expect((error as SchemaError).message).toContain('amount');
        expect((error as SchemaError).message).toContain('string');
    });

    it('accepts a null bottle_size', () => {
        const payload = makeBarPayload({ item: { bottle_size: null } });
        const result = parseBar(payload);
        expect(result).toEqual(payload);
    });

    it('accepts a null pecentage_filled', () => {
        const payload = makeBarPayload({ item: { percentage_filled: null } });
        const result = parseBar(payload);
        expect(result).toEqual(payload);
    });

    it('throws when percentage_filled is a string', () => {
        const payload = makeBarPayload({ item: { percentage_filled: '0.5' } });
        let error: unknown;
        try {
            parseBar(payload);
        } catch (e) {
            error = e;
        }
        expect(error).toBeInstanceOf(SchemaError);
        expect((error as SchemaError).message).toContain('percentage_filled');
        expect((error as SchemaError).message).toContain('string');
    });

    it('ignores unknown fields the API adds', () => {
        const payload = makeBarPayload({ item: { malformed: '0.5' } });
        const original = makeBarPayload();
        const result = parseBar(payload);

        expect(result).toEqual(original);
    });

    it('throws a malformed payload', () => {
        const payload = makeBarPayload({
            bar: {
                categories: [
                    makeCategoryPayload({ id: 1, name: 'Gin' }),
                    makeCategoryPayload(
                        { id: 2, name: 'Rum' },
                        { id: 2, name: 1 },
                    ),
                ],
            },
        });
        let error: unknown;
        try {
            parseBar(payload);
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(SchemaError);
        expect((error as SchemaError).message).toContain(
            'bar.categories[1].items[0].name',
        );
        expect((error as SchemaError).message).toContain('number');
    });
});
