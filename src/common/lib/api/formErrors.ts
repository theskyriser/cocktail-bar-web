import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { isValidationError } from './errors';

export function applyApiErrors<TFieldValues extends FieldValues>(
    error: unknown,
    setError: UseFormSetError<TFieldValues>,
): boolean {
    if (!isValidationError(error)) {
        return false;
    }

    for (const [field, messages] of Object.entries(error.errors)) {
        if (!messages?.length) {
            continue;
        }

        setError(field as Path<TFieldValues>, {
            type: 'server',
            message: messages[0],
        });
    }

    return true;
}
