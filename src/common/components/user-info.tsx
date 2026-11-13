import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/common/components/ui/avatar';
import { useInitials } from '@/common/hooks/use-initials';
import type { UserSummary } from '@/common/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: UserSummary;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                <AvatarFallback className="rounded-full bg-muted text-xs text-foreground">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}
