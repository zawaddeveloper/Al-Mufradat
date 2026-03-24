import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Word, UserProfile } from '../types';
import { getWords, saveQuizResult } from '../services/wordService';
import { Brain, Trophy, ArrowRight, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface QuizProps {
  user: UserProfile | null;
  isDarkMode: boolean;
}

interface Question {
  id: string;
  word: Word;
  options: string[];
  correctAnswer: string;
  type: 'arabic-to-english' | 'english-to-arabic' | 'arabic-to-bangla';
}

export default function Quiz({ user, isDarkMode }: QuizProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  useEffect(() => {
    const loadWords = async () => {
      const fetchedWords = await getWords();
      setWords(fetchedWords);
      setLoading(false);
    };
    loadWords();
  }, []);

  const generateQuiz = (diff: 'easy' | 'medium' | 'hard') => {
    if (words.length < 4) return;

    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const selectedWords = shuffled.slice(0, 10);
    
    const newQuestions: Question[] = selectedWords.map(word => {
      const type = diff === 'easy' ? 'arabic-to-english' : diff === 'medium' ? 'arabic-to-bangla' : 'english-to-arabic';
      
      let correctAnswer = '';
      let options: string[] = [];

      if (type === 'arabic-to-english') {
        correctAnswer = word.english;
        options = [correctAnswer, ...shuffled.filter(w => w.id !== word.id).slice(0, 3).map(w => w.english)];
      } else if (type === 'arabic-to-bangla') {
        correctAnswer = word.bangla;
        options = [correctAnswer, ...shuffled.filter(w => w.id !== word.id).slice(0, 3).map(w => w.bangla)];
      } else {
        correctAnswer = word.arabic;
        options = [correctAnswer, ...shuffled.filter(w => w.id !== word.id).slice(0, 3).map(w => w.arabic)];
      }

      return {
        id: word.id,
        word,
        correctAnswer,
        options: options.sort(() => 0.5 - Math.random()),
        type
      };
    });

    setQuestions(newQuestions);
    setQuizStarted(true);
    setCurrentQuestionIdx(0);
    setScore(0);
    setQuizFinished(false);
    setIsAnswered(false);
    setSelectedOption(null);
  };

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (option === questions[currentQuestionIdx].correctAnswer) {
      setScore(prev => prev + 1);
      toast.success('Correct!');
    } else {
      toast.error(`Incorrect! The answer was ${questions[currentQuestionIdx].correctAnswer}`);
    }
  };

  const nextQuestion = async () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setIsAnswered(false);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
      if (user) {
        await saveQuizResult(user.uid, score, questions.length, difficulty);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
        <p className="text-stone-500 font-medium">Preparing quiz...</p>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "max-w-2xl mx-auto p-10 rounded-3xl border text-center shadow-xl",
          isDarkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200"
        )}
      >
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <Brain size={40} />
        </div>
        <h2 className="text-3xl font-bold mb-4">Ready for a Quiz?</h2>
        <p className="text-stone-500 mb-10 text-lg">Test your knowledge of the most common Quranic words and earn XP points.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={cn(
                "px-6 py-4 rounded-xl border font-bold capitalize transition-all",
                difficulty === d 
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                  : isDarkMode ? "border-stone-700 hover:bg-stone-700" : "border-stone-200 hover:bg-stone-50"
              )}
            >
              {d}
            </button>
          ))}
        </div>

        <button
          onClick={() => generateQuiz(difficulty)}
          className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
        >
          Start Quiz Now
        </button>
      </motion.div>
    );
  }

  if (quizFinished) {
    const percentage = (score / questions.length) * 100;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "max-w-2xl mx-auto p-10 rounded-3xl border text-center shadow-xl",
          isDarkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200"
        )}
      >
        <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-yellow-50">
          <Trophy size={48} />
        </div>
        <h2 className="text-4xl font-bold mb-2">Quiz Completed!</h2>
        <p className="text-stone-500 mb-8 text-lg">Great job! You've earned some valuable XP.</p>
        
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className={cn("p-6 rounded-2xl border", isDarkMode ? "bg-stone-900/50 border-stone-700" : "bg-stone-50 border-stone-100")}>
            <p className="text-stone-400 text-sm font-bold uppercase tracking-wider mb-1">Score</p>
            <p className="text-4xl font-bold text-emerald-600">{score} / {questions.length}</p>
          </div>
          <div className={cn("p-6 rounded-2xl border", isDarkMode ? "bg-stone-900/50 border-stone-700" : "bg-stone-50 border-stone-100")}>
            <p className="text-stone-400 text-sm font-bold uppercase tracking-wider mb-1">Accuracy</p>
            <p className="text-4xl font-bold text-blue-600">{percentage}%</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => setQuizStarted(false)}
            className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            Try Another Quiz
          </button>
          <button
            onClick={() => generateQuiz(difficulty)}
            className={cn("flex-1 py-4 rounded-xl font-bold border transition-all flex items-center justify-center gap-2", isDarkMode ? "border-stone-700 hover:bg-stone-700" : "border-stone-200 hover:bg-stone-50")}
          >
            <RefreshCw size={20} />
            Retake This Quiz
          </button>
        </div>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-stone-400 uppercase tracking-widest">Question {currentQuestionIdx + 1} of {questions.length}</span>
          <span className="text-sm font-bold text-emerald-600">{score} Points</span>
        </div>
        <div className="h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
            className="h-full bg-emerald-500"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className={cn(
            "p-10 rounded-3xl border shadow-xl",
            isDarkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200"
          )}
        >
          <div className="text-center mb-12">
            <p className="text-stone-400 text-sm font-bold uppercase tracking-widest mb-4">
              {currentQuestion.type === 'arabic-to-english' || currentQuestion.type === 'arabic-to-bangla' 
                ? 'What is the meaning of this word?' 
                : 'Which Arabic word means this?'}
            </p>
            <h2 className={cn(
              "text-6xl md:text-7xl font-bold mb-4",
              currentQuestion.type === 'arabic-to-english' || currentQuestion.type === 'arabic-to-bangla' 
                ? "text-emerald-600 font-arabic" 
                : "text-stone-900 dark:text-white"
            )} dir={currentQuestion.type.startsWith('arabic') ? 'rtl' : 'ltr'}>
              {currentQuestion.type.startsWith('arabic') ? currentQuestion.word.arabic : currentQuestion.word.english}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-10">
            {currentQuestion.options.map((option, idx) => {
              const isCorrect = option === currentQuestion.correctAnswer;
              const isSelected = option === selectedOption;
              
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isAnswered}
                  className={cn(
                    "w-full p-5 rounded-2xl border-2 text-left text-lg font-bold transition-all flex items-center justify-between group",
                    !isAnswered && (isDarkMode ? "border-stone-700 hover:border-emerald-500 hover:bg-stone-700" : "border-stone-100 hover:border-emerald-500 hover:bg-emerald-50/50"),
                    isAnswered && isCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
                    isAnswered && isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600",
                    isAnswered && !isSelected && !isCorrect && "opacity-50 grayscale border-stone-100 dark:border-stone-700"
                  )}
                >
                  <span className={cn(currentQuestion.type === 'english-to-arabic' && "font-arabic text-2xl")} dir={currentQuestion.type === 'english-to-arabic' ? 'rtl' : 'ltr'}>
                    {option}
                  </span>
                  {isAnswered && isCorrect && <CheckCircle size={24} className="text-emerald-500" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle size={24} className="text-red-500" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={nextQuestion}
              className="w-full py-4 bg-stone-900 dark:bg-emerald-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-stone-800 dark:hover:bg-emerald-700 transition-all active:scale-95"
            >
              {currentQuestionIdx === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              <ArrowRight size={20} />
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
