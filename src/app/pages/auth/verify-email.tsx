import { useDocumentTitle } from '@/common/hooks/use-document-title';
import AuthLayout from '@/common/layouts/auth-layout';
import { VerifyEmailActions } from '@/context.auth/components/verify-email-actions';

export default function VerifyEmail() {
    useDocumentTitle('Email verification');

    return (
        <AuthLayout
            title="Email verification"
            description="Please verify your email address by clicking on the link we just emailed to you."
        >
            <VerifyEmailActions />
        </AuthLayout>
    );
}
