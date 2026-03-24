import { motion } from 'motion/react';
import { Word } from '../types';
import { BookOpen, CheckCircle, Volume2, ChevronRight, ChevronLeft } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Language, translations } from '../translations';

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
  language: Language;
}

export default function WordCard({ 
  word, 
  isLearned, 
  onMarkLearned, 
  isDarkMode,
  onNext,
  onPrev,
  showNavigation = false,
  language
}: WordCardProps) {
  const t = translations[language];

  const highlightArabic = (text: string, highlight?: string) => {
    if (!highlight || !text.includes(highlight)) return text;
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedHighlight})`, 'g'));
    return (
      <>
        {parts.map((part, i) => 
          part === highlight ? (
            <span key={i} className="bg-emerald-600 text-white px-2 py-0.5 rounded-md shadow-sm mx-0.5">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

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
          {t.learned}
        </div>
      )}

      {/* Arabic Word */}
      <div className="text-center mb-6">
        <h2 className="text-7xl md:text-8xl font-bold mb-2 text-emerald-600 leading-relaxed font-arabic" dir="rtl">
          {word.arabic}
        </h2>
        
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          {word.type && (
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
              word.type === 'noun' ? "bg-blue-100 text-blue-700" : 
              word.type === 'verb' ? "bg-orange-100 text-orange-700" : 
              "bg-purple-100 text-purple-700"
            )}>
              {word.type === 'noun' ? t.noun : word.type === 'verb' ? t.verb : t.preposition}
            </span>
          )}
          {word.frequency && (
            <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-bold">
              {t.frequency}: {word.frequency} {t.times}
            </span>
          )}
        </div>

        {language === 'en' && (
          <p className="text-stone-400 text-lg italic font-medium">
            {word.transliteration}
          </p>
        )}
      </div>

      {/* Meanings */}
      <div className="mb-8">
        {language === 'en' ? (
          <div className={cn("p-6 rounded-2xl border text-center", isDarkMode ? "bg-stone-900/50 border-stone-700" : "bg-stone-50 border-stone-100")}>
            <p className="text-2xl font-bold">{word.english}</p>
          </div>
        ) : (
          <div className={cn("p-6 rounded-2xl border text-center", isDarkMode ? "bg-stone-900/50 border-stone-700" : "bg-stone-50 border-stone-100")}>
            <p className="text-2xl font-bold font-bengali">{word.bangla}</p>
          </div>
        )}
      </div>

      {/* Example Ayah */}
      {word.exampleArabic && (
        <div className={cn("p-8 rounded-2xl border mb-10", isDarkMode ? "bg-stone-900/30 border-stone-700" : "bg-emerald-50/30 border-emerald-100")}>
          <div className="flex items-center gap-2 text-emerald-600 font-bold mb-6">
            <BookOpen size={20} />
            <span>{t.exampleFromQuran}</span>
          </div>
          <p className="text-3xl md:text-4xl font-medium text-right leading-loose mb-8 font-arabic" dir="rtl">
            {highlightArabic(word.exampleArabic, word.highlightWord)}
          </p>
          <div className="space-y-3">
            {language === 'en' ? (
              <p className="text-stone-500 italic text-sm border-l-2 border-emerald-200 pl-4">
                {word.exampleEnglish}
              </p>
            ) : (
              <p className="text-stone-500 italic text-sm border-l-2 border-emerald-200 pl-4 font-bengali">
                {word.exampleBangla}
              </p>
            )}
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
          {isLearned ? t.learned : t.markAsLearned}
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
