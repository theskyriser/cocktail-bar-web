import { cn } from '@/common/lib/utils';

type TProgressBarProps = {
    value: number;
    label: string;
    className?: string;
};

export function ProgressBar({ value, label, className }: TProgressBarProps) {
    const fraction = Math.min(1, Math.max(0, value));

    return (
        <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={1}
            aria-valuenow={fraction}
            aria-valuetext={fraction.toLocaleString(undefined, {
                style: 'percent',
            })}
            className={cn(
                'h-2 w-1/2 overflow-hidden border bg-muted',
                className,
            )}
        >
            <div
                className="h-full w-full origin-left bg-primary transition-transform duration-300"
                style={{ transform: `scaleX(${fraction})` }}
            />
        </div>
    );
}
