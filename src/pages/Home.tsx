import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { Trophy, Flame, Target, ArrowRight, BookOpen, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HomeProps {
  user: UserProfile | null;
  isDarkMode: boolean;
}

export default function Home({ user, isDarkMode }: HomeProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-emerald-600 p-8 md:p-12 text-white shadow-2xl shadow-emerald-600/20">
        <div className="relative z-10 max-w-2xl">
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-4">
            {user ? `Assalamu Alaikum, ${user.displayName?.split(' ')[0]}!` : 'Master Quranic Vocabulary'}
          </motion.h1>
          <motion.p variants={itemVariants} className="text-emerald-50 text-lg mb-8">
            Learn the most common words in the Quran through interactive lessons and adaptive quizzes.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            <Link
              to="/learn"
              className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-50 transition-colors"
            >
              Start Learning <ArrowRight size={20} />
            </Link>
            {!user && (
              <Link
                to="/login"
                className="px-6 py-3 bg-emerald-700/50 text-white rounded-xl font-bold border border-emerald-400/30 hover:bg-emerald-700/70 transition-colors"
              >
                Create Account
              </Link>
            )}
          </motion.div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-emerald-700 rounded-full blur-3xl opacity-50" />
      </section>

      {/* Stats Grid */}
      {user && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            variants={itemVariants}
            className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-200'} shadow-sm`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                <Flame size={24} />
              </div>
              <div>
                <p className="text-sm text-stone-500 font-medium">Daily Streak</p>
                <p className="text-2xl font-bold">{user.streak} Days</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-200'} shadow-sm`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <Trophy size={24} />
              </div>
              <div>
                <p className="text-sm text-stone-500 font-medium">Total Points</p>
                <p className="text-2xl font-bold">{user.points} XP</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-200'} shadow-sm`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <Target size={24} />
              </div>
              <div>
                <p className="text-sm text-stone-500 font-medium">Daily Goal</p>
                <p className="text-2xl font-bold">{user.dailyGoal} Words</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          variants={itemVariants}
          className={`group p-8 rounded-3xl border transition-all hover:shadow-xl ${isDarkMode ? 'bg-stone-800 border-stone-700 hover:border-emerald-500/50' : 'bg-white border-stone-200 hover:border-emerald-500/50'}`}
        >
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <BookOpen size={28} />
          </div>
          <h3 className="text-2xl font-bold mb-2">Continue Learning</h3>
          <p className="text-stone-500 mb-6">Explore new words and their meanings in Arabic, English, and Bangla.</p>
          <Link
            to="/learn"
            className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all"
          >
            Go to Lessons <ArrowRight size={18} />
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className={`group p-8 rounded-3xl border transition-all hover:shadow-xl ${isDarkMode ? 'bg-stone-800 border-stone-700 hover:border-blue-500/50' : 'bg-white border-stone-200 hover:border-blue-500/50'}`}
        >
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Brain size={28} />
          </div>
          <h3 className="text-2xl font-bold mb-2">Take a Quiz</h3>
          <p className="text-stone-500 mb-6">Test your knowledge with adaptive quizzes and earn points for your progress.</p>
          <Link
            to="/quiz"
            className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all"
          >
            Start Quiz <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
