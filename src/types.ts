export interface Word {
  id: string;
  arabic: string;
  english: string;
  bangla: string;
  exampleArabic?: string;
  exampleEnglish?: string;
  exampleBangla?: string;
  transliteration?: string;
  frequency?: number;
  type?: 'noun' | 'verb' | 'preposition';
  highlightWord?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  streak: number;
  points: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  dailyGoal: number;
  lastActive?: string;
  role?: 'user' | 'admin';
}

export interface UserProgress {
  userId: string;
  wordId: string;
  status: 'learned' | 'learning' | 'review';
  lastReviewed?: string;
}

export interface QuizResult {
  userId: string;
  score: number;
  totalQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timestamp: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
