import { ROUTES } from '@/app/routes';
import Heading from '@/common/components/heading';
import { useDocumentTitle } from '@/common/hooks/use-document-title';
import AppLayout from '@/common/layouts/app-layout';

export default function Bar() {
    useDocumentTitle('My Bar');

    return (
        <AppLayout breadcrumbs={[{ title: 'My Bar', href: ROUTES.bar }]}>
            <div className="p-6">
                <Heading
                    title="My Bar"
                    description="What is on the shelf, how much is left, and what is running low."
                />
            </div>
        </AppLayout>
    );
}
