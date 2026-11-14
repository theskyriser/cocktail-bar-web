import { BookOpen, FolderGit2, LayoutGrid } from 'lucide-react';
import { ROUTES } from '@/app/routes';
import type { NavItem } from '@/common/types';

export const mainNavItems: NavItem[] = [
    {
        title: 'Home',
        href: ROUTES.home,
        icon: LayoutGrid,
    },
];

export const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/theskyriser/cocktail-bar-web',
        icon: FolderGit2,
        isExternal: true,
    },
    {
        title: 'API',
        href: 'https://github.com/theskyriser/cocktail-bar-api',
        icon: BookOpen,
        isExternal: true,
    },
];
