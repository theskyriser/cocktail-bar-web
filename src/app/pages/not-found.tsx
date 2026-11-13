import { Link } from 'react-router';
import { ROUTES } from '@/app/routes';
import { Button } from '@/common/components/ui/button';
import { useDocumentTitle } from '@/common/hooks/use-document-title';

export default function NotFound() {
    useDocumentTitle('Not found');

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 text-center">
            <div className="space-y-2">
                <p className="kicker">404</p>
                <h1 className="text-2xl font-semibold tracking-tight">
                    That page does not exist
                </h1>
            </div>
            <Button asChild variant="secondary">
                <Link to={ROUTES.home}>Back to the bar</Link>
            </Button>
        </div>
    );
}
