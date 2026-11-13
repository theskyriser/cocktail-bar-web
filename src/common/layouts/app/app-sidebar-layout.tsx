import { AppContent } from '@/common/components/app-content';
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
            <AppContent variant="sidebar" className="min-w-0 overflow-x-clip">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
