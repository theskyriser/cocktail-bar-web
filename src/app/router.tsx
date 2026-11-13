import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import { GuestOnly } from '@/app/guards/guest-only';
import { RequireAuth } from '@/app/guards/require-auth';
import { ROUTES } from '@/app/routes';
import Welcome from '@/app/pages/welcome';

const Dashboard = lazy(() => import('@/app/pages/dashboard'));
const Login = lazy(() => import('@/app/pages/auth/login'));
const Register = lazy(() => import('@/app/pages/auth/register'));
const ForgotPassword = lazy(() => import('@/app/pages/auth/forgot-password'));
const ResetPassword = lazy(() => import('@/app/pages/auth/reset-password'));
const VerifyEmail = lazy(() => import('@/app/pages/auth/verify-email'));
const Profile = lazy(() => import('@/app/pages/settings/profile'));
const Security = lazy(() => import('@/app/pages/settings/security'));
const Appearance = lazy(() => import('@/app/pages/settings/appearance'));
const NotFound = lazy(() => import('@/app/pages/not-found'));

export const router = createBrowserRouter([
    { path: ROUTES.home, element: <Welcome /> },
    {
        element: <GuestOnly />,
        children: [
            { path: ROUTES.login, element: <Login /> },
            { path: ROUTES.register, element: <Register /> },
            { path: ROUTES.forgotPassword, element: <ForgotPassword /> },
            { path: ROUTES.resetPassword, element: <ResetPassword /> },
        ],
    },
    {
        element: <RequireAuth />,
        children: [
            { path: ROUTES.verifyEmail, element: <VerifyEmail /> },
            { path: ROUTES.settings.profile, element: <Profile /> },
        ],
    },
    {
        element: <RequireAuth requireVerified />,
        children: [
            { path: ROUTES.dashboard, element: <Dashboard /> },
            { path: ROUTES.settings.security, element: <Security /> },
            { path: ROUTES.settings.appearance, element: <Appearance /> },
        ],
    },
    { path: '*', element: <NotFound /> },
]);
