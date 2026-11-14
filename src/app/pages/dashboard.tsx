import { ROUTES } from '@/app/routes';
import { UserInfo } from '@/common/components/user-info';
import { useDocumentTitle } from '@/common/hooks/use-document-title';
import AppLayout from '@/common/layouts/app-layout';
import LogoutButton from '@/context.auth/components/logout-button';
import { useAuth } from '@/context.auth/hooks/use-auth';

export default function Dashboard() {
    useDocumentTitle('Dashboard');

    const { user, isLoadingUser } = useAuth();

    return (
        <AppLayout
            breadcrumbs={[{ title: 'Dashboard', href: ROUTES.dashboard }]}
        >
            <div className="flex flex-col gap-6 p-6">
                <header className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <p className="kicker">Dashboard</p>
                        <h1 className="font-heading text-2xl font-semibold tracking-tight">
                            {user
                                ? `Welcome back, ${user.name}`
                                : 'Welcome back'}
                        </h1>
                    </div>
                    <LogoutButton />
                </header>

                <section className="flex min-h-14 items-center gap-3 rounded-md border border-border p-4">
                    {user ? (
                        <UserInfo user={user} showEmail />
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {isLoadingUser
                                ? 'Checking your session'
                                : 'You are not signed in'}
                        </p>
                    )}
                </section>

                <section>
                    <p className="text-muted-foreground">
                        Nothing on the shelf yet. Your stock and the cocktails
                        it unlocks will land here.
                    </p>
                </section>
            </div>
        </AppLayout>
    );
}
