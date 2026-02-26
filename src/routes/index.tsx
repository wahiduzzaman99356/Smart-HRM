import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { ROUTES } from './routeConfig';

const OrganogramPage = lazy(() => import('@/features/core-hr/organogram/pages/OrganogramPage'));
const ManpowerHeadcountPage = lazy(() => import('@/features/core-hr/manpower-headcount/pages/ManpowerHeadcountPage'));
const ManpowerRequisitionPage = lazy(() => import('@/features/core-hr/manpower-requisition/pages/ManpowerRequisitionPage'));

function PageLoader() {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 }}>
      Loading…
    </div>
  );
}

function ComingSoon() {
  const { pathname } = useLocation();
  const label = pathname
    .split('/')
    .filter(Boolean)
    .map(s => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
    .join(' › ');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#9ca3af' }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
        🚧
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>{label}</div>
      <div style={{ fontSize: 13 }}>This module is under development.</div>
    </div>
  );
}

const SuspensedOutlet = () => (
  <Suspense fallback={<PageLoader />}>
    <Outlet />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppLayout>
        <SuspensedOutlet />
      </AppLayout>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.CORE_HR.ORGANOGRAM} replace /> },
      { path: ROUTES.CORE_HR.ORGANOGRAM, element: <OrganogramPage /> },
      { path: ROUTES.CORE_HR.MANPOWER_HEADCOUNT, element: <ManpowerHeadcountPage /> },
      { path: ROUTES.CORE_HR.REQUISITION, element: <ManpowerRequisitionPage /> },

      { path: '/core-hr/*', element: <ComingSoon /> },
      { path: '/recruitment/*', element: <ComingSoon /> },
      { path: '/onboarding/*', element: <ComingSoon /> },
      { path: '/employee-relations/*', element: <ComingSoon /> },
      { path: '/attendance/*', element: <ComingSoon /> },
      { path: '/payroll/*', element: <ComingSoon /> },
      { path: '/assets/*', element: <ComingSoon /> },
      { path: '/performance/*', element: <ComingSoon /> },
      { path: '/training/*', element: <ComingSoon /> },
      { path: '/offboarding/*', element: <ComingSoon /> },
      { path: '/system-admin/*', element: <ComingSoon /> },
      { path: '/analytics/*', element: <ComingSoon /> },
      { path: '*', element: <ComingSoon /> },
    ],
  },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
