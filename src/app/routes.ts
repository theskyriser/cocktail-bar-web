export const ROUTES = {
    home: '/',
    dashboard: '/dashboard',
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password/:token',
    verifyEmail: '/verify-email',
    settings: {
        profile: '/settings/profile',
        security: '/settings/security',
        appearance: '/settings/appearance',
    },
} as const;

export function resetPasswordUrl(token: string): string {
    return ROUTES.resetPassword.replace(':token', encodeURIComponent(token));
}
