import { useQuery } from '@tanstack/react-query';
import { getBar } from '../data/getBar';
import { TBar } from '../_domain/model.bar';

export const BAR_QUERY_KEY = ['bar'] as const;

type TUseGetBar = {
    bar: TBar | null;
    isPending: boolean;
    isError: boolean;
};

export function useGetBar(): TUseGetBar {
    const { data, isPending, isError } = useQuery({
        queryKey: BAR_QUERY_KEY,
        queryFn: ({ signal }) => getBar({ signal }),
    });

    const bar = data ?? null;

    return {
        bar,
        isPending,
        isError,
    };
}
