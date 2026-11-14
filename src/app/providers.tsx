import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Toaster } from '@/common/components/ui/sonner';
import { TooltipProvider } from '@/common/components/ui/tooltip';
import { createQueryClient } from '@/common/lib/api/queryClient';

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => createQueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider delayDuration={0}>
                {children}
                <Toaster />
            </TooltipProvider>
        </QueryClientProvider>
    );
}
