import { useQuery } from '@tanstack/react-query';
import type { TUser } from '@/context.auth/_domain/model.schemas.user';
import { getUser } from '@/context.auth/data/getUser';

export const AUTH_QUERY_KEY = ['auth', 'user'] as const;

export type UseAuthReturn = {
    user: TUser | null;
    isLoadingUser: boolean;
    isAuthenticated: boolean;
    isVerified: boolean;
};

export function useAuth(): UseAuthReturn {
    const { data, isPending } = useQuery({
        queryKey: AUTH_QUERY_KEY,
        queryFn: ({ signal }) => getUser({ signal }),
        staleTime: 5 * 60_000,
    });

    const user = data ?? null;

    return {
        user,
        isLoadingUser: isPending,
        isAuthenticated: !!user,
        isVerified: !!user?.emailVerifiedAt,
    };
}
