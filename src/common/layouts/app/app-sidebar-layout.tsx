import { AppBottomNav } from '@/common/components/app-bottom-nav';
import { AppContent } from '@/common/components/app-content';
import { mainNavItems } from '@/common/components/app-navigation';
import { AppShell } from '@/common/components/app-shell';
import { AppSidebar } from '@/common/components/app-sidebar';
import { AppSidebarHeader } from '@/common/components/app-sidebar-header';
import type { AppLayoutProps } from '@/common/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="min-w-0 overflow-x-clip pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0"
            >
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
            <AppBottomNav items={mainNavItems} />
        </AppShell>
    );
}
