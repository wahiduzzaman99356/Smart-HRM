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
const OutstationPage = lazy(
  () => import('@/features/ess/outstation/pages/OutstationPage'),
);
const LoanManagementPage = lazy(
  () => import('@/features/ess/loan-management/pages/LoanManagementPage'),
);
const ProvidentFundPage = lazy(
  () => import('@/features/ess/provident-fund/pages/ProvidentFundPage'),
);
const AssignAssetPage = lazy(
  () => import('@/features/assets/assign-asset/pages/AssignAssetPage'),
);
const QuestionBankPage = lazy(
  () => import('@/features/core-hr/question-bank/pages/QuestionBankPage'),
);
const SalaryRulesPage = lazy(
  () => import('@/features/payroll/salary-rules/pages/SalaryRulesPage'),
);
const SalaryGenerationPage = lazy(
  () => import('@/features/payroll/salary-generation/pages/SalaryGenerationPage'),
);
const JobPostingsPage = lazy(
  () => import('@/features/recruitment/job-postings/pages/JobPostingsPage'),
);
const JobPostingDetailPage = lazy(
  () => import('@/features/recruitment/job-postings/pages/JobPostingDetailPage'),
);
const PipelinesPage = lazy(
  () => import('@/features/recruitment/pipelines/pages/PipelinesPage'),
);
const PipelineDetailPage = lazy(
  () => import('@/features/recruitment/pipelines/pages/PipelineDetailPage'),
);
const CandidateListPage = lazy(
  () => import('@/features/recruitment/pipelines/pages/CandidateListPage'),
);
const CandidateProfilePage = lazy(
  () => import('@/features/recruitment/pipelines/pages/CandidateProfilePage'),
);
const ConflictResolutionPage = lazy(
  () => import('@/features/employee-relations/conflict-resolution/pages/ConflictResolutionPage'),
);
const MyComplaintsPage = lazy(
  () => import('@/features/ess/my-cases/pages/MyComplaintsPage'),
);
const CompliancePage = lazy(
  () => import('@/features/employee-relations/compliance/pages/CompliancePage'),
);
// ── Performance Management pages ──────────────────────────────────────────────
const PerformanceDashboardPage = lazy(
  () => import('@/features/performance/dashboard/pages/PerformanceDashboardPage'),
);
const MainKPIPage = lazy(
  () => import('@/features/performance/main-kpi/pages/MainKPIPage'),
);
const SubKPIPage = lazy(
  () => import('@/features/performance/sub-kpi/pages/SubKPIPage'),
);
const EmployeeKPIPage = lazy(
  () => import('@/features/performance/employee-kpi/pages/EmployeeKPIPage'),
);
const DesignationMatrixPage = lazy(
  () => import('@/features/performance/designation-matrix/pages/DesignationMatrixPage'),
);
const AchievementLevelPage = lazy(
  () => import('@/features/performance/achievement-level/pages/AchievementLevelPage'),
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
          <Route path="/ess/outstation"              element={<OutstationPage />} />
          <Route path="/ess/loan-management"         element={<LoanManagementPage />} />
          <Route path="/ess/pf"                      element={<ProvidentFundPage />} />
          <Route path="/assets/assign-asset"         element={<AssignAssetPage />} />
          <Route path="/core-hr/question-bank"       element={<QuestionBankPage />} />
          <Route path="/payroll/configuration/salary-rules" element={<SalaryRulesPage />} />
          <Route path="/payroll/salary-generation"   element={<SalaryGenerationPage />} />
          <Route path="/recruitment/job-postings"            element={<JobPostingsPage />} />
          <Route path="/recruitment/job-postings/:mrfId"   element={<JobPostingDetailPage />} />
          <Route path="/recruitment/pipelines"        element={<PipelinesPage />} />
          <Route path="/recruitment/pipelines/new"            element={<PipelineDetailPage />} />
          <Route path="/recruitment/pipelines/:id"            element={<PipelineDetailPage />} />
          <Route path="/recruitment/pipelines/:id/candidates" element={<CandidateListPage />} />
          <Route path="/recruitment/pipelines/:id/candidates/:candidateId" element={<CandidateProfilePage />} />
          <Route path="/employee-relations/disciplinary/conflict-resolution" element={<ConflictResolutionPage />} />
          <Route path="/employee-relations/disciplinary/compliance-tracker" element={<CompliancePage />} />
          <Route path="/ess/my-cases" element={<MyComplaintsPage />} />
          <Route path="/performance/dashboard"          element={<PerformanceDashboardPage />} />
          <Route path="/performance/main-kpi"           element={<MainKPIPage />} />
          <Route path="/performance/sub-kpi"            element={<SubKPIPage />} />
          <Route path="/performance/employee-kpi"       element={<EmployeeKPIPage />} />
          <Route path="/performance/designation-matrix" element={<DesignationMatrixPage />} />
          <Route path="/performance/achievement-level"  element={<AchievementLevelPage />} />

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
            motionDurationFast: '50ms',
            motionDurationMid:  '50ms',
            motionDurationSlow: '100ms',
            colorPrimary: '#0f766e',
            colorSuccess: '#059669',
            colorWarning: '#d97706',
            colorError: '#dc2626',
            colorInfo: '#0284c7',
            borderRadius: 10,
            borderRadiusLG: 14,
            fontFamily: "'Manrope', 'Nunito Sans', 'Segoe UI', sans-serif",
            fontSize: 13,
            lineHeight: 1.5,
            colorBgBase: '#ffffff',
            colorBgLayout: '#eaf2f2',
            colorBgContainer: '#ffffff',
            colorBorder: '#d8e7e5',
            colorBorderSecondary: '#c7ddda',
            colorText: '#111827',
            colorTextSecondary: '#4b5563',
            boxShadow: '0 10px 30px rgba(15, 40, 38, 0.12)',
            boxShadowSecondary: '0 6px 18px rgba(15, 40, 38, 0.08)',
            controlHeight: 34,
            controlHeightSM: 30,
            controlHeightLG: 40,
          },
          components: {
            Button: {
              borderRadius: 10,
              fontWeight: 600,
              controlHeight: 34,
              controlHeightSM: 30,
              controlHeightLG: 40,
              primaryShadow: 'none',
              defaultBorderColor: '#bdd6d2',
              defaultHoverColor: '#0f766e',
              defaultHoverBorderColor: '#0f766e',
              defaultHoverBg: '#f0fdfa',
            },
            Table: {
              cellPaddingBlock: 8,
              cellPaddingInline: 12,
              headerBg: '#eef8f7',
              headerColor: '#374151',
              headerSortActiveBg: '#d9efec',
              rowHoverBg: '#f4fbfa',
              fontSize: 13,
            },
            Menu: {
              itemHeight: 34,
              itemBg: 'transparent',
              itemColor: '#334155',
              itemHoverColor: '#115e59',
              itemSelectedBg: '#d4efeb',
              itemSelectedColor: '#115e59',
              itemHoverBg: '#e2f5f2',
              subMenuItemBg: '#f3f8f7',
              groupTitleColor: '#64748b',
              fontSize: 13,
            },
            Layout: {
              siderBg: '#eff8f6',
              headerBg: '#145a56',
            },
            Form: {
              labelFontSize: 12,
              labelColor: '#374151',
              labelRequiredMarkColor: '#dc2626',
            },
            Input: {
              activeBorderColor: '#0d9488',
              hoverBorderColor: '#0f766e',
              colorBgContainer: '#ffffff',
            },
            Select: {
              optionSelectedBg: '#d4efeb',
              optionActiveBg: '#e2f5f2',
            },
            Modal: {
              titleFontSize: 15,
              titleLineHeight: 1.4,
              borderRadiusLG: 14,
            },
            Drawer: {
              fontSizeLG: 15,
              colorBgElevated: '#ffffff',
            },
            Popover: {
              borderRadiusLG: 14,
            },
            Dropdown: {
              borderRadiusLG: 14,
            },
            Card: {
              paddingLG: 16,
              borderRadiusLG: 14,
            },
            Breadcrumb: {
              itemColor: 'rgba(255, 255, 255, 0.78)',
              lastItemColor: '#ffffff',
              separatorColor: 'rgba(255, 255, 255, 0.56)',
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
