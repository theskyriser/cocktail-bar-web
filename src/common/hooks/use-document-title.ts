import { useEffect } from 'react';
import { APP_NAME } from '@/common/lib/app-name';

export function useDocumentTitle(title?: string): void {
    useEffect(() => {
        document.title = title ? `${title} - ${APP_NAME}` : APP_NAME;
    }, [title]);
}
