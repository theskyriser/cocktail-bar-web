import { useDocumentTitle } from '@/common/hooks/use-document-title';
import AuthLayout from '@/common/layouts/auth-layout';
import { ForgotPasswordForm } from '@/context.auth/components/forgot-password-form';

export default function ForgotPassword() {
    useDocumentTitle('Forgot password');

    return (
        <AuthLayout
            title="Forgot password"
            description="Enter your email to receive a password reset link"
        >
            <ForgotPasswordForm />
        </AuthLayout>
    );
}
