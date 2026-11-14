import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import Welcome from '@/app/pages/welcome';
import { ROUTES } from '@/app/routes';

const NotFound = lazy(() => import('@/app/pages/not-found'));

export const router = createBrowserRouter([
    { path: ROUTES.home, element: <Welcome /> },
    { path: '*', element: <NotFound /> },
]);
