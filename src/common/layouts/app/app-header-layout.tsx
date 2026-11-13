import { AppContent } from '@/common/components/app-content';
import { AppHeader } from '@/common/components/app-header';
import { AppShell } from '@/common/components/app-shell';
import type { AppLayoutProps } from '@/common/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    return (
        <AppShell variant="header">
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent variant="header">{children}</AppContent>
        </AppShell>
    );
}
