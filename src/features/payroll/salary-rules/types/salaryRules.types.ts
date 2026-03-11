export type SalaryRuleStatus = 'active' | 'inactive';

export interface SalaryRuleType {
  id: string;
  name: string;
  code: string;
  description: string;
  status: SalaryRuleStatus;
}

export interface SalaryRuleForm {
  name: string;
  code: string;
  description: string;
}
