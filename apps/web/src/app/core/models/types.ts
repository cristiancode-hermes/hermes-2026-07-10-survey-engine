export interface User {
  id: string;
  name: string;
  email: string;
  organizationId: string;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'closed';
  emoji: string;
  slug: string;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
  organizationId?: string;
  publishedAt?: string;
  settings?: Record<string, any>;
  completionRate?: number;
}

export interface Question {
  id: string;
  surveyId: string;
  type: QuestionType;
  label: string;
  description: string;
  required: boolean;
  options: string[];
  order: number;
  settings: Record<string, unknown>;
}

export type QuestionType =
  | 'text'
  | 'single_choice'
  | 'multiple_choice'
  | 'rating'
  | 'yes_no'
  | 'dropdown'
  | 'nps';

export interface QuestionTypeInfo {
  type: QuestionType;
  label: string;
  icon: string;
  description: string;
}

export const QUESTION_TYPES: QuestionTypeInfo[] = [
  { type: 'text', label: 'Text', icon: 'Aa', description: 'Open text response' },
  { type: 'single_choice', label: 'Single Choice', icon: '○', description: 'Select one option' },
  { type: 'multiple_choice', label: 'Multiple Choice', icon: '☑', description: 'Select multiple options' },
  { type: 'rating', label: 'Rating', icon: '★', description: 'Star rating 1-5 or 1-10' },
  { type: 'yes_no', label: 'Yes/No', icon: '✓', description: 'Binary choice' },
  { type: 'dropdown', label: 'Dropdown', icon: '▼', description: 'Select from dropdown' },
  { type: 'nps', label: 'NPS', icon: '™', description: 'Net Promoter Score 0-10' },
];

export interface SurveyResponse {
  id: string;
  surveyId: string;
  respondentId: string | null;
  answers: Answer[];
  completedAt: string;
  timeToComplete: number;
}

export interface Answer {
  questionId: string;
  value: string | string[] | number;
}

export interface SurveyResults {
  surveyId: string;
  totalResponses: number;
  completionRate: number;
  npsScore: number | null;
  questions: QuestionResult[];
}

export interface QuestionResult {
  questionId: string;
  type: QuestionType;
  label: string;
  totalAnswers: number;
  distribution: Record<string, number>;
  average: number | null;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  emoji: string;
  questions: Omit<Question, 'id' | 'surveyId' | 'order'>[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
