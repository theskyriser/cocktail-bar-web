import type { ReactNode } from 'react';
import AppLayoutTemplate from '@/common/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/common/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: ReactNode;
}) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
        </AppLayoutTemplate>
    );
}
