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

import { ConfigProvider, theme as antTheme } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState, useMemo } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { ThemeCenter } from '@/components/ThemeCenter';
import { useThemeStore } from '@/stores/themeStore';
import type { FontFamilyMode } from '@/stores/themeStore';
import { hexToRgb, deriveUIColors } from '@/utils/colorUtils';

const FONT_MAP: Record<FontFamilyMode, string> = {
  manrope: "'Manrope', 'Nunito Sans', 'Segoe UI', sans-serif",
  inter:   "'Inter', 'Segoe UI', system-ui, sans-serif",
  system:  "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
};

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
const PerformanceDashboardPage = lazy(
  () => import('@/features/performance/pages/PerformanceDashboardPage'),
);
const MainKPIAreasPage = lazy(
  () => import('@/features/performance/pages/MainKPIAreasPage'),
);
const SubKPISetupPage = lazy(
  () => import('@/features/performance/pages/SubKPISetupPage'),
);
const SeparationRequestsPage = lazy(
  () => import('@/features/offboarding/separation-requests/pages/SeparationRequestsPage'),
);
const ClearanceManagementPage = lazy(
  () => import('@/features/offboarding/clearance/pages/ClearanceManagementPage'),
);
const FinalSettlementPage = lazy(
  () => import('@/features/offboarding/final-settlement/pages/FinalSettlementPage'),
);
const MyResignationPage = lazy(
  () => import('@/features/offboarding/my-resignation/pages/MyResignationPage'),
);
const EmployeeKPIViewPage = lazy(
  () => import('@/features/performance/pages/EmployeeKPIViewPage'),
);
const AchievementLevelPage = lazy(
  () => import('@/features/performance/pages/AchievementLevelPage'),
);
const EvaluationPage = lazy(
  () => import('@/features/performance/pages/EvaluationPage'),
);
const DesignationMatrixPage = lazy(
  () => import('@/features/performance/pages/DesignationMatrixPage'),
);
const AppraisalConfigPage = lazy(
  () => import('@/features/performance/pages/AppraisalConfigPage'),
);
const MyAppraisalPage = lazy(
  () => import('@/features/performance/pages/MyAppraisalPage'),
);
const SeparationPolicyPage = lazy(
  () => import('@/features/offboarding/separation-policy/pages/SeparationPolicyPage'),
);
const ExitInterviewsPage = lazy(
  () => import('@/features/offboarding/exit-interviews/pages/ExitInterviewsPage'),
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
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-disabled)', fontSize: 14, background: 'var(--color-bg-base)' }}>
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--color-text-disabled)', background: 'var(--color-bg-base)' }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--color-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
        🚧
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{label}</div>
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

          {/* ── Performance Management (submenu only) ─────────────────────── */}
          <Route path="/performance/dashboard"          element={<PerformanceDashboardPage />} />
          <Route path="/performance/main-kpi"           element={<MainKPIAreasPage />} />
          <Route path="/performance/sub-kpi-setup"      element={<SubKPISetupPage />} />
          <Route path="/performance/evaluation"         element={<EvaluationPage />} />
          <Route path="/performance/employee-kpi-view"  element={<EmployeeKPIViewPage />} />
          <Route path="/performance/designation-matrix" element={<DesignationMatrixPage />} />
          <Route path="/performance/achievement-level"   element={<AchievementLevelPage />} />
          <Route path="/performance/appraisal-config"   element={<AppraisalConfigPage />} />
          <Route path="/performance/my-appraisal"       element={<MyAppraisalPage />} />

          {/* ── Offboarding ─────────────────────────────────────────────── */}
          <Route path="/offboarding/my-resignation"        element={<MyResignationPage />} />
          <Route path="/offboarding/separation-requests" element={<SeparationRequestsPage />} />
          <Route path="/offboarding/clearance"           element={<ClearanceManagementPage />} />
          <Route path="/offboarding/final-settlement"    element={<FinalSettlementPage />} />
          <Route path="/offboarding/separation-policy"  element={<SeparationPolicyPage />} />
          <Route path="/offboarding/exit-interview"     element={<ExitInterviewsPage />} />

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

// ── Border radius map ─────────────────────────────────────────────────────────
const BORDER_RADIUS_MAP = { sharp: 4, default: 10, rounded: 16 } as const;

