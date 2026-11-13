import { LogOut, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { ROUTES } from '@/app/routes';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/common/components/ui/dropdown-menu';
import { UserInfo } from '@/common/components/user-info';
import { useMobileNavigation } from '@/common/hooks/use-mobile-navigation';
import type { UserSummary } from '@/common/types';
import { useLogout } from '@/context.auth/hooks/use-logout';

type Props = {
    user: UserSummary;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const navigate = useNavigate();
    const { logOut, isLoggingOut } = useLogout({
        onSuccess: () => void navigate(ROUTES.login, { replace: true }),
    });

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        to={ROUTES.settings.profile}
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                disabled={isLoggingOut}
                onSelect={() => {
                    cleanup();
                    void logOut();
                }}
                className="cursor-pointer"
                data-test="logout-button"
            >
                <LogOut className="mr-2" />
                Log out
            </DropdownMenuItem>
        </>
    );
}
