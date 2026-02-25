/**
 * src/routes/index.tsx
 * ──────────────────────────────────────────────────────────────────────────────
 * Root router — React Router v6 (Data Router API via createBrowserRouter).
 *
 * Conventions:
 *  - Every page component is lazy-loaded via React.lazy() → one JS chunk per page.
 *  - Three layout shells:
 *      AppLayout    → authenticated app  (sidebar + header + <Outlet>)
 *      AuthLayout   → public login / forgot-password
 *      PortalLayout → public external job portal
 *  - PrivateRoute wraps the AppLayout tree; unauthenticated users are
 *    redirected to /auth/login.
 *  - <SuspensedOutlet> provides a single Suspense boundary per shell so each
 *    lazy chunk shows a full-page loader while its bundle is fetched.
 */

import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom';

// Layouts — NOT lazy-loaded; they are tiny shells needed immediately
import { AppLayout }    from '@/layouts/AppLayout';
import { AuthLayout }   from '@/layouts/AuthLayout';
import { PortalLayout } from '@/layouts/PortalLayout';

// Guards
import { PrivateRoute } from './PrivateRoute';

// Shared feedback components (also non-lazy; needed on every route)
import { FullPageLoader } from '@/components/feedback/FullPageLoader';
import { ErrorBoundary }  from '@/components/feedback/ErrorBoundary';
import { NotFound }       from '@/components/feedback/NotFound';

import { ROUTES } from './routeConfig';

// ── Lazy page imports ─────────────────────────────────────────────────────────
// Each import() becomes a separate Webpack / Rollup / Vite chunk.

// Auth
const LoginPage           = lazy(() => import('@/features/auth/pages/LoginPage'));
const ForgotPasswordPage  = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));

// Dashboard
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));

// ── Core HR ──────────────────────────────────────────────────────────────────
const OrganogramPage        = lazy(() => import('@/features/core-hr/organogram/pages/OrganogramPage'));
const EmployeeListPage      = lazy(() => import('@/features/core-hr/employee-management/pages/EmployeeListPage'));
const EmployeeDetailPage    = lazy(() => import('@/features/core-hr/employee-management/pages/EmployeeDetailPage'));
const EmployeeLifecyclePage = lazy(() => import('@/features/core-hr/employee-management/pages/EmployeeLifecyclePage'));
const ManpowerHeadcountPage = lazy(() => import('@/features/core-hr/manpower-headcount/pages/ManpowerHeadcountPage'));
const RequisitionPage       = lazy(() => import('@/features/core-hr/requisition/pages/RequisitionPage'));
const TemplateMgmtPage      = lazy(() => import('@/features/core-hr/hr-templates/pages/TemplateManagementPage'));
const PolicyMgmtPage        = lazy(() => import('@/features/core-hr/policy-management/pages/PolicyManagementPage'));
const NoticesPage           = lazy(() => import('@/features/core-hr/notices/pages/NoticesPage'));

// ── Recruitment ───────────────────────────────────────────────────────────────
const CVBankPage               = lazy(() => import('@/features/recruitment/cv-bank/pages/CVBankPage'));
const JobPostingListPage       = lazy(() => import('@/features/recruitment/job-postings/pages/JobPostingListPage'));
const JobPostingDetailPage     = lazy(() => import('@/features/recruitment/job-postings/pages/JobPostingDetailPage'));
const JobPortalPage            = lazy(() => import('@/features/recruitment/job-portal/pages/JobPortalPage'));
const SourcingPage             = lazy(() => import('@/features/recruitment/sourcing/pages/SourcingPage'));
const CandidateProcessingPage  = lazy(() => import('@/features/recruitment/candidate-processing/pages/CandidateProcessingPage'));
const ShortlistingPage         = lazy(() => import('@/features/recruitment/shortlisting/pages/ShortlistingPage'));
const AssessmentPage           = lazy(() => import('@/features/recruitment/assessment/pages/AssessmentPage'));
const InterviewPage            = lazy(() => import('@/features/recruitment/interview/pages/InterviewPage'));
const EvaluationPage           = lazy(() => import('@/features/recruitment/evaluation/pages/EvaluationPage'));
const OfferManagementPage      = lazy(() => import('@/features/recruitment/offer-management/pages/OfferManagementPage'));
const HiringPage               = lazy(() => import('@/features/recruitment/offer-management/pages/HiringPage'));

