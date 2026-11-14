import { ROUTES } from '@/app/routes';
import Heading from '@/common/components/heading';
import { useDocumentTitle } from '@/common/hooks/use-document-title';
import AppLayout from '@/common/layouts/app-layout';

export default function Make() {
    useDocumentTitle('Make');

    return (
        <AppLayout breadcrumbs={[{ title: 'Make', href: ROUTES.make }]}>
            <div className="p-6">
                <Heading
                    title="Make"
                    description="Ready now, makeable with a substitution, and one bottle away."
                />
            </div>
        </AppLayout>
    );
}
