import type { ReactNode } from 'react';
import { SidebarProvider } from '@/common/components/ui/sidebar';
import type { AppVariant } from '@/common/types';

const SIDEBAR_STATE_KEY = 'sidebar-open';

function readStoredSidebarState(): boolean {
    try {
        return localStorage.getItem(SIDEBAR_STATE_KEY) !== 'false';
    } catch {
        return true;
    }
}

function storeSidebarState(open: boolean): void {
    try {
        localStorage.setItem(SIDEBAR_STATE_KEY, String(open));
    } catch {
        // Nothing to do: the sidebar simply reopens on the next visit.
    }
}

type Props = {
    children: ReactNode;
    variant?: AppVariant;
};

export function AppShell({ children, variant = 'sidebar' }: Props) {
    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    return (
        <SidebarProvider
            defaultOpen={readStoredSidebarState()}
            onOpenChange={storeSidebarState}
        >
            {children}
        </SidebarProvider>
    );
}
