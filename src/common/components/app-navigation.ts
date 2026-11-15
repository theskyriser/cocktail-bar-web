import {
    BookOpen,
    FolderGit2,
    Martini,
    ScrollText,
    ShoppingCart,
    Wine,
} from 'lucide-react';
import { ROUTES } from '@/app/routes';
import type { NavItem } from '@/common/types';

export const mainNavItems: NavItem[] = [
    {
        title: 'Bar',
        href: ROUTES.bar,
        icon: Wine,
    },
    {
        title: 'Recipes',
        href: ROUTES.recipes,
        icon: ScrollText,
    },
    {
        title: 'Make',
        href: ROUTES.make,
        icon: Martini,
    },
    {
        title: 'Shop',
        href: ROUTES.shop,
        icon: ShoppingCart,
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
