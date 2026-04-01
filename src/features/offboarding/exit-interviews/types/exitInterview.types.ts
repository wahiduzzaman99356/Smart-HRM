export type InterviewStatus = 'Scheduled' | 'Pending' | 'Completed' | 'Cancelled';

export type InterviewResponses = {
  reasons: string;
  policyImprovement: string;
  orgImprovement: string;
  additionalComments: string;
  separationRequests: string;
  overallExperienceRating: number;
  wouldRecommend: boolean | null;
  workLifeRating: number;
  compensationRating: number;
  managementRating: number;
  overallRatingFinal: number;
  wouldRecommendFinal: boolean | null;
  hrNotes: string;
};

export type ExitInterview = {
  id: string;
  employeeName: string;
  initials: string;
  employeeId: string;
  department: string;
  date: string;
  interviewer: string;
  reason: string;
  status: InterviewStatus;
  recommend?: boolean;
  rating?: number;
  quote?: string;
  responses?: InterviewResponses;
};
