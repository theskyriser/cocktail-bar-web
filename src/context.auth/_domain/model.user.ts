import type { TUser } from './model.parsers.user';

export function isEmailVerified(user: TUser): boolean {
    return user.emailVerifiedAt !== null;
}
