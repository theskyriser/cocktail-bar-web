import { useQuery } from '@tanstack/react-query';
import type { TAuthConfig } from '@/context.auth/_domain/model.schemas.auth-config';
import { fallbackAuthConfig } from '@/context.auth/_domain/model.schemas.auth-config';
import { getAuthConfig } from '@/context.auth/data/getAuthConfig';

export const AUTH_CONFIG_QUERY_KEY = ['auth', 'config'] as const;

export function useAuthConfig(): { authConfig: TAuthConfig } {
    const { data } = useQuery({
        queryKey: AUTH_CONFIG_QUERY_KEY,
        queryFn: ({ signal }) => getAuthConfig({ signal }),
        staleTime: Infinity,
    });

    return { authConfig: data ?? fallbackAuthConfig };
}
