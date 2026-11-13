import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { Providers } from '@/app/providers';
import { router } from '@/app/router';
import { Spinner } from '@/common/components/ui/spinner';
import { initializeTheme } from '@/common/hooks/use-appearance';
import '@/common/styles/app.css';

const container = document.getElementById('root');

if (!container) {
    throw new Error('Missing #root element in index.html');
}

createRoot(container).render(
    <StrictMode>
        <Providers>
            <Suspense
                fallback={
                    <div className="flex min-h-svh items-center justify-center">
                        <Spinner className="size-6" />
                    </div>
                }
            >
                <RouterProvider router={router} />
            </Suspense>
        </Providers>
    </StrictMode>,
);

initializeTheme();
