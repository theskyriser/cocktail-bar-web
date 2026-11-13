import { Link } from 'react-router';
import { ROUTES } from '@/app/routes';
import AppLogoIcon from '@/common/components/app-logo-icon';
import { Button } from '@/common/components/ui/button';
import { useDocumentTitle } from '@/common/hooks/use-document-title';
import { APP_NAME } from '@/common/lib/app-name';
import { useAuth } from '@/context.auth/hooks/use-auth';

export default function Welcome() {
    useDocumentTitle();
    const { isAuthenticated } = useAuth();

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background p-6">
            <div className="flex flex-col items-center gap-4 text-center">
                <AppLogoIcon className="size-12 fill-current text-primary" />
                <h1 className="text-3xl font-semibold tracking-tight">
                    {APP_NAME}
                </h1>
                <p className="max-w-md text-sm text-muted-foreground">
                    Tell it what you have on the shelf, and it works out what
                    you can pour.
                </p>
            </div>

            <div className="flex items-center gap-3">
                {isAuthenticated ? (
                    <Button asChild>
                        <Link to={ROUTES.dashboard}>Go to dashboard</Link>
                    </Button>
                ) : (
                    <>
                        <Button asChild>
                            <Link to={ROUTES.login}>Log in</Link>
                        </Button>
                        <Button asChild variant="secondary">
                            <Link to={ROUTES.register}>Create account</Link>
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
