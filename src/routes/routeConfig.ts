/**
 * routeConfig.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Single source of truth for every URL path in the application.
 *
 * Rules:
 *  - Root-level paths (auth, portal, dashboard) are full absolute paths.
 *  - Feature sub-paths are expressed as FULL paths so they can be used both
 *    in <Link to={ROUTES.X}> and programmatic navigate(ROUTES.X) without
 *    needing to reconstruct the hierarchy at call sites.
 *  - Dynamic segments use the `:param` convention that React Router v6 expects.
 *
 * Usage:
 *   import { ROUTES } from '@/routes/routeConfig';
 *   <Link to={ROUTES.CORE_HR.EMPLOYEES} />
 *   navigate(ROUTES.RECRUITMENT.JOB_POSTING_DETAIL.replace(':id', jobId));
 */

export const ROUTES = {
  // ── Public ────────────────────────────────────────────────────────────────
  LOGIN:            '/auth/login',
  FORGOT_PASSWORD:  '/auth/forgot-password',

  /** Standalone public job-portal (separate PortalLayout) */
  PORTAL:           '/portal',

  // ── Authenticated root ────────────────────────────────────────────────────
  DASHBOARD: '/dashboard',

  // ── MODULE 1: Core HR & Employee Data ─────────────────────────────────────
  CORE_HR: {
    ROOT:               'core-hr',                          // relative — used as parent in router
    ORGANOGRAM:         '/core-hr/organogram',
    EMPLOYEES:          '/core-hr/employees',
    EMPLOYEE_DETAIL:    '/core-hr/employees/:id',
    EMPLOYEE_LIFECYCLE: '/core-hr/employees/:id/lifecycle',
    MANPOWER_HEADCOUNT: '/core-hr/manpower-headcount',
    REQUISITION:        '/core-hr/requisition',
    TEMPLATES:          '/core-hr/templates',
    POLICIES:           '/core-hr/policies',
    NOTICES:            '/core-hr/notices',
  },

  // ── MODULE 2: Recruitment & ATS ───────────────────────────────────────────
  RECRUITMENT: {
    ROOT:                  'recruitment',
    CV_BANK:               '/recruitment/cv-bank',
    JOB_POSTINGS:          '/recruitment/job-postings',
    JOB_POSTING_DETAIL:    '/recruitment/job-postings/:id',
    SOURCING:              '/recruitment/sourcing',
    CANDIDATE_PROCESSING:  '/recruitment/candidates',
    SHORTLISTING:          '/recruitment/shortlisting',
    ASSESSMENT:            '/recruitment/assessment',
    INTERVIEW:             '/recruitment/interview',
    EVALUATION:            '/recruitment/evaluation',
    OFFERS:                '/recruitment/offers',
    HIRING:                '/recruitment/hiring',
  },

  // ── MODULE 3: Onboarding ──────────────────────────────────────────────────
  ONBOARDING: {
    ROOT:                   'onboarding',
    CANDIDATE_TO_EMPLOYEE:  '/onboarding/candidate-to-employee',
    SELF_SERVICE:           '/onboarding/self-service',
    CONFIRMATION:           '/onboarding/confirmation',
  },

  // ── MODULE 4: Employee Relations ──────────────────────────────────────────
  EMPLOYEE_RELATIONS: {
    ROOT:          'employee-relations',
    COMPLIANCE:    '/employee-relations/compliance',
    INVESTIGATION: '/employee-relations/investigation',
    SURVEYS:       '/employee-relations/surveys',
    RECOGNITION:   '/employee-relations/recognition',
  },

  // ── MODULE 5: Attendance, Adjustment & Leave ──────────────────────────────
  ATTENDANCE: {
    ROOT:         'attendance',
    TIME_CAPTURE: '/attendance/time-capture',
    OUTSTATION:   '/attendance/outstation',
    LEAVE:        '/attendance/leave',
    SCHEDULING:   '/attendance/scheduling',
    ADJUSTMENTS:  '/attendance/adjustments',
  },

  // ── MODULE 6: Payroll & Compensation & Benefits ───────────────────────────
  PAYROLL: {
    ROOT:                 'payroll',
    SALARY_GENERATION:    '/payroll/salary-generation',
    BONUS:                '/payroll/bonus',
    SALARY_CERTIFICATE:   '/payroll/salary-certificate',
    INCOME_TAX:           '/payroll/income-tax',
    FOC:                  '/payroll/foc',
    PROVIDENT_FUND:       '/payroll/provident-fund',
    GRATUITY_FUND:        '/payroll/gratuity-fund',
    MEDICAL_BENEFIT:      '/payroll/medical-benefit',
    MEALS:                '/payroll/meals',
    LOANS:                '/payroll/loans',
    ADVANCES:             '/payroll/advances',
    SALARY_SETTINGS:      '/payroll/salary-settings',
    OVERTIME:             '/payroll/overtime',
    EXPENSE_APPLICATION:  '/payroll/expense-application',
    PAYMENT_ACCOUNTS:     '/payroll/payment-accounts',
  },

  // ── MODULE 7: Asset Management ────────────────────────────────────────────
  ASSETS: {
    ROOT:         'assets',
    IT_EQUIPMENT: '/assets/it-equipment',
    STATIONERY:   '/assets/stationery',
  },

  // ── MODULE 8: Performance Management ─────────────────────────────────────
  PERFORMANCE: {
    ROOT:      'performance',
    GOALS_OKR: '/performance/goals-okr',
    KPI:       '/performance/kpi',
  },

  // ── MODULE 9: Training & L&D ──────────────────────────────────────────────
  TRAINING: {
    ROOT:         'training',
    REQUISITIONS: '/training/requisitions',
    PROGRAMS:     '/training/programs',
    APPROVAL:     '/training/approval',
  },

  // ── MODULE 10: Offboarding ────────────────────────────────────────────────
  OFFBOARDING: {
    ROOT:       'offboarding',
    SEPARATION: '/offboarding/separation',
  },

  // ── MODULE 11: System Administration ─────────────────────────────────────
  SYSTEM_ADMIN: {
    ROOT:         'system-admin',
    DEVICE_SETUP: '/system-admin/device-setup',
    FLEET:        '/system-admin/fleet',
    WORKFLOWS:    '/system-admin/workflows',
  },

  // ── MODULE 12: Analytics & Reporting ─────────────────────────────────────
  ANALYTICS: {
    ROOT:            'analytics',
    SYSTEM_LOGS:     '/analytics/system-logs',
    EMPLOYEE_MASTER: '/analytics/employee-master',
  },
} as const;

// ── Helper: build a detail URL from a pattern + id ───────────────────────────
export const buildRoute = (pattern: string, params: Record<string, string>): string =>
  Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, value),
    pattern,
  );
