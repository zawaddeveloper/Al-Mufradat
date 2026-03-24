import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Word, UserProfile, UserProgress } from '../types';
import { getWords, getUserProgress, markWordAsLearned } from '../services/wordService';
import WordCard from '../components/WordCard';
import { Search, Filter, BookOpen, CheckCircle, Brain, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Language, translations } from '../translations';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LearnProps {
  user: UserProfile | null;
  isDarkMode: boolean;
  language: Language;
}

export default function Learn({ user, isDarkMode, language }: LearnProps) {
  const t = translations[language];
  const [words, setWords] = useState<Word[]>([]);
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'learned' | 'unlearned'>('all');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const fetchedWords = await getWords();
      setWords(fetchedWords);
      
      if (user) {
        const fetchedProgress = await getUserProgress(user.uid);
        setProgress(fetchedProgress);
      } else {
        // Load from localStorage for guests
        const localProgress = localStorage.getItem('guest_progress');
        if (localProgress) {
          setProgress(JSON.parse(localProgress));
        }
      }
      setLoading(false);
    };

    loadData();
  }, [user]);

  const filteredWords = words.filter(word => {
    const matchesSearch = 
      word.arabic.includes(searchTerm) || 
      word.english.toLowerCase().includes(searchTerm.toLowerCase()) || 
      word.bangla.includes(searchTerm);
    
    const isLearned = !!progress[word.id];
    if (filter === 'learned') return matchesSearch && isLearned;
    if (filter === 'unlearned') return matchesSearch && !isLearned;
    return matchesSearch;
  });

  const handleMarkLearned = async (wordId: string) => {
    if (user) {
      const success = await markWordAsLearned(user.uid, wordId);
      if (success) {
        setProgress(prev => ({
          ...prev,
          [wordId]: { userId: user.uid, wordId, status: 'learned' }
        }));
        toast.success(t.wordMarkedLearned);
      }
    } else {
      // Guest mode
      const newProgress = {
        ...progress,
        [wordId]: { userId: 'guest', wordId, status: 'learned' }
      };
      setProgress(newProgress);
      localStorage.setItem('guest_progress', JSON.stringify(newProgress));
      toast.success(t.wordMarkedGuest);
    }
  };

  const nextWord = () => {
    if (currentIndex < filteredWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
        <p className="text-stone-500 font-medium">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentIndex(0);
            }}
            className={cn(
              "w-full pl-12 pr-4 py-3 rounded-2xl border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none",
              isDarkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200"
            )}
          />
        </div>

        <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
          {(['all', 'unlearned', 'learned'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setCurrentIndex(0);
              }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all",
                filter === f 
                  ? "bg-white dark:bg-stone-700 text-emerald-600 shadow-sm" 
                  : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
              )}
            >
              {f === 'all' ? t.all : 
               f === 'learned' ? t.wordsLearned : 
               t.unlearned}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('card')}
            className={cn(
              "p-2 rounded-lg transition-all",
              viewMode === 'card' ? "bg-white dark:bg-stone-700 text-emerald-600 shadow-sm" : "text-stone-400"
            )}
          >
            <BookOpen size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-lg transition-all",
              viewMode === 'list' ? "bg-white dark:bg-stone-700 text-emerald-600 shadow-sm" : "text-stone-400"
            )}
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {filteredWords.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-stone-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{t.noWordsFound}</h3>
            <p className="text-stone-500">{t.adjustSearch}</p>
          </motion.div>
        ) : viewMode === 'card' ? (
          <div className="relative">
            <WordCard
              word={filteredWords[currentIndex]}
              isLearned={!!progress[filteredWords[currentIndex].id]}
              onMarkLearned={handleMarkLearned}
              isDarkMode={isDarkMode}
              onNext={nextWord}
              onPrev={prevWord}
              showNavigation={filteredWords.length > 1}
              language={language}
            />
            <div className="text-center mt-6 text-stone-500 font-medium">
              {t.wordCounter} {currentIndex + 1} {t.of} {filteredWords.length}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWords.map((word) => (
              <motion.div
                key={word.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "p-6 rounded-2xl border group hover:shadow-lg transition-all cursor-pointer",
                  isDarkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200"
                )}
                onClick={() => {
                  const idx = filteredWords.findIndex(w => w.id === word.id);
                  setCurrentIndex(idx);
                  setViewMode('card');
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-right">
                    <h3 className="text-3xl font-bold text-emerald-600 font-arabic mb-2" dir="rtl">{word.arabic}</h3>
                    {word.type && (
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        word.type === 'noun' ? "bg-blue-100 text-blue-700" : 
                        word.type === 'verb' ? "bg-orange-100 text-orange-700" : 
                        "bg-purple-100 text-purple-700"
                      )}>
                        {word.type === 'noun' ? t.noun : word.type === 'verb' ? t.verb : t.preposition}
                      </span>
                    )}
                  </div>
                  {progress[word.id] && <CheckCircle size={20} className="text-emerald-500 mt-2" />}
                </div>
                <p className={cn(
                  "text-lg font-bold",
                  language === 'bn' ? "font-bengali" : ""
                )}>
                  {language === 'en' ? word.english : word.bangla}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
