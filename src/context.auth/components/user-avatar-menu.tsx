import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/common/components/ui/avatar';
import { Button } from '@/common/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/common/components/ui/dropdown-menu';
import { useInitials } from '@/common/hooks/use-initials';
import { UserMenuContent } from '@/context.auth/components/user-menu-content';
import { useAuth } from '@/context.auth/hooks/use-auth';

export function UserAvatarMenu() {
    const { user } = useAuth();
    const getInitials = useInitials();

    if (!user) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-10 rounded-full p-1">
                    <Avatar className="size-8 overflow-hidden rounded-full">
                        <AvatarImage
                            src={user.avatar ?? undefined}
                            alt={user.name}
                        />
                        <AvatarFallback className="rounded-full bg-muted text-xs text-foreground">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <UserMenuContent user={user} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
