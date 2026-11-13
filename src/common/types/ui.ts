import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '@/common/types/navigation';

export type AppLayoutProps = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

export type AppVariant = 'header' | 'sidebar';

export type AuthLayoutProps = {
    children?: ReactNode;
    name?: string;
    title?: string;
    description?: string;
};

export type UserSummary = {
    name: string;
    email: string;
    avatar?: string | null;
};
