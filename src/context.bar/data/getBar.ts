import { isUnauthenticatedError } from '@/common/lib/api/errors';
import { TBar } from '../_domain/model.bar';
import { fetchApi } from '@/common/lib/api/client';
import { API_ENDPOINTS } from '@/common/lib/api/endpoints';
import { parseBar } from '../_domain/model.parsers.bar';
import { barAdapter } from './bar.adapter';

export async function getBar(opts: {
    signal?: AbortSignal;
}): Promise<TBar | null> {
    try {
        const bar = await fetchApi(API_ENDPOINTS.bar, {
            parse: parseBar,
            signal: opts.signal,
        });

        return barAdapter(bar);
    } catch (error) {
        if (isUnauthenticatedError(error)) {
            return null;
        }

        throw error;
    }
}
