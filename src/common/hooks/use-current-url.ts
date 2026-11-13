import { useLocation } from 'react-router';

export type UseCurrentUrlReturn = {
    currentUrl: string;
    isCurrentUrl: (url: string) => boolean;
    isCurrentOrParentUrl: (url: string) => boolean;
    whenCurrentUrl: <TIfTrue, TIfFalse = null>(
        url: string,
        ifTrue: TIfTrue,
        ifFalse?: TIfFalse,
    ) => TIfTrue | TIfFalse;
};

export function useCurrentUrl(): UseCurrentUrlReturn {
    const { pathname } = useLocation();

    const isCurrentUrl = (url: string): boolean => url === pathname;

    const isCurrentOrParentUrl = (url: string): boolean =>
        pathname.startsWith(url);

    const whenCurrentUrl = <TIfTrue, TIfFalse = null>(
        url: string,
        ifTrue: TIfTrue,
        ifFalse: TIfFalse = null as TIfFalse,
    ): TIfTrue | TIfFalse => (isCurrentUrl(url) ? ifTrue : ifFalse);

    return {
        currentUrl: pathname,
        isCurrentUrl,
        isCurrentOrParentUrl,
        whenCurrentUrl,
    };
}
