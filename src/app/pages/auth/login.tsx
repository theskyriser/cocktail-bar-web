import { useDocumentTitle } from '@/common/hooks/use-document-title';
import AuthLayout from '@/common/layouts/auth-layout';
import { LoginForm } from '@/context.auth/components/login-form';

export default function Login() {
    useDocumentTitle('Log in');

    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <LoginForm />
        </AuthLayout>
    );
}
