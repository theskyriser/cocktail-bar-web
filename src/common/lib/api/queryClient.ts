import { QueryClient } from '@tanstack/react-query';

const MAX_RETRIES = 2;

export function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30_000,
                refetchOnWindowFocus: false,
                retry: (failureCount, error) => {
                    if (error) {
                    }
                    return failureCount > MAX_RETRIES;
                },
            },
            mutations: {
                retry: false,
            },
        },
    });
}
