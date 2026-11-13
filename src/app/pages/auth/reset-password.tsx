import { useParams, useSearchParams } from 'react-router';
import { useDocumentTitle } from '@/common/hooks/use-document-title';
import AuthLayout from '@/common/layouts/auth-layout';
import { ResetPasswordForm } from '@/context.auth/components/reset-password-form';

export default function ResetPassword() {
    useDocumentTitle('Reset password');
    const { token } = useParams<{ token: string }>();
    const [searchParams] = useSearchParams();

    return (
        <AuthLayout
            title="Reset password"
            description="Please enter your new password below"
        >
            <ResetPasswordForm
                token={token ?? ''}
                email={searchParams.get('email') ?? ''}
            />
        </AuthLayout>
    );
}
