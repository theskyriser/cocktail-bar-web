import { ChevronsUpDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/common/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/common/components/ui/sidebar';
import { UserInfo } from '@/common/components/user-info';
import { useIsMobile } from '@/common/hooks/use-mobile';
import { UserMenuContent } from '@/context.auth/components/user-menu-content';
import { useAuth } from '@/context.auth/hooks/use-auth';

export function NavUser() {
    const { user } = useAuth();
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    if (!user) {
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
                            data-test="sidebar-menu-button"
                        >
                            <UserInfo user={user} />
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                  ? 'left'
                                  : 'bottom'
                        }
                    >
                        <UserMenuContent user={user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
