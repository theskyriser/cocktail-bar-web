import type {
    TUser,
    TUserType,
} from '@/context.auth/_domain/model.schemas.user';

export function userAdapter(user: TUserType): TUser {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? null,
        emailVerifiedAt: user.email_verified_at
            ? new Date(user.email_verified_at)
            : null,
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at),
    };
}
