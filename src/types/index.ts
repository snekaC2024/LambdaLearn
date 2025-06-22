export interface User {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'student';
  createdAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  questions: Question[];
  isActive: boolean;
  timeLimit?: number; // in minutes
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  answers: Record<string, number>;
  score: number;
  totalPoints: number;
  submittedAt: string;
  timeSpent: number; // in seconds
}

export interface QuizSession {
  id: string;
  quizId: string;
  teacherId: string;
  isLive: boolean;
  startedAt?: string;
  participants: string[];
  submissions: QuizSubmission[];
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}