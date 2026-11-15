import { ROUTES } from '@/app/routes';
import Heading from '@/common/components/heading';
import { Button } from '@/common/components/ui/button';
import { useDocumentTitle } from '@/common/hooks/use-document-title';
import AppLayout from '@/common/layouts/app-layout';
import BarList from '@/context.bar/components/bar-list';

export default function Bar() {
    useDocumentTitle('My Bar');

    return (
        <AppLayout breadcrumbs={[{ title: 'My Bar', href: ROUTES.bar }]}>
            <div className="px-6 pt-6">
                <div className="flex">
                    <Heading
                        title="My Bar"
                        description="What is on the shelf, how much is left, and what is running low."
                    />
                    <Button>Add</Button>
                </div>

                <BarList />
            </div>
        </AppLayout>
    );
}
