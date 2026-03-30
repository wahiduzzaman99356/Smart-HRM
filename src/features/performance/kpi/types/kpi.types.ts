/**
 * kpi.types.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Type definitions for the Performance Management – KPI module.
 */

export type KpiFrequency = 'Monthly' | 'Quarterly' | 'Bi-Annual' | 'Annual';

export type KpiOperator = '>' | '<' | '=' | '>=' | '<=';

export interface MainKpi {
  id: string;
  name: string;
  code: string;
  /** Designation names tagged to this KPI */
  taggedDesignations: string[];
  /** Number of sub-KPIs linked to this main KPI */
  subKpiCount: number;
}

export interface SubKpi {
  id: string;
  name: string;
  mainKpiId: string;
  frequency: KpiFrequency;
  operator: KpiOperator;
  targetValue: number;
  responsibleDesignation: string;
}

export interface MainKpiForm {
  name: string;
  code: string;
  taggedDesignations: string[];
}

export interface SubKpiForm {
  name: string;
  mainKpiId: string;
  frequency: KpiFrequency | '';
  operator: KpiOperator | '';
  targetValue: string;
  responsibleDesignation: string;
}
