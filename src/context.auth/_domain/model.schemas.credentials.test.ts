import { describe, expect, it } from 'vitest';
import {
    registerSchema,
    resetPasswordSchema,
} from './model.schemas.credentials';

const validRegistration = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'correct-horse',
    password_confirmation: 'correct-horse',
};

describe('registerSchema', () => {
    it('accepts a matching password pair', () => {
        expect(registerSchema.safeParse(validRegistration).success).toBe(true);
    });

    it('reports a mismatched confirmation against the confirmation field', () => {
        const result = registerSchema.safeParse({
            ...validRegistration,
            password_confirmation: 'something-else',
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.path).toEqual([
            'password_confirmation',
        ]);
    });

    it('rejects a password shorter than eight characters', () => {
        const result = registerSchema.safeParse({
            ...validRegistration,
            password: 'short',
            password_confirmation: 'short',
        });

        expect(result.success).toBe(false);
    });
});

describe('resetPasswordSchema', () => {
    it('requires a token', () => {
        const result = resetPasswordSchema.safeParse({
            ...validRegistration,
            token: '',
        });

        expect(result.success).toBe(false);
    });
});
