import { Link } from 'react-router';
import { ROUTES } from '@/app/routes';
import { useCurrentUrl } from '@/common/hooks/use-current-url';
import { cn } from '@/common/lib/utils';
import type { NavItem } from '@/common/types';

export function AppBottomNav({ items }: { items: NavItem[] }) {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <nav
            aria-label="Primary"
            className="fixed inset-x-0 bottom-0 z-30 border-t border-sidebar-border bg-sidebar pb-[env(safe-area-inset-bottom)] md:hidden"
        >
            <ul className="flex items-stretch">
                {items.map((item) => {
                    const isActive =
                        item.href === ROUTES.home
                            ? isCurrentUrl(item.href)
                            : isCurrentOrParentUrl(item.href);

                    return (
                        <li key={item.title} className="flex-1">
                            <Link
                                to={item.href}
                                aria-current={isActive ? 'page' : undefined}
                                className={cn(
                                    'flex h-16 flex-col items-center justify-center gap-1 text-xs transition-colors',
                                    isActive
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {item.icon && <item.icon className="size-5" />}
                                <span
                                    className={cn(
                                        'border-b-[1.5px] border-transparent pb-0.5 leading-none',
                                        isActive && 'border-primary',
                                    )}
                                >
                                    {item.title}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
