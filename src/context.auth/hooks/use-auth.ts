import { useQuery } from '@tanstack/react-query';
import { isEmailVerified } from '@/context.auth/_domain/model.user';
import type { TUser } from '@/context.auth/_domain/model.parsers.user';
import { getUser } from '@/context.auth/data/getUser';

export const AUTH_QUERY_KEY = ['auth', 'user'] as const;

type TUseAuth = {
    user: TUser | null;
    isAuthenticated: boolean;
    isLoadingUser: boolean;
    isVerified: boolean;
};

export function useAuth(): TUseAuth {
    const { data, isPending } = useQuery({
        queryKey: AUTH_QUERY_KEY,
        queryFn: ({ signal }) => getUser({ signal }),
    });

    const user = data ?? null;

    return {
        user,
        isAuthenticated: user !== null,
        isLoadingUser: isPending,
        isVerified: user !== null && isEmailVerified(user),
    };
}
