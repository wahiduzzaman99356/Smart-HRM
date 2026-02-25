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
          <Route path="/core-hr/organogram"    element={<OrganogramPage />} />

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
            colorPrimary: '#3b82f6',
            borderRadius: 8,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          },
          components: {
            Menu: {
              itemSelectedBg: '#eff6ff',
              itemSelectedColor: '#2563eb',
              itemHoverBg: '#f9fafb',
              subMenuItemBg: '#ffffff',
            },
            Layout: {
              siderBg: '#ffffff',
              headerBg: '#ffffff',
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
