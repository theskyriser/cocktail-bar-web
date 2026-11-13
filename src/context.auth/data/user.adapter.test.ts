import { describe, expect, it } from 'vitest';
import type { TUserType } from '@/context.auth/_domain/model.schemas.user';
import { userAdapter } from './user.adapter';

const apiUser: TUserType = {
    id: 7,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    avatar: null,
    email_verified_at: '2026-11-01T09:30:00.000000Z',
    created_at: '2026-10-01T09:30:00.000000Z',
    updated_at: '2026-11-02T09:30:00.000000Z',
};

describe('userAdapter', () => {
    it('converts API timestamps into Date objects', () => {
        const user = userAdapter(apiUser);

        expect(user.emailVerifiedAt).toEqual(
            new Date('2026-11-01T09:30:00.000000Z'),
        );
        expect(user.createdAt).toEqual(new Date('2026-10-01T09:30:00.000000Z'));
        expect(user.updatedAt).toEqual(new Date('2026-11-02T09:30:00.000000Z'));
    });

    it('leaves an unverified email address as null rather than an invalid date', () => {
        const user = userAdapter({ ...apiUser, email_verified_at: null });

        expect(user.emailVerifiedAt).toBeNull();
    });

    it('normalises a missing avatar to null', () => {
        const user = userAdapter({ ...apiUser, avatar: undefined });

        expect(user.avatar).toBeNull();
    });
});