// ── Onboarding ────────────────────────────────────────────────────────────────
const CandidateToEmployeePage = lazy(() => import('@/features/onboarding/candidate-to-employee/pages/CandidateToEmployeePage'));
const SelfServicePage         = lazy(() => import('@/features/onboarding/self-service/pages/SelfServicePage'));
const ConfirmationPage        = lazy(() => import('@/features/onboarding/confirmation/pages/ConfirmationPage'));

// ── Employee Relations ────────────────────────────────────────────────────────
const CompliancePage    = lazy(() => import('@/features/employee-relations/compliance/pages/CompliancePage'));
const InvestigationPage = lazy(() => import('@/features/employee-relations/compliance/pages/InvestigationPage'));
const SurveysPage       = lazy(() => import('@/features/employee-relations/surveys/pages/SurveysPage'));
const RecognitionPage   = lazy(() => import('@/features/employee-relations/recognition/pages/RecognitionPage'));

// ── Attendance ────────────────────────────────────────────────────────────────
const TimeCaptureValidationPage = lazy(() => import('@/features/attendance/time-capture/pages/TimeCaptureValidationPage'));
const OutstationPage            = lazy(() => import('@/features/attendance/outstation/pages/OutstationPage'));
const LeaveManagementPage       = lazy(() => import('@/features/attendance/leave/pages/LeaveManagementPage'));
const SchedulingRosterPage      = lazy(() => import('@/features/attendance/scheduling/pages/SchedulingRosterPage'));
const AdjustmentsPage           = lazy(() => import('@/features/attendance/adjustments/pages/AdjustmentsPage'));

// ── Payroll ───────────────────────────────────────────────────────────────────
const SalaryGenerationPage   = lazy(() => import('@/features/payroll/salary-generation/pages/SalaryGenerationPage'));
const BonusGenerationPage    = lazy(() => import('@/features/payroll/bonus/pages/BonusGenerationPage'));
const SalaryCertificatePage  = lazy(() => import('@/features/payroll/salary-certificate/pages/SalaryCertificatePage'));
const IncomeTaxPage          = lazy(() => import('@/features/payroll/income-tax/pages/IncomeTaxPage'));
const FOCPage                = lazy(() => import('@/features/payroll/foc/pages/FOCPage'));
const ProvidentFundPage      = lazy(() => import('@/features/payroll/provident-fund/pages/ProvidentFundPage'));
const GratuityFundPage       = lazy(() => import('@/features/payroll/gratuity-fund/pages/GratuityFundPage'));
const MedicalBenefitPage     = lazy(() => import('@/features/payroll/medical-benefit/pages/MedicalBenefitPage'));
const MealsPage              = lazy(() => import('@/features/payroll/meals/pages/MealsPage'));
const LoansPage              = lazy(() => import('@/features/payroll/loans-advances/pages/LoansPage'));
const AdvancesPage           = lazy(() => import('@/features/payroll/loans-advances/pages/AdvancesPage'));
const SalarySettingsPage     = lazy(() => import('@/features/payroll/salary-settings/pages/SalarySettingsPage'));
const OvertimePage           = lazy(() => import('@/features/payroll/overtime/pages/OvertimePage'));
const ExpenseApplicationPage = lazy(() => import('@/features/payroll/expense-application/pages/ExpenseApplicationPage'));
const PaymentAccountsPage    = lazy(() => import('@/features/payroll/payment-accounts/pages/PaymentAccountsPage'));

// ── Asset Management ──────────────────────────────────────────────────────────
const ITEquipmentPage = lazy(() => import('@/features/asset-management/it-equipment/pages/ITEquipmentPage'));
const StationeryPage  = lazy(() => import('@/features/asset-management/stationery/pages/StationeryPage'));

// ── Performance ───────────────────────────────────────────────────────────────
const GoalsOKRPage = lazy(() => import('@/features/performance/goals-okr/pages/GoalsOKRPage'));
const KPIPage      = lazy(() => import('@/features/performance/kpi/pages/KPIPage'));

// ── Training ──────────────────────────────────────────────────────────────────
const TrainingRequisitionPage = lazy(() => import('@/features/training/requisitions/pages/TrainingRequisitionPage'));
const TrainingProgramsPage    = lazy(() => import('@/features/training/programs/pages/TrainingProgramsPage'));
const TrainingApprovalPage    = lazy(() => import('@/features/training/programs/pages/TrainingApprovalPage'));

