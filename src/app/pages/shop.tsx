import { ROUTES } from '@/app/routes';
import Heading from '@/common/components/heading';
import { useDocumentTitle } from '@/common/hooks/use-document-title';
import AppLayout from '@/common/layouts/app-layout';

export default function Shop() {
    useDocumentTitle('Shopping list');

    return (
        <AppLayout breadcrumbs={[{ title: 'Shop', href: ROUTES.shop }]}>
            <div className="p-6">
                <Heading
                    title="Shopping list"
                    description="What to buy next, ranked by how many drinks it unlocks."
                />
            </div>
        </AppLayout>
    );
}
