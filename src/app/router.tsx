import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import Welcome from '@/app/pages/welcome';
import { ROUTES } from '@/app/routes';

const NotFound = lazy(() => import('@/app/pages/not-found'));
const Login = lazy(() => import('@/app/pages/login'));
const Bar = lazy(() => import('@/app/pages/bar'));
const Recipes = lazy(() => import('@/app/pages/recipes'));
const Make = lazy(() => import('@/app/pages/make'));
const Shop = lazy(() => import('@/app/pages/shop'));

export const router = createBrowserRouter([
    { path: ROUTES.home, element: <Welcome /> },
    { path: ROUTES.login, element: <Login /> },
    { path: ROUTES.bar, element: <Bar /> },
    { path: ROUTES.recipes, element: <Recipes /> },
    { path: ROUTES.make, element: <Make /> },
    { path: ROUTES.shop, element: <Shop /> },
    { path: '*', element: <NotFound /> },
]);
