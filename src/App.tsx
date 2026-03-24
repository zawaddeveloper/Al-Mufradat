import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from './types';
import { Book, LayoutDashboard, BrainCircuit, User, LogIn, LogOut, Moon, Sun, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Language, translations } from './translations';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });
  const navigate = useNavigate();
  const location = useLocation();

  const t = translations[language];

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        } else {
          const newUser: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            streak: 0,
            points: 0,
            level: 'Beginner',
            dailyGoal: 10,
            lastActive: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'bn' : 'en');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t.home },
    { path: '/learn', icon: Book, label: t.learn },
    { path: '/quiz', icon: BrainCircuit, label: t.quiz },
    { path: '/profile', icon: User, label: t.profile },
  ];

  return (
    <div className={cn("min-h-screen flex flex-col transition-colors duration-300", isDarkMode ? "bg-stone-900 text-stone-100" : "bg-stone-50 text-stone-900")}>
      {/* Header */}
      <header className={cn("sticky top-0 z-50 border-b backdrop-blur-md", isDarkMode ? "bg-stone-900/80 border-stone-800" : "bg-white/80 border-stone-200")}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Book size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight">{t.appName}</span>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={toggleLanguage}
              className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors", isDarkMode ? "bg-stone-800 hover:bg-stone-700 text-stone-300" : "bg-stone-100 hover:bg-stone-200 text-stone-600")}
              title={t.selectLanguage}
            >
              <Languages size={16} />
              <span className="hidden sm:inline">{language === 'en' ? 'BN' : 'EN'}</span>
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn("p-2 rounded-full transition-colors", isDarkMode ? "hover:bg-stone-800" : "hover:bg-stone-100")}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium">{user.displayName}</span>
                  <span className="text-xs text-emerald-600 font-semibold">{user.points} {t.points}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-stone-500 hover:text-red-500 transition-colors"
                  title={t.logout}
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
              >
                <LogIn size={18} />
                <span className="font-medium hidden sm:inline">{t.login}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8 flex-grow">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home user={user} isDarkMode={isDarkMode} language={language} />} />
            <Route path="/learn" element={<Learn user={user} isDarkMode={isDarkMode} language={language} />} />
            <Route path="/quiz" element={<Quiz user={user} isDarkMode={isDarkMode} language={language} />} />
            <Route path="/profile" element={<Profile user={user} isDarkMode={isDarkMode} language={language} />} />
            <Route path="/login" element={<Login isDarkMode={isDarkMode} language={language} />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className={cn("py-8 border-t text-center mt-auto mb-20 md:mb-0", isDarkMode ? "bg-stone-900 border-stone-800 text-stone-500" : "bg-white border-stone-200 text-stone-400")}>
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-sm font-medium">
            {t.footerText}
          </p>
          <p className="text-[10px] mt-1 uppercase tracking-widest font-bold">© {new Date().getFullYear()} {t.appName}</p>
        </div>
      </footer>

      {/* Mobile Navigation */}
      <nav className={cn("fixed bottom-0 left-0 right-0 md:hidden border-t px-6 py-3 flex justify-between items-center z-50", isDarkMode ? "bg-stone-900 border-stone-800" : "bg-white border-stone-200")}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-emerald-600" : "text-stone-400"
              )}
            >
              <item.icon size={24} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
