// User Profile Types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferences: {
    theme: 'dark' | 'light';
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Quiz Types
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  questions: QuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  answers: number[];
  score: number;
  totalQuestions: number;
  completedAt: Date;
}

// Quiz Score History Types
export interface QuizScore {
  id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: Date;
}

// Store Types
export interface UserProfileStore {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export interface QuizzesStore {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  currentAttempt: QuizAttempt | null;
  isLoading: boolean;
  error: string | null;
}

export interface QuizScoresStore {
  scoreHistory: QuizScore[];
  isLoading: boolean;
  error: string | null;
}
