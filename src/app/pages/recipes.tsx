import { ROUTES } from '@/app/routes';
import Heading from '@/common/components/heading';
import { useDocumentTitle } from '@/common/hooks/use-document-title';
import AppLayout from '@/common/layouts/app-layout';

export default function Recipes() {
    useDocumentTitle('Recipes');

    return (
        <AppLayout breadcrumbs={[{ title: 'Recipes', href: ROUTES.recipes }]}>
            <div className="p-6">
                <Heading
                    title="Recipes"
                    description="Every drink in the book, with its ingredients and measures."
                />
            </div>
        </AppLayout>
    );
}
