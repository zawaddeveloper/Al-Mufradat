import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Mail, Lock, Chrome, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { translations, Language } from '../translations';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LoginProps {
  isDarkMode: boolean;
  language: Language;
}

export default function Login({ isDarkMode, language }: LoginProps) {
  const t = translations[language];
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success(t.googleLoginSuccess);
      navigate('/');
    } catch (error) {
      console.error('Google Login Error:', error);
      toast.error(t.googleLoginFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success(t.accountCreated);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success(t.welcomeBackToast);
      }
      navigate('/');
    } catch (error: any) {
      console.error('Email Auth Error:', error);
      toast.error(error.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "p-10 rounded-3xl border shadow-xl",
          isDarkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200"
        )}
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            {isRegistering ? <UserPlus size={32} /> : <LogIn size={32} />}
          </div>
          <h2 className="text-3xl font-bold mb-2">{isRegistering ? t.signUp : t.welcomeBack}</h2>
          <p className="text-stone-500">{t.masterQuranic}</p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-6 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-400 uppercase tracking-widest">{t.emailAddress}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={cn(
                  "w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none",
                  isDarkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-100"
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-400 uppercase tracking-widest">{t.password}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  "w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none",
                  isDarkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-100"
                )}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isRegistering ? t.signUp : t.signIn)}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200 dark:border-stone-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={cn("px-4 font-medium text-stone-400", isDarkMode ? "bg-stone-800" : "bg-white")}>{t.orContinueWith}</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={cn(
            "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 border-2 transition-all hover:bg-stone-50 dark:hover:bg-stone-700 active:scale-95 disabled:opacity-50",
            isDarkMode ? "border-stone-700" : "border-stone-100"
          )}
        >
          <Chrome size={20} className="text-blue-500" />
          Google
        </button>

        <p className="mt-8 text-center text-stone-500">
          {isRegistering ? t.alreadyHaveAccount : t.dontHaveAccount}{' '}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-emerald-600 font-bold hover:underline"
          >
            {isRegistering ? t.signIn : t.signUp}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