// ── Root ──────────────────────────────────────────────────────────────────────
function App() {
  const {
    mode, primaryColor, primaryDark, primaryLight,
    borderRadius, density, fontFamily, topbarStyle,
  } = useThemeStore();

  // Resolve system preference
  const [osIsDark, setOsIsDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setOsIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && osIsDark);

  // Derive all hue-tinted light-mode UI surface colours from the primary
  const uiColors = useMemo(() => deriveUIColors(primaryColor), [primaryColor]);

  // Apply data-theme attribute + CSS custom properties
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    document.documentElement.setAttribute('data-topbar', topbarStyle);
  }, [topbarStyle]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-family-base', FONT_MAP[fontFamily]);
  }, [fontFamily]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary',          primaryColor);
    root.style.setProperty('--color-primary-dark',     primaryDark);
    root.style.setProperty('--color-primary-light',    primaryLight);
    root.style.setProperty('--color-secondary',        primaryColor);
    root.style.setProperty('--color-accent',           primaryColor);
    root.style.setProperty('--color-primary-rgb',      hexToRgb(primaryColor));
    root.style.setProperty('--color-primary-dark-rgb', hexToRgb(primaryDark));
    // Border colours: hue-tinted in light mode, neutral in dark mode
    root.style.setProperty('--color-border',        isDark ? '#252f42' : uiColors.border);
    root.style.setProperty('--color-border-strong', isDark ? '#2d3a52' : uiColors.borderStrong);
  }, [primaryColor, primaryDark, primaryLight, isDark, uiColors]);

  const br = BORDER_RADIUS_MAP[borderRadius];

  // Compute Ant Design light/dark selection colors from the primary
  const selectedBg   = isDark ? primaryColor + '28' : primaryLight;
  const hoverBg      = isDark ? primaryColor + '18' : primaryLight + 'cc';
  const menuItemColor = isDark ? '#94a3b8' : '#334155';

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        componentSize={density === 'compact' ? 'small' : density === 'spacious' ? 'large' : 'middle'}
        theme={{
          algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
          token: {
            motionDurationFast: '50ms',
            motionDurationMid:  '50ms',
            motionDurationSlow: '100ms',
            colorPrimary:       primaryColor,
            colorSuccess:       '#059669',
            colorWarning:       '#d97706',
            colorError:         '#dc2626',
            colorInfo:          '#0284c7',
            borderRadius:       br,
            borderRadiusLG:     br + 4,
            fontFamily:         FONT_MAP[fontFamily],
            fontSize:           13,
            lineHeight:         1.5,
            colorBgBase:        isDark ? '#0f1117' : '#ffffff',
            colorBgLayout:      isDark ? '#0f1117' : '#F4F5F8',
            colorBgContainer:   isDark ? '#161b27' : '#ffffff',
            colorBorder:        isDark ? '#252f42' : uiColors.border,
            colorBorderSecondary: isDark ? '#1e2638' : uiColors.borderSecondary,
            colorText:          isDark ? '#f1f5f9' : '#111827',
            colorTextSecondary: isDark ? '#94a3b8' : '#4b5563',
            boxShadow:          isDark
              ? '0 10px 30px rgba(0,0,0,0.4)'
              : `0 10px 30px rgba(${hexToRgb(primaryDark)},0.12)`,
            boxShadowSecondary: isDark
              ? '0 6px 18px rgba(0,0,0,0.28)'
              : `0 6px 18px rgba(${hexToRgb(primaryDark)},0.08)`,
            controlHeight:   34,
            controlHeightSM: 30,
            controlHeightLG: 40,
          },
          components: {
            Button: {
              borderRadius:           br,
              fontWeight:             600,
              controlHeight:          34,
              controlHeightSM:        30,
              controlHeightLG:        40,
              primaryShadow:          'none',
              defaultBorderColor:     isDark ? '#2d3a52' : uiColors.borderStrong,
              defaultHoverColor:      primaryColor,
              defaultHoverBorderColor: primaryColor,
              defaultHoverBg:         isDark ? primaryColor + '18' : primaryLight,
            },
            Table: {
              cellPaddingBlock:      8,
              cellPaddingInline:     12,
              headerBg:              isDark ? '#1a2030' : uiColors.tableHeaderBg,
              headerColor:           isDark ? '#cbd5e1' : '#374151',
              headerSortActiveBg:    isDark ? '#1e2638' : uiColors.tableHeaderSortBg,
              rowHoverBg:            isDark ? '#1e2638' : uiColors.tableRowHoverBg,
              fontSize:              13,
            },
            Menu: {
              itemHeight:         34,
              itemBg:             'transparent',
              itemColor:          menuItemColor,
              itemHoverColor:     primaryDark,
              itemSelectedBg:     selectedBg,
              itemSelectedColor:  primaryDark,
              itemHoverBg:        hoverBg,
              subMenuItemBg:      isDark ? '#1a2030' : uiColors.menuSubBg,
              groupTitleColor:    isDark ? '#475569' : '#64748b',
              fontSize:           13,
            },
            Layout: {
              siderBg: isDark ? '#161b27' : primaryLight,
              headerBg: 'transparent',
            },
            Form: {
              labelFontSize:          12,
              labelColor:             isDark ? '#94a3b8' : '#374151',
              labelRequiredMarkColor: '#dc2626',
            },
            Input: {
              activeBorderColor: primaryColor,
              hoverBorderColor:  primaryColor,
              colorBgContainer:  isDark ? '#1a2030' : '#ffffff',
            },
            Select: {
              optionSelectedBg: selectedBg,
              optionActiveBg:   hoverBg,
            },
            Modal: {
              titleFontSize:  15,
              titleLineHeight: 1.4,
              borderRadiusLG: br + 4,
            },
            Drawer: {
              fontSizeLG:      15,
              colorBgElevated: isDark ? '#161b27' : '#ffffff',
            },
            Popover: { borderRadiusLG: br + 4 },
            Dropdown: { borderRadiusLG: br + 4 },
            Card: {
              paddingLG:      16,
              borderRadiusLG: br + 4,
            },
            Breadcrumb: topbarStyle === 'minimal' ? {
              itemColor:      isDark ? '#94a3b8' : '#6b7280',
              lastItemColor:  isDark ? '#f1f5f9' : '#111827',
              separatorColor: isDark ? '#475569' : '#9ca3af',
            } : {
              itemColor:      'rgba(255,255,255,0.78)',
              lastItemColor:  '#ffffff',
              separatorColor: 'rgba(255,255,255,0.56)',
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
          <ThemeCenter />
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
