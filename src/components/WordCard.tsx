import { motion } from 'motion/react';
import { Word } from '../types';
import { BookOpen, CheckCircle, Volume2, ChevronRight, ChevronLeft } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WordCardProps {
  word: Word;
  isLearned: boolean;
  onMarkLearned: (wordId: string) => void;
  isDarkMode: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  showNavigation?: boolean;
}

export default function WordCard({ 
  word, 
  isLearned, 
  onMarkLearned, 
  isDarkMode,
  onNext,
  onPrev,
  showNavigation = false
}: WordCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "relative w-full max-w-2xl mx-auto p-8 rounded-3xl border shadow-xl transition-all",
        isDarkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200"
      )}
    >
      {/* Learned Badge */}
      {isLearned && (
        <div className="absolute top-6 right-6 flex items-center gap-1 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          <CheckCircle size={16} />
          Learned
        </div>
      )}

      {/* Arabic Word */}
      <div className="text-center mb-10">
        <h2 className="text-7xl md:text-8xl font-bold mb-4 text-emerald-600 leading-relaxed font-arabic" dir="rtl">
          {word.arabic}
        </h2>
        <p className="text-stone-400 text-lg italic font-medium">
          {word.transliteration}
        </p>
      </div>

      {/* Meanings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className={cn("p-6 rounded-2xl border", isDarkMode ? "bg-stone-900/50 border-stone-700" : "bg-stone-50 border-stone-100")}>
          <p className="text-xs uppercase tracking-widest text-stone-400 font-bold mb-2">English</p>
          <p className="text-2xl font-bold">{word.english}</p>
        </div>
        <div className={cn("p-6 rounded-2xl border", isDarkMode ? "bg-stone-900/50 border-stone-700" : "bg-stone-50 border-stone-100")}>
          <p className="text-xs uppercase tracking-widest text-stone-400 font-bold mb-2">Bangla</p>
          <p className="text-2xl font-bold font-bengali">{word.bangla}</p>
        </div>
      </div>

      {/* Example Ayah */}
      {word.exampleArabic && (
        <div className={cn("p-8 rounded-2xl border mb-10", isDarkMode ? "bg-stone-900/30 border-stone-700" : "bg-emerald-50/30 border-emerald-100")}>
          <div className="flex items-center gap-2 text-emerald-600 font-bold mb-4">
            <BookOpen size={20} />
            <span>Example from Quran</span>
          </div>
          <p className="text-2xl md:text-3xl font-medium text-right leading-loose mb-6 font-arabic" dir="rtl">
            {word.exampleArabic}
          </p>
          <div className="space-y-3">
            <p className="text-stone-500 italic text-sm border-l-2 border-emerald-200 pl-4">
              {word.exampleEnglish}
            </p>
            <p className="text-stone-500 italic text-sm border-l-2 border-emerald-200 pl-4 font-bengali">
              {word.exampleBangla}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <button
          onClick={() => onMarkLearned(word.id)}
          disabled={isLearned}
          className={cn(
            "w-full md:w-auto px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
            isLearned 
              ? "bg-stone-100 text-stone-400 cursor-default" 
              : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20 active:scale-95"
          )}
        >
          <CheckCircle size={20} />
          {isLearned ? 'Learned' : 'Mark as Learned'}
        </button>

        {showNavigation && (
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={onPrev}
              className={cn("flex-1 md:flex-none p-4 rounded-xl border transition-colors", isDarkMode ? "border-stone-700 hover:bg-stone-700" : "border-stone-200 hover:bg-stone-100")}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={onNext}
              className={cn("flex-1 md:flex-none p-4 rounded-xl border transition-colors", isDarkMode ? "border-stone-700 hover:bg-stone-700" : "border-stone-200 hover:bg-stone-100")}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
