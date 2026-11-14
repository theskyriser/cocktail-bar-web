import {
    expectNullable,
    expectNumber,
    expectRecord,
    expectString,
} from '@/common/lib/api/parse';

export type TUserType = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
};

export type TUser = {
    id: number;
    name: string;
    email: string;
    emailVerifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export function parseUser(input: unknown): TUserType {
    const user = expectRecord(input, 'user');

    return {
        id: expectNumber(user.id, 'id'),
        name: expectString(user.name, 'name'),
        email: expectString(user.email, 'email'),
        email_verified_at: expectNullable(
            user.email_verified_at,
            'email_verified_at',
            expectString,
        ),
        created_at: expectString(user.created_at, 'created_at'),
        updated_at: expectString(user.updated_at, 'updated_at'),
    };
}
