import type { ComponentProps } from 'react';
import { Link } from 'react-router';
import { cn } from '@/common/lib/utils';

type Props = ComponentProps<typeof Link>;

export default function TextLink({
    className = '',
    children,
    ...props
}: Props) {
    return (
        <Link
            className={cn(
                'text-primary underline decoration-primary/40 underline-offset-3 transition-colors duration-300 ease-out hover:decoration-primary',
                className,
            )}
            {...props}
        >
            {children}
        </Link>
    );
}
