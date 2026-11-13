import { ROUTES } from '@/app/routes';
import Heading from '@/common/components/heading';
import { useDocumentTitle } from '@/common/hooks/use-document-title';
import AppLayout from '@/common/layouts/app-layout';
import SettingsLayout from '@/common/layouts/settings/layout';
import type { BreadcrumbItem } from '@/common/types';
import { useAuth } from '@/context.auth/hooks/use-auth';
import { useAuthConfig } from '@/context.auth/hooks/use-auth-config';
import { DeleteUser } from '@/context.settings/components/delete-user';
import { ProfileForm } from '@/context.settings/components/profile-form';
import { UnverifiedEmailNotice } from '@/context.settings/components/unverified-email-notice';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Profile settings', href: ROUTES.settings.profile },
];

export default function Profile() {
    useDocumentTitle('Profile settings');
    const { user, isVerified } = useAuth();
    const { authConfig } = useAuthConfig();

    if (!user) {
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SettingsLayout>
                <h1 className="sr-only">Profile settings</h1>

                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile"
                        description="Update your name and email address"
                    />

                    <ProfileForm user={user} />

                    {authConfig.mustVerifyEmail && !isVerified && (
                        <UnverifiedEmailNotice />
                    )}
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
