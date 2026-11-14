import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Toaster } from '@/common/components/ui/sonner';
import { TooltipProvider } from '@/common/components/ui/tooltip';

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider delayDuration={0}>
                {children}
                <Toaster />
            </TooltipProvider>
        </QueryClientProvider>
    );
}