// ── Offboarding ───────────────────────────────────────────────────────────────
const SeparationPage = lazy(() => import('@/features/offboarding/separation/pages/SeparationPage'));

// ── System Administration ─────────────────────────────────────────────────────
const DeviceSetupPage = lazy(() => import('@/features/system-admin/device-setup/pages/DeviceSetupPage'));
const FleetPage       = lazy(() => import('@/features/system-admin/fleet/pages/FleetPage'));
const WorkflowPage    = lazy(() => import('@/features/system-admin/workflows/pages/WorkflowPage'));

// ── Analytics ─────────────────────────────────────────────────────────────────
const SystemLogsPage           = lazy(() => import('@/features/analytics/system-logs/pages/SystemLogsPage'));
const EmployeeMasterReportPage = lazy(() => import('@/features/analytics/employee-master/pages/EmployeeMasterReportPage'));

// ── Suspense boundary — wraps each layout's <Outlet> ─────────────────────────
/**
 * Each layout shell renders <SuspensedOutlet /> instead of <Outlet /> directly.
 * This means the shell (sidebar, header, nav) renders immediately, and only
 * the page content area shows the loader while the lazy chunk loads.
 */
const SuspensedOutlet = () => (
  <Suspense fallback={<FullPageLoader />}>
    <Outlet />
  </Suspense>
);

