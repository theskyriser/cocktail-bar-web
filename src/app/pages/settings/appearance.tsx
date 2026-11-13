import { ROUTES } from '@/app/routes';
import AppearanceTabs from '@/common/components/appearance-tabs';
import Heading from '@/common/components/heading';
import { useDocumentTitle } from '@/common/hooks/use-document-title';
import AppLayout from '@/common/layouts/app-layout';
import SettingsLayout from '@/common/layouts/settings/layout';
import type { BreadcrumbItem } from '@/common/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Appearance settings', href: ROUTES.settings.appearance },
];

export default function Appearance() {
    useDocumentTitle('Appearance settings');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SettingsLayout>
                <h1 className="sr-only">Appearance settings</h1>

                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Appearance settings"
                        description="Update the appearance settings for your account"
                    />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
