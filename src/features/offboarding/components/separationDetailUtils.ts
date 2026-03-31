import type {
  SeparationRequest,
  SeparationWorkflowStage,
  TimelineEvent,
} from '@/features/offboarding/separation-requests/types/separation.types';

export const SEPARATION_PROGRESS_STEPS: SeparationWorkflowStage[] = [
  'Submitted',
  'Under Review',
  'Clearance',
  'Settlement',
  'Completed',
];

function getRequestDate(submissionDate: string) {
  return submissionDate.split(';')[0]?.trim() || 'N/A';
}

export function getSeparationTimeline(record: SeparationRequest): TimelineEvent[] {
  if (record.activityTimeline?.length) {
    return record.activityTimeline;
  }

  return [
    {
      action: record.modeOfSeparation === 'Resignation' ? 'Resignation submitted' : 'Separation request created',
      by: record.modeOfSeparation === 'Resignation' ? record.empName : 'HR Admin',
      date: getRequestDate(record.resignationSubmissionDate),
    },
  ];
}

export function getWorkflowStage(record: SeparationRequest): SeparationWorkflowStage {
  if (record.workflowStage) {
    return record.workflowStage;
  }

  if (record.status === 'Completed') {
    return 'Completed';
  }

  if (record.status === 'In Progress' || record.status === 'On Hold') {
    return 'Under Review';
  }

  return 'Submitted';
}

export function getWorkflowStageIndex(record: SeparationRequest) {
  return SEPARATION_PROGRESS_STEPS.indexOf(getWorkflowStage(record));
}

export function shouldShowFinalDecision(record: SeparationRequest) {
  return getWorkflowStageIndex(record) >= SEPARATION_PROGRESS_STEPS.indexOf('Settlement');
}