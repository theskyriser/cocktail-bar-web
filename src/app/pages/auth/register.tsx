import { useDocumentTitle } from '@/common/hooks/use-document-title';
import AuthLayout from '@/common/layouts/auth-layout';
import { RegisterForm } from '@/context.auth/components/register-form';

export default function Register() {
    useDocumentTitle('Register');

    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <RegisterForm />
        </AuthLayout>
    );
}
