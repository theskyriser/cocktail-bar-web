import AppLogoIcon from '@/common/components/app-logo-icon';
import { useDocumentTitle } from '@/common/hooks/use-document-title';
import LoginForm from '@/context.auth/components/login-form';

export default function Welcome() {
    useDocumentTitle();
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background p-6">
            <div className="flex flex-col items-center gap-4 text-center">
                <AppLogoIcon className="size-12 fill-current text-primary" />
                <LoginForm />
            </div>
        </div>
    );
}
