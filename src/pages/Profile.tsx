import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserProfile, UserProgress, QuizResult } from '../types';
import { auth, db } from '../firebase';
import { doc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { User, Target, Trophy, Flame, Settings, LogOut, ChevronRight, Loader2, BookOpen, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { translations, Language } from '../translations';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProfileProps {
  user: UserProfile | null;
  isDarkMode: boolean;
  language: Language;
}

export default function Profile({ user, isDarkMode, language }: ProfileProps) {
  const t = translations[language];
  const [dailyGoal, setDailyGoal] = useState(user?.dailyGoal || 10);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    learnedCount: 0,
    quizCount: 0,
    avgScore: 0
  });
  const [recentQuizzes, setRecentQuizzes] = useState<QuizResult[]>([]);

  useEffect(() => {
    if (user) {
      const fetchStats = async () => {
        // Fetch learned words count
        const progressQ = query(collection(db, 'progress'), where('userId', '==', user.uid), where('status', '==', 'learned'));
        const progressSnap = await getDocs(progressQ);
        
        // Fetch quiz results
        const quizQ = query(collection(db, 'quizResults'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(5));
        const quizSnap = await getDocs(quizQ);
        
        const quizzes = quizSnap.docs.map(doc => doc.data() as QuizResult);
        const totalScore = quizzes.reduce((acc, q) => acc + (q.score / q.totalQuestions), 0);
        
        setStats({
          learnedCount: progressSnap.size,
          quizCount: quizSnap.size,
          avgScore: quizSnap.size > 0 ? Math.round((totalScore / quizSnap.size) * 100) : 0
        });
        setRecentQuizzes(quizzes);
      };
      fetchStats();
    }
  }, [user]);

  const handleUpdateGoal = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { dailyGoal });
      toast.success(t.goalUpdated);
    } catch (error) {
      toast.error(t.goalUpdateFailed);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <User size={32} className="text-stone-400" />
        </div>
        <h2 className="text-3xl font-bold mb-4">{t.pleaseLogin}</h2>
        <p className="text-stone-500 mb-8">{t.loginToTrack}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <section className={cn(
        "p-8 rounded-3xl border flex flex-col md:flex-row items-center gap-8 shadow-xl",
        isDarkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200"
      )}>
        <div className="relative">
          <img
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=10b981&color=fff`}
            alt={user.displayName}
            className="w-32 h-32 rounded-3xl object-cover border-4 border-emerald-100 shadow-lg"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center border-4 border-white dark:border-stone-800 shadow-lg">
            <Trophy size={18} />
          </div>
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-4xl font-bold mb-2">{user.displayName}</h1>
          <p className="text-stone-500 mb-4 font-medium">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="px-4 py-1.5 bg-emerald-100 text-emerald-600 rounded-full text-sm font-bold border border-emerald-200">
              {t.level} {user.level}
            </span>
            <span className="px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full text-sm font-bold border border-blue-200">
              {user.points} {t.points.toUpperCase()}
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Stats Column */}
        <div className="md:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className={cn("p-6 rounded-2xl border", isDarkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200")}>
              <div className="flex items-center gap-3 mb-4 text-emerald-600">
                <BookOpen size={20} />
                <span className="text-sm font-bold uppercase tracking-widest">{t.wordsLearned}</span>
              </div>
              <p className="text-4xl font-bold">{stats.learnedCount}</p>
            </div>
            <div className={cn("p-6 rounded-2xl border", isDarkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200")}>
              <div className="flex items-center gap-3 mb-4 text-blue-600">
                <Brain size={20} />
                <span className="text-sm font-bold uppercase tracking-widest">{t.avgAccuracy}</span>
              </div>
              <p className="text-4xl font-bold">{stats.avgScore}%</p>
            </div>
          </div>

          {/* Recent Activity */}
          <section className={cn("p-8 rounded-3xl border", isDarkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200")}>
            <h3 className="text-2xl font-bold mb-6">{t.recentQuizzes}</h3>
            {recentQuizzes.length === 0 ? (
              <p className="text-stone-500 text-center py-8">{t.noQuizzes}</p>
            ) : (
              <div className="space-y-4">
                {recentQuizzes.map((quiz, idx) => (
                  <div key={idx} className={cn("p-4 rounded-xl border flex items-center justify-between", isDarkMode ? "bg-stone-900/50 border-stone-700" : "bg-stone-50 border-stone-100")}>
                    <div>
                      <p className="font-bold capitalize">
                        {quiz.difficulty === 'easy' ? t.easy : quiz.difficulty === 'medium' ? t.medium : t.hard} {t.quiz}
                      </p>
                      <p className="text-xs text-stone-400">{new Date(quiz.timestamp).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">{quiz.score} / {quiz.totalQuestions}</p>
                      <p className="text-xs font-bold text-stone-400">{Math.round((quiz.score / quiz.totalQuestions) * 100)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Settings Column */}
        <div className="space-y-8">
          <section className={cn("p-8 rounded-3xl border", isDarkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200")}>
            <div className="flex items-center gap-3 mb-6">
              <Target className="text-emerald-600" size={24} />
              <h3 className="text-xl font-bold">{t.dailyGoal}</h3>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-medium">{t.wordsPerDay}</span>
                <span className="text-2xl font-bold text-emerald-600">{dailyGoal}</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(parseInt(e.target.value))}
                className="w-full h-2 bg-stone-100 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <button
                onClick={handleUpdateGoal}
                disabled={loading || dailyGoal === user.dailyGoal}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : t.saveGoal}
              </button>
            </div>
          </section>

          <section className={cn("p-8 rounded-3xl border", isDarkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200")}>
            <div className="flex items-center gap-3 mb-6">
              <Flame className="text-orange-500" size={24} />
              <h3 className="text-xl font-bold">{t.currentStreak}</h3>
            </div>
            <div className="text-center">
              <p className="text-6xl font-black text-orange-500 mb-2">{user.streak}</p>
              <p className="text-stone-500 font-bold uppercase tracking-widest text-sm">{t.daysStreak}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
