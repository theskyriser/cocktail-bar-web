import { SchemaError } from '@/common/lib/api/errors';
import type {
    TUser,
    TUserType,
} from '@/context.auth/_domain/model.parsers.user';

function toDate(value: string, field: string): Date {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw new SchemaError(
            `Expected an ISO date string at "${field}"`,
            value,
        );
    }

    return date;
}

export function userAdapter(input: TUserType): TUser {
    return {
        id: input.id,
        name: input.name,
        email: input.email,
        emailVerifiedAt:
            input.email_verified_at === null
                ? null
                : toDate(input.email_verified_at, 'email_verified_at'),
        createdAt: toDate(input.created_at, 'created_at'),
        updatedAt: toDate(input.updated_at, 'updated_at'),
    };
}
