/**
 * App.tsx — Smart HRM root
 * ─────────────────────────────────────────────────────────────────────────────
 * Provider stack → AppLayout (sidebar + header) → page routes.
 *
 * Implemented pages:
 *   /core-hr/organogram  →  OrganogramPage
 *
 * All other module paths render a <ComingSoon> placeholder so every nav
 * link is clickable without throwing errors during development.
 */

import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AppLayout } from '@/layouts/AppLayout';

// ── Implemented feature pages ─────────────────────────────────────────────────
const OrganogramPage = lazy(
  () => import('@/features/core-hr/organogram/pages/OrganogramPage'),
);
const ManpowerHeadcountPage = lazy(
  () => import('@/features/core-hr/manpower-headcount/pages/ManpowerHeadcountPage'),
);
const ManpowerRequisitionPage = lazy(
  () => import('@/features/core-hr/manpower-requisition/pages/ManpowerRequisitionPage'),
);
const MyShiftPage = lazy(
  () => import('@/features/ess/my-shift/pages/MyShiftPage'),
);
const DemandPage = lazy(
  () => import('@/features/ess/demand/pages/DemandPage'),
);
const ProvidentFundPage = lazy(
  () => import('@/features/ess/provident-fund/pages/ProvidentFundPage'),
);
const AssignAssetPage = lazy(
  () => import('@/features/assets/assign-asset/pages/AssignAssetPage'),
);

// ── Global providers ──────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

// ── Page-level Suspense fallback ──────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 }}>
      Loading…
    </div>
  );
}

// ── Coming Soon placeholder ───────────────────────────────────────────────────
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

// ── Authenticated shell (layout + routes) ─────────────────────────────────────
function AppShell() {
  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Implemented ─────────────────── */}
          <Route path="/core-hr/organogram"          element={<OrganogramPage />} />
          <Route path="/core-hr/manpower-headcount"  element={<ManpowerHeadcountPage />} />
          <Route path="/core-hr/requisition"         element={<ManpowerRequisitionPage />} />
          <Route path="/ess/my-shift"                element={<MyShiftPage />} />
          <Route path="/ess/demand"                  element={<DemandPage />} />
          <Route path="/ess/pf"                      element={<ProvidentFundPage />} />
          <Route path="/assets/assign-asset"         element={<AssignAssetPage />} />

          {/* ── Placeholders for every module ── */}
          <Route path="/core-hr/*"             element={<ComingSoon />} />
          <Route path="/recruitment/*"         element={<ComingSoon />} />
          <Route path="/onboarding/*"          element={<ComingSoon />} />
          <Route path="/employee-relations/*"  element={<ComingSoon />} />
          <Route path="/attendance/*"          element={<ComingSoon />} />
          <Route path="/payroll/*"             element={<ComingSoon />} />
          <Route path="/assets/*"              element={<ComingSoon />} />
          <Route path="/performance/*"         element={<ComingSoon />} />
          <Route path="/training/*"            element={<ComingSoon />} />
          <Route path="/offboarding/*"         element={<ComingSoon />} />
          <Route path="/system-admin/*"        element={<ComingSoon />} />
          <Route path="/analytics/*"           element={<ComingSoon />} />
          <Route path="/ess/*"                 element={<ComingSoon />} />
          <Route path="*"                      element={<ComingSoon />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#0d9488',
            borderRadius: 8,
            fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
            fontSize: 13,
            lineHeight: 1.5,
            colorBgBase: '#ffffff',
            colorBgLayout: '#eef4f5',
            colorBorder: '#cce8e5',
            colorText: '#111827',
            colorTextSecondary: '#6b7280',
          },
          components: {
            Table: {
              cellPaddingBlock: 8,
              cellPaddingInline: 12,
              headerBg: '#f0fdfa',
              headerColor: '#374151',
              headerSortActiveBg: '#ccfbf1',
              rowHoverBg: '#f0fdfa',
              fontSize: 13,
            },
            Menu: {
              itemHeight: 34,
              itemBg: 'transparent',
              itemColor: '#334155',
              itemHoverColor: '#0f766e',
              itemSelectedBg: '#dff4f1',
              itemSelectedColor: '#0f766e',
              itemHoverBg: '#eaf7f5',
              subMenuItemBg: '#f6fbfa',
              groupTitleColor: '#64748b',
              fontSize: 13,
            },
            Layout: {
              siderBg: '#f6fbfa',
              headerBg: '#1B3D3E',
            },
            Form: {
              labelFontSize: 12,
              labelColor: '#374151',
              labelRequiredMarkColor: '#dc2626',
            },
            Modal: {
              titleFontSize: 15,
              titleLineHeight: 1.4,
            },
            Card: {
              paddingLG: 16,
            },
          },
        }}
      >
        <BrowserRouter>
          <Routes>
            {/* Default landing → Organogram */}
            <Route path="/" element={<Navigate to="/core-hr/organogram" replace />} />
            <Route path="/*" element={<AppShell />} />
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