// ── Router ────────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([

  // ── (1) Public — Auth shell ───────────────────────────────────────────────
  {
    element: (
      <AuthLayout>
        <SuspensedOutlet />
      </AuthLayout>
    ),
    children: [
      { path: ROUTES.LOGIN,           element: <LoginPage /> },
      { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
    ],
  },

  // ── (2) Public — External Job Portal shell ────────────────────────────────
  {
    path: ROUTES.PORTAL,
    element: (
      <PortalLayout>
        <SuspensedOutlet />
      </PortalLayout>
    ),
    children: [
      { index: true, element: <JobPortalPage /> },
    ],
  },

  // ── (3) Protected — Authenticated App shell ───────────────────────────────
  {
    path: '/',
    element: (
      <PrivateRoute>
        <AppLayout>
          <SuspensedOutlet />
        </AppLayout>
      </PrivateRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [

      // Default redirect from "/" → "/dashboard"
      { index: true, element: <Navigate to={ROUTES.DASHBOARD} replace /> },

      { path: ROUTES.DASHBOARD, element: <DashboardPage /> },

      // ── MODULE 1: Core HR & Employee Data ─────────────────────────────────
      {
        path: ROUTES.CORE_HR.ROOT,
        children: [
          { path: 'organogram',              element: <OrganogramPage /> },
          { path: 'employees',               element: <EmployeeListPage /> },
          { path: 'employees/:id',           element: <EmployeeDetailPage /> },
          { path: 'employees/:id/lifecycle', element: <EmployeeLifecyclePage /> },
          { path: 'manpower-headcount',      element: <ManpowerHeadcountPage /> },
          { path: 'requisition',             element: <RequisitionPage /> },
          { path: 'templates',               element: <TemplateMgmtPage /> },
          { path: 'policies',                element: <PolicyMgmtPage /> },
          { path: 'notices',                 element: <NoticesPage /> },
        ],
      },

      // ── MODULE 2: Recruitment & ATS ───────────────────────────────────────
      {
        path: ROUTES.RECRUITMENT.ROOT,
        children: [
          { path: 'cv-bank',              element: <CVBankPage /> },
          { path: 'job-postings',         element: <JobPostingListPage /> },
          { path: 'job-postings/:id',     element: <JobPostingDetailPage /> },
          { path: 'sourcing',             element: <SourcingPage /> },
          { path: 'candidates',           element: <CandidateProcessingPage /> },
          { path: 'shortlisting',         element: <ShortlistingPage /> },
          { path: 'assessment',           element: <AssessmentPage /> },
          { path: 'interview',            element: <InterviewPage /> },
          { path: 'evaluation',           element: <EvaluationPage /> },
          { path: 'offers',               element: <OfferManagementPage /> },
          { path: 'hiring',               element: <HiringPage /> },
        ],
      },

      // ── MODULE 3: Onboarding ──────────────────────────────────────────────
      {
        path: ROUTES.ONBOARDING.ROOT,
        children: [
          { path: 'candidate-to-employee', element: <CandidateToEmployeePage /> },
          { path: 'self-service',          element: <SelfServicePage /> },
          { path: 'confirmation',          element: <ConfirmationPage /> },
        ],
      },

      // ── MODULE 4: Employee Relations ──────────────────────────────────────
      {
        path: ROUTES.EMPLOYEE_RELATIONS.ROOT,
        children: [
          { path: 'compliance',    element: <CompliancePage /> },
          { path: 'investigation', element: <InvestigationPage /> },
          { path: 'surveys',       element: <SurveysPage /> },
          { path: 'recognition',   element: <RecognitionPage /> },
        ],
      },

      // ── MODULE 5: Attendance, Adjustment & Leave ──────────────────────────
      {
        path: ROUTES.ATTENDANCE.ROOT,
        children: [
          { path: 'time-capture', element: <TimeCaptureValidationPage /> },
          { path: 'outstation',   element: <OutstationPage /> },
          { path: 'leave',        element: <LeaveManagementPage /> },
          { path: 'scheduling',   element: <SchedulingRosterPage /> },
          { path: 'adjustments',  element: <AdjustmentsPage /> },
        ],
      },

      // ── MODULE 6: Payroll & Compensation & Benefits ───────────────────────
      {
        path: ROUTES.PAYROLL.ROOT,
        children: [
          { path: 'salary-generation',   element: <SalaryGenerationPage /> },
          { path: 'bonus',               element: <BonusGenerationPage /> },
          { path: 'salary-certificate',  element: <SalaryCertificatePage /> },
          { path: 'income-tax',          element: <IncomeTaxPage /> },
          { path: 'foc',                 element: <FOCPage /> },
          { path: 'provident-fund',      element: <ProvidentFundPage /> },
          { path: 'gratuity-fund',       element: <GratuityFundPage /> },
          { path: 'medical-benefit',     element: <MedicalBenefitPage /> },
          { path: 'meals',               element: <MealsPage /> },
          { path: 'loans',               element: <LoansPage /> },
          { path: 'advances',            element: <AdvancesPage /> },
          { path: 'salary-settings',     element: <SalarySettingsPage /> },
          { path: 'overtime',            element: <OvertimePage /> },
          { path: 'expense-application', element: <ExpenseApplicationPage /> },
          { path: 'payment-accounts',    element: <PaymentAccountsPage /> },
        ],
      },

      // ── MODULE 7: Asset Management ────────────────────────────────────────
      {
        path: ROUTES.ASSETS.ROOT,
        children: [
          { path: 'it-equipment', element: <ITEquipmentPage /> },
          { path: 'stationery',   element: <StationeryPage /> },
        ],
      },

      // ── MODULE 8: Performance Management ─────────────────────────────────
      {
        path: ROUTES.PERFORMANCE.ROOT,
        children: [
          { path: 'goals-okr', element: <GoalsOKRPage /> },
          { path: 'kpi',       element: <KPIPage /> },
        ],
      },

      // ── MODULE 9: Training & Learning & Development ───────────────────────
      {
        path: ROUTES.TRAINING.ROOT,
        children: [
          { path: 'requisitions', element: <TrainingRequisitionPage /> },
          { path: 'programs',     element: <TrainingProgramsPage /> },
          { path: 'approval',     element: <TrainingApprovalPage /> },
        ],
      },

      // ── MODULE 10: Offboarding / Employee Separation ──────────────────────
      {
        path: ROUTES.OFFBOARDING.ROOT,
        children: [
          { path: 'separation', element: <SeparationPage /> },
        ],
      },

      // ── MODULE 11: System Administration ──────────────────────────────────
      {
        path: ROUTES.SYSTEM_ADMIN.ROOT,
        children: [
          { path: 'device-setup', element: <DeviceSetupPage /> },
          { path: 'fleet',        element: <FleetPage /> },
          { path: 'workflows',    element: <WorkflowPage /> },
        ],
      },

      // ── MODULE 12: Analytics & Reporting ──────────────────────────────────
      {
        path: ROUTES.ANALYTICS.ROOT,
        children: [
          { path: 'system-logs',     element: <SystemLogsPage /> },
          { path: 'employee-master', element: <EmployeeMasterReportPage /> },
        ],
      },

      // ── Catch-all 404 (within authenticated shell) ────────────────────────
      { path: '*', element: <NotFound /> },
    ],
  },
]);

// ── App entry point ───────────────────────────────────────────────────────────
const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
