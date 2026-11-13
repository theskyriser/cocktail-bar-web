import AppLogoIcon from '@/common/components/app-logo-icon';
import { APP_NAME } from '@/common/lib/app-name';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md border border-primary text-primary">
                <AppLogoIcon className="size-5 fill-current" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {APP_NAME}
                </span>
            </div>
        </>
    );
}
