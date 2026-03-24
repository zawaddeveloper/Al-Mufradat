import { db, auth } from '../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  updateDoc, 
  increment,
  Timestamp
} from 'firebase/firestore';
import { Word, UserProgress, UserProfile, OperationType } from '../types';
import wordsData from '../data/words.json';

const WORDS_COLLECTION = 'words';
const PROGRESS_COLLECTION = 'progress';
const USERS_COLLECTION = 'users';

export const seedWords = async () => {
  const snapshot = await getDocs(collection(db, WORDS_COLLECTION));
  if (snapshot.empty) {
    console.log('Seeding words to Firestore...');
    for (const word of wordsData) {
      await setDoc(doc(db, WORDS_COLLECTION, word.id), word);
    }
  }
};

export const getWords = async (): Promise<Word[]> => {
  try {
    const snapshot = await getDocs(collection(db, WORDS_COLLECTION));
    if (snapshot.empty) {
      await seedWords();
      const newSnapshot = await getDocs(collection(db, WORDS_COLLECTION));
      return newSnapshot.docs.map(doc => doc.data() as Word);
    }
    return snapshot.docs.map(doc => doc.data() as Word);
  } catch (error) {
    console.error('Error fetching words:', error);
    return wordsData as Word[]; // Fallback to local data
  }
};

export const getUserProgress = async (userId: string): Promise<Record<string, UserProgress>> => {
  try {
    const q = query(collection(db, PROGRESS_COLLECTION), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const progress: Record<string, UserProgress> = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data() as UserProgress;
      progress[data.wordId] = data;
    });
    return progress;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return {};
  }
};

export const markWordAsLearned = async (userId: string, wordId: string) => {
  try {
    const progressId = `${userId}_${wordId}`;
    const progressRef = doc(db, PROGRESS_COLLECTION, progressId);
    
    await setDoc(progressRef, {
      userId,
      wordId,
      status: 'learned',
      lastReviewed: new Date().toISOString()
    });

    // Update user points and streak
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      points: increment(10),
      lastActive: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error marking word as learned:', error);
    return false;
  }
};

export const saveQuizResult = async (userId: string, score: number, total: number, difficulty: string) => {
  try {
    const resultRef = doc(collection(db, 'quizResults'));
    await setDoc(resultRef, {
      userId,
      score,
      totalQuestions: total,
      difficulty,
      timestamp: new Date().toISOString()
    });

    // Award points for quiz
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      points: increment(score * 5),
      lastActive: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error saving quiz result:', error);
    return false;
  }
};
