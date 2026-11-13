import { ROUTES } from '@/app/routes';
import Heading from '@/common/components/heading';
import { useDocumentTitle } from '@/common/hooks/use-document-title';
import AppLayout from '@/common/layouts/app-layout';
import SettingsLayout from '@/common/layouts/settings/layout';
import type { BreadcrumbItem } from '@/common/types';
import { PasswordForm } from '@/context.settings/components/password-form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Security settings', href: ROUTES.settings.security },
];

export default function Security() {
    useDocumentTitle('Security settings');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SettingsLayout>
                <h1 className="sr-only">Security settings</h1>

                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Update password"
                        description="Ensure your account is using a long, random password to stay secure"
                    />

                    <PasswordForm />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
