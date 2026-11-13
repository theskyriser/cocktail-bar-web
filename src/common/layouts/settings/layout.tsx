import type { PropsWithChildren } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '@/app/routes';
import Heading from '@/common/components/heading';
import { Button } from '@/common/components/ui/button';
import { Separator } from '@/common/components/ui/separator';
import { useCurrentUrl } from '@/common/hooks/use-current-url';
import { cn } from '@/common/lib/utils';
import type { NavItem } from '@/common/types';

const sidebarNavItems: NavItem[] = [
    { title: 'Profile', href: ROUTES.settings.profile, icon: null },
    { title: 'Security', href: ROUTES.settings.security, icon: null },
    { title: 'Appearance', href: ROUTES.settings.appearance, icon: null },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="px-4 py-6">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav
                        className="flex flex-col space-y-1 space-x-0"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item) => (
                            <Button
                                key={item.href}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isCurrentOrParentUrl(item.href),
                                })}
                            >
                                <Link to={item.href}>
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
