export type QuestionStatus = 'active' | 'draft' | 'archived';
export type QuestionType = 'MCQ' | 'MULTISELECT' | 'DESCRIPTIVE' | 'TRUE_FALSE' | 'SHORT_QUESTION' | 'LONG_QUESTION' | 'FILE_UPLOAD';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface QuestionCreator {
  name: string;
  initials: string;
  color: string;
}

export interface QuestionPerformance {
  used: number;
  successRate: number;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  topic: string;
  targetRole: string;
  department: string;
  difficulty: DifficultyLevel;
  status: QuestionStatus;
  createdBy: QuestionCreator;
  createdAt: string;
  performance: QuestionPerformance;
}

export interface QuestionFilters {
  subject: string;
  questionType: string;
  difficulty: string;
  fromDate: string;
  toDate: string;
}
