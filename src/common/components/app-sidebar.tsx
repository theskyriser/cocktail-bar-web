import { Link } from 'react-router';
import { ROUTES } from '@/app/routes';
import AppLogo from '@/common/components/app-logo';
import {
    footerNavItems,
    mainNavItems,
} from '@/common/components/app-navigation';
import { NavFooter } from '@/common/components/nav-footer';
import { NavMain } from '@/common/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/common/components/ui/sidebar';
import { NavUser } from '@/context.auth/components/nav-user';

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to={ROUTES.dashboard}>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
