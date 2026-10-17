import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen, GraduationCap, LayoutDashboard, UploadCloud, CheckCircle2,
  Clock, Printer, ShieldCheck, Search, Play, Award, PlusCircle, LogOut,
  Edit, Trash2, FileText, Check, AlertCircle, RefreshCw, Eye, EyeOff, X, Copy,
  Download, ChevronRight, Filter, Sparkles, Layers, FolderPlus, FileCode,
  Smartphone, QrCode, ExternalLink, Cpu, Database, Network, Boxes, Trophy,
  HelpCircle, ArrowRight, Bell, Home, CheckSquare, Chrome, Monitor,
  User, UserCheck, ChevronDown, Hash, School, ChevronLeft, SkipForward, RotateCcw, AlertTriangle,
  Mail, Lock, LayoutGrid, List
} from 'lucide-react';
import QuestionCard from './components/QuestionCard.jsx';

/* ==========================================================================
 * GLOBAL AUTH & API HELPERS
 * ======================================================================== */
function getAuthHeaders() {
  const token = localStorage.getItem('qb_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

const SAMPLE_JSON_TEMPLATE = [
  {
    question: "Which data structure uses the Last In, First Out (LIFO) principle?",
    options: ["Queue", "Stack", "Binary Search Tree", "Linked List"],
    correctAnswer: 1,
    explanation: "A Stack is a linear data structure following the LIFO principle where insertion and deletion occur at the same end.",
    chapter: "Chapter 3",
    topic: "Stacks and Queues",
    difficulty: "easy",
    language: "en"
  },
  {
    question: "What is the time complexity of searching in a balanced Binary Search Tree (AVL tree)?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
    correctAnswer: 2,
    explanation: "Because an AVL tree is self-balancing with height bounded by log(n), lookup takes O(log n) time.",
    chapter: "Chapter 5",
    topic: "Trees",
    difficulty: "medium",
    language: "en"
  },
  {
    question: "اردو زبان کا پہلا باقاعدہ دیوان کس شاعر کا ہے؟",
    options: ["مرزا اسد اللہ خان غالب", "میر تقی میر", "قلی قطب شاہ", "خواجہ میر درد"],
    correctAnswer: 2,
    explanation: "محمد قلی قطب شاہ اردو زبان کے پہلے صاحبِ دیوان شاعر تسلیم کیے جاتے ہیں۔",
    chapter: "باب 1",
    topic: "اردو ادب کی تاریخ",
    difficulty: "medium",
    language: "ur"
  }
];

/* ==========================================================================
 * SUBJECT THEME HELPER (Exact match to Mobile App Screen Mockup)
 * ======================================================================== */
function getSubjectTheme(name = '') {
  const lower = name.toLowerCase();
  if (lower.includes('architecture') || lower.includes('computer')) {
    return {
      bg: 'bg-purple-600',
      text: 'text-purple-600',
      lightBg: 'bg-purple-50',
      icon: Cpu,
      progressColor: 'bg-purple-600'
    };
  }
  if (lower.includes('database') || lower.includes('data')) {
    return {
      bg: 'bg-emerald-600',
      text: 'text-emerald-600',
      lightBg: 'bg-emerald-50',
      icon: Database,
      progressColor: 'bg-emerald-600'
    };
  }
  if (lower.includes('automata') || lower.includes('theory')) {
    return {
      bg: 'bg-rose-500',
      text: 'text-rose-500',
      lightBg: 'bg-rose-50',
      icon: Network,
      progressColor: 'bg-rose-500'
    };
  }
  if (lower.includes('oop') || lower.includes('programming') || lower.includes('software')) {
    return {
      bg: 'bg-blue-600',
      text: 'text-blue-600',
      lightBg: 'bg-blue-50',
      icon: Boxes,
      progressColor: 'bg-blue-600'
    };
  }
  return {
    bg: 'bg-amber-600',
    text: 'text-amber-600',
    lightBg: 'bg-amber-50',
    icon: BookOpen,
    progressColor: 'bg-amber-600'
  };
}

/* ==========================================================================
 * GLOBAL CLIENT CACHE FOR INSTANT NAVIGATION
 * ======================================================================== */
const API_CACHE = {
  status: null,
  subjects: null,
  books: null,
  questions: {}
};

/* ==========================================================================
 * TOP PROGRESS BAR FOR ROUTE NAVIGATION (Fast visual feedback)
 * ======================================================================== */
function TopProgressBar() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try { window.scrollTo(0, 0); } catch (_) {}
    setVisible(true);
    setProgress(25);

    const t1 = setTimeout(() => setProgress(75), 70);
    const t2 = setTimeout(() => setProgress(100), 200);
    const t3 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 380);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [location.pathname, location.search]);

  if (!visible && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.9)]"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          transition: progress === 100 ? 'width 100ms ease-out, opacity 180ms ease-out' : 'width 180ms ease-out'
        }}
      />
    </div>
  );
}

/* ==========================================================================
 * ACADEMIC PAGE LOADER (Professional, clean academic styling)
 * ======================================================================== */
function AcademicLoader({
  title = "Loading Assessment Content",
  subtitle = "Accessing verified syllabus question bank...",
  compact = false
}) {
  if (compact) {
    return (
      <div className="flex items-center justify-center gap-3 py-10 text-slate-500 animate-fadeIn">
        <div className="w-5 h-5 rounded-full border-2 border-amber-400/30 border-t-amber-500 animate-spin" />
        <span className="text-xs font-semibold text-slate-600">{title}</span>
      </div>
    );
  }

  return (
    <div className="min-h-[55vh] flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-full border-[3px] border-amber-400/20 border-t-amber-400 animate-spin" />
        <div className="absolute inset-1.5 rounded-full border-[2px] border-blue-500/20 border-b-blue-400 animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-amber-400/40 text-amber-400 flex items-center justify-center shadow-md animate-pulse">
            <GraduationCap className="w-4 h-4 text-amber-400" />
          </div>
        </div>
      </div>
      <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">{subtitle}</p>
      <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[10px] font-semibold text-slate-500">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        <span>Curriculum-Aligned Prep</span>
      </div>
    </div>
  );
}

/* ==========================================================================
 * COMPACT PROFESSIONAL NAVBAR WITH MOBILE APP CTA
 * ======================================================================== */
function Navbar({
  adminUser,
  onLogout,
  studentUser,
  onOpenStudentLogin,
  onStudentLogout,
  onOpenAppModal,
  onInstallApp,
  isInstalled
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [showStudentMenu, setShowStudentMenu] = useState(false);
  const studentMenuRef = useRef(null);
  const [popupSearchQuery, setPopupSearchQuery] = useState('');
  const [searchSubjects, setSearchSubjects] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef(null);

  // Close search/notification/student popups on outside click, Escape, or route change
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (studentMenuRef.current && !studentMenuRef.current.contains(e.target)) {
        setShowStudentMenu(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSearchPopup(false);
        setShowNotifications(false);
        setShowStudentMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setShowSearchPopup(false);
    setShowNotifications(false);
    setShowStudentMenu(false);
  }, [location.pathname]);

  const handleSearchClick = () => {
    if (!showSearchPopup) {
      setShowNotifications(false);
      setShowSearchPopup(true);
      if (searchSubjects.length === 0) {
        setSearchLoading(true);
        fetch('/api/subjects')
          .then(r => r.json())
          .then(d => {
            setSearchSubjects(d.data || []);
            setSearchLoading(false);
          })
          .catch(() => setSearchLoading(false));
      }
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 70);
    } else {
      setShowSearchPopup(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0B1536]/95 backdrop-blur-md text-white border-b border-slate-800/90 shadow-[0_4px_20px_rgba(0,0,0,0.15)] print:hidden">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-12 sm:h-14 flex items-center justify-between">
        {/* Brand / Logo - Faithful to Mobile App Screen Mockup */}
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 group shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-900 border border-amber-400/30 text-amber-400 flex items-center justify-center font-extrabold shadow-sm group-hover:scale-105 transition transform">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          </div>
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-1">
              <span className="font-black text-sm sm:text-base lg:text-lg tracking-tight text-white">MCQs</span>
              <span className="font-black text-sm sm:text-base lg:text-lg tracking-tight text-amber-400">Bank</span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-slate-300 ml-1">
                Academic Portal
              </span>
            </div>
            <span className="text-[8px] sm:text-[10px] text-slate-400 tracking-wide mt-0.5 hidden xs:block">
              Academic Portal • Higher Education
            </span>
          </div>
        </Link>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 mr-1">
            <Link
              to="/"
              className={`px-2.5 py-1.5 rounded-lg transition text-xs font-semibold ${
                location.pathname === '/'
                  ? 'bg-white/15 text-amber-400'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </Link>
            <Link
              to="/catalog"
              className={`px-2.5 py-1.5 rounded-lg transition text-xs font-semibold ${
                location.pathname.startsWith('/catalog')
                  ? 'bg-white/15 text-amber-400'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Subjects
            </Link>
            <Link
              to="/practice"
              className={`px-2.5 py-1.5 rounded-lg transition text-xs font-semibold ${
                location.pathname.startsWith('/practice')
                  ? 'bg-white/15 text-amber-400'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Practice
            </Link>
            <Link
              to="/exam"
              className={`px-2.5 py-1.5 rounded-lg transition text-xs font-semibold ${
                location.pathname.startsWith('/exam')
                  ? 'bg-white/15 text-amber-400'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Exam
            </Link>
          </nav>

          {/* Quick Search Action - Popup Screen directly below Header */}
          <div className="relative">
            <button
              type="button"
              onClick={handleSearchClick}
              className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition active:scale-95 ${
                showSearchPopup
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-400/50 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
              title="Search subjects & MCQs"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Modern, Compact Search Popup Screen directly below Header */}
            {showSearchPopup && (
              <>
                {/* Backdrop to dismiss on tap outside */}
                <div
                  className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs"
                  onClick={() => setShowSearchPopup(false)}
                />

                <div
                  className="fixed inset-x-2.5 top-13 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-[calc(100vw-1.25rem)] sm:w-[420px] max-w-lg bg-[#0F172A] border border-slate-700 rounded-2xl p-3 sm:p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {/* Search Input Box */}
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
                    <div className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition">
                      <Search className="w-4 h-4 text-amber-400 shrink-0" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={popupSearchQuery}
                        onChange={(e) => setPopupSearchQuery(e.target.value)}
                        placeholder="Search subjects, MCQs, or topics..."
                        className="bg-transparent border-none text-white text-xs sm:text-sm placeholder:text-slate-400 w-full focus:outline-none"
                      />
                      {popupSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setPopupSearchQuery('');
                            searchInputRef.current?.focus();
                          }}
                          className="text-slate-400 hover:text-white p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSearchPopup(false)}
                      className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
                      title="Close search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Results & Quick Picks */}
                  <div className="py-2 max-h-64 sm:max-h-72 overflow-y-auto no-scrollbar space-y-1.5">
                    {searchLoading ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-amber-400" />
                        Loading subjects...
                      </div>
                    ) : (
                      (() => {
                        const q = popupSearchQuery.trim().toLowerCase();
                        const matches = searchSubjects.filter(s =>
                          !q ||
                          s.name.toLowerCase().includes(q) ||
                          (s.code || '').toLowerCase().includes(q) ||
                          (s.programOrClass || '').toLowerCase().includes(q)
                        );

                        if (matches.length === 0) {
                          return (
                            <div className="py-6 text-center text-xs text-slate-400">
                              <p className="font-semibold text-slate-300">No subjects found matching "{popupSearchQuery}"</p>
                              <button
                                onClick={() => {
                                  navigate('/catalog');
                                  setShowSearchPopup(false);
                                }}
                                className="mt-2 text-amber-400 hover:underline text-[11px] font-medium"
                              >
                                View all subjects in Catalog →
                              </button>
                            </div>
                          );
                        }

                        return (
                          <>
                            <div className="flex items-center justify-between px-1 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              <span>{q ? `Matching Subjects (${matches.length})` : 'Popular Subjects'}</span>
                              <span className="text-slate-500 font-normal">Tap to practice</span>
                            </div>
                            {matches.map(sub => (
                              <div
                                key={sub._id}
                                onClick={() => {
                                  navigate(`/practice?subjectId=${sub._id}`);
                                  setShowSearchPopup(false);
                                }}
                                className="p-2 sm:p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/70 hover:border-amber-400/50 transition cursor-pointer flex items-center justify-between group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-xs group-hover:bg-amber-400 group-hover:text-slate-950 transition">
                                    <BookOpen className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-xs sm:text-sm text-white group-hover:text-amber-300 transition truncate">
                                      {sub.name}
                                    </p>
                                    <p className="text-[10px] text-slate-400 truncate">
                                      {sub.questionCount || 0} MCQs • {sub.bookCount || sub.books?.length || 1} Modules
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="hidden xs:inline text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                                    Practice →
                                  </span>
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
                                </div>
                              </div>
                            ))}
                          </>
                        );
                      })()
                    )}
                  </div>

                  {/* Popup Footer */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="hidden sm:inline text-slate-500">ESC to close</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/catalog');
                        setShowSearchPopup(false);
                      }}
                      className="text-amber-400 hover:text-amber-300 font-semibold transition ml-auto flex items-center gap-1 text-[11px]"
                    >
                      <span>Explore all subjects</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notifications Bell with unread dot */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition relative active:scale-95"
              title="Portal Notifications"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-200" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#0B1536]" />
            </button>

            {/* Notification Popover Dropdown (Mobile Viewport Safe) */}
            {showNotifications && (
              <div className="fixed inset-x-3 top-13 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 bg-slate-900 border border-slate-700/90 rounded-2xl p-3.5 sm:p-4 shadow-2xl z-50 text-left animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span>Academic Notifications</span>
                  </div>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white p-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="py-2.5 space-y-2 text-xs text-slate-300">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                    <p className="font-semibold text-white">📱 Android Companion App Ready</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Direct APK download available for offline practice on smartphones and tablets.</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                    <p className="font-semibold text-white">🎓 5 Core Subjects Verified</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Computer Architecture, DBMS, Automata, OOP and more updated with full syllabus coverage.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    onOpenAppModal();
                  }}
                  className="w-full mt-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs transition text-center flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Get Mobile & Chrome App</span>
                </button>
              </div>
            )}
          </div>

          {/* Candidate Profile / Student Login (Replaces PWA CTA on top right) */}
          {studentUser ? (
            <div className="relative" ref={studentMenuRef}>
              {/* Professional Round Circle Avatar (No dropdown arrow) */}
              <button
                type="button"
                onClick={() => setShowStudentMenu(!showStudentMenu)}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-slate-950 font-black text-sm flex items-center justify-center shadow-md ring-2 ring-amber-400/40 hover:ring-amber-400 hover:scale-105 active:scale-95 transition-all cursor-pointer relative"
                title={`Candidate: ${studentUser.name} (${studentUser.className || studentUser.rollNo || 'Candidate'})`}
              >
                <span>{studentUser.name ? studentUser.name.charAt(0).toUpperCase() : 'S'}</span>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" title="Active"></span>
              </button>

              {/* Ultra-Compact Professional Profile Dropdown */}
              {showStudentMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 max-w-[calc(100vw-1.5rem)] bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 shadow-xl z-50 text-left animate-in fade-in">
                  {/* Compact Header */}
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {studentUser.name ? studentUser.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-white truncate leading-tight">{studentUser.name}</h4>
                      <p className="text-[10px] text-amber-300 truncate leading-tight">
                        {studentUser.className || 'Candidate'}{studentUser.rollNo ? ` • ${studentUser.rollNo}` : ''}
                      </p>
                    </div>
                  </div>

                  {studentUser.institution && (
                    <div className="py-1 px-1 text-[9px] text-slate-400 truncate border-b border-slate-800/60">
                      {studentUser.institution}
                    </div>
                  )}

                  {/* Compact Quick Actions */}
                  <div className="pt-1.5 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowStudentMenu(false);
                        onOpenStudentLogin();
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition"
                    >
                      <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Edit Profile</span>
                    </button>

                    <Link
                      to="/exam"
                      onClick={() => setShowStudentMenu(false)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Start Exam</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setShowStudentMenu(false);
                        onStudentLogout();
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-red-400 hover:bg-red-500/10 transition mt-1 pt-1.5 border-t border-slate-800"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenStudentLogin}
              className="w-9 h-9 sm:w-auto sm:h-9 sm:px-3 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md ring-2 ring-amber-400/40 hover:ring-amber-400 transition-all cursor-pointer active:scale-95"
              title="Candidate Login for Examination"
            >
              <User className="w-4 h-4 text-slate-950 shrink-0" />
              <span className="hidden sm:inline">Student Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
  
}

/* ==========================================================================
 * MOBILE BOTTOM NAVIGATION BAR (Faithful to Mobile App Experience)
 * ======================================================================== */
function MobileBottomNav({ onOpenAppModal }) {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Home, exact: true },
    { label: 'Subjects', path: '/catalog', icon: Layers, exact: false },
    { label: 'Practice', path: '/practice', icon: Play, exact: false },
    { label: 'Exam', path: '/exam', icon: Award, exact: false },
    { label: 'Faculty', path: '/admin', icon: ShieldCheck, exact: false },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] print:hidden">
      <div className="grid grid-cols-5 h-14 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center h-full py-1 transition ${
                isActive ? 'text-amber-500 font-bold' : 'text-slate-400 hover:text-slate-700 font-medium'
              }`}
            >
              <div className={`p-1 rounded-xl transition ${isActive ? 'bg-amber-400/15 text-amber-600' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ==========================================================================
 * STUDENT CANDIDATE PROFILE & LOGIN MODAL
 * ======================================================================== */
function StudentProfileModal({ isOpen, onClose, studentUser, onSave, onLogout }) {
  const [formData, setFormData] = useState({
    name: studentUser?.name || '',
    className: studentUser?.className || '',
    rollNo: studentUser?.rollNo || '',
    institution: studentUser?.institution || ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (studentUser) {
      setFormData({
        name: studentUser.name || '',
        className: studentUser.className || '',
        rollNo: studentUser.rollNo || '',
        institution: studentUser.institution || ''
      });
    } else {
      setFormData({ name: '', className: '', rollNo: '', institution: '' });
    }
    setError('');
  }, [studentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Candidate Full Name is required.');
      return;
    }
    if (!formData.className.trim()) {
      setError('Class / Program / Degree is required.');
      return;
    }
    onSave({
      name: formData.name.trim(),
      className: formData.className.trim(),
      rollNo: formData.rollNo.trim(),
      institution: formData.institution.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-sm w-full text-white shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="bg-[#0B1536] px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-sm">
              <GraduationCap className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>{studentUser ? 'Candidate Profile' : 'Student Login'}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Candidate ID
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">Accredited examination & transcript identity</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && (
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Candidate Full Name <span className="text-amber-400">*</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter candidate full name"
                className="w-full pl-10 pr-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Class / Program <span className="text-amber-400">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Layers className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  placeholder="e.g. BSCS 6th / Class 12"
                  className="w-full pl-10 pr-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Roll / Seat Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  placeholder="e.g. BCS-2023-042"
                  className="w-full pl-10 pr-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 transition font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Institution / College <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <School className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="e.g. Punjab University / Govt College"
                className="w-full pl-10 pr-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{studentUser ? 'Update Profile' : 'Save & Continue'}</span>
            </button>
            {studentUser && onLogout && (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs transition flex items-center justify-center gap-1"
                title="Log Out Student"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ==========================================================================
 * COMPACT & RESPONSIVE APP DOWNLOAD MODAL (PWA & APK)
 * ======================================================================== */
function MobileAppModal({ onClose, onInstallChrome, isInstalled }) {
  const [activeTab, setActiveTab] = useState('chrome'); // 'chrome' | 'apk'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-sm sm:max-w-md w-full text-white shadow-2xl overflow-hidden relative">
        {/* Compact Header */}
        <div className="bg-[#0B1536] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-sm">
              <GraduationCap className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>MCQs Bank</span>
                <span className="text-amber-400">App</span>
              </h3>
              <p className="text-[10px] text-slate-400">Academic Offline Practice & Shortcuts</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 bg-slate-950/80 p-1 border-b border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('chrome')}
            className={`py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'chrome'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Chrome className="w-3.5 h-3.5" />
            <span>Chrome / Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('apk')}
            className={`py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android APK</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 space-y-3">
          {activeTab === 'chrome' ? (
            <>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <span className="text-amber-400">⚡</span>
                  <span>Instant Chrome Web App (0 MB Storage)</span>
                </p>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Installs in Chrome, Edge & Android in seconds. Runs in its own clean window with a desktop shortcut!
                </p>
              </div>

              {isInstalled ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center font-bold text-xs flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>App is already installed on this device!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onInstallChrome}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2"
                >
                  <Chrome className="w-4 h-4 text-slate-950" />
                  <span>Install Chrome App & Create Shortcut</span>
                </button>
              )}

              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                Tip: If prompt doesn't open, click the <span className="text-amber-300 font-mono">⊕</span> or <span className="text-amber-300 font-mono">⊞</span> icon in Chrome's URL bar, or tap menu <span className="font-mono">⋮</span> &rarr; <strong className="text-slate-300">Install MCQs Bank</strong>.
              </p>
            </>
          ) : (
            <>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Native Android Companion App</span>
                </p>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Direct standalone APK for Android phones & tablets with 100% offline access.
                </p>
              </div>

              <a
                href="https://github.com/IftikharZahid/MCQs-Bank/releases/latest/download/app-debug.apk"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2 text-center"
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>Download APK (v1.0 • ~12 MB)</span>
              </a>

              <p className="text-[10px] text-slate-400 text-center">
                Requires Android 7.0 (Nougat) or newer.
              </p>
            </>
          )}

          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg hover:bg-white/5 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
 * 1. STUDENT HOMEPAGE
 * ======================================================================== */
function HomePage({ onOpenAppModal }) {
  const [status, setStatus] = useState(() => API_CACHE.status || { stats: { subjects: 0, books: 0, questions: 0, exams: 0 } });
  const [subjects, setSubjects] = useState(() => API_CACHE.subjects || []);
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(() => !API_CACHE.subjects);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/status')
      .then(r => r.json())
      .then(d => {
        if (d) {
          setStatus(d);
          API_CACHE.status = d;
        }
      })
      .catch(() => {});

    fetch('/api/subjects')
      .then(r => r.json())
      .then(d => {
        const list = d.data || [];
        setSubjects(list);
        API_CACHE.subjects = list;
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/exams/recent')
      .then(r => r.json())
      .then(d => setRecentExams(d.data || []))
      .catch(() => {});
  }, []);

  const filteredSubjects = subjects;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-3.5 sm:space-y-6">
      {/* 1. HERO CARD (Compact & Professional Academic Standards) */}
      <section className="bg-gradient-to-r from-[#0B1536] via-[#0E1B40] to-[#14265A] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:py-6 lg:px-8 shadow-lg border border-slate-800/80 relative overflow-hidden">
        {/* Subtle ambient glows */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-8 items-center relative z-10">
          <div className="md:col-span-7 lg:col-span-7 space-y-2 sm:space-y-3">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/10 text-slate-200 border border-white/10">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>ACADEMIC PREP PORTAL</span>
            </div>

            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-black tracking-tight leading-[1.2]">
              Practice. Assess. <span className="text-amber-400">Improve.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              High-quality, verified MCQs from multiple books and syllabi to strengthen your concepts.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={() => navigate('/practice')}
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md transition transform active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Practice →</span>
              </button>

              <button
                onClick={() => navigate('/catalog')}
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-200" />
                <span>Browse Subjects</span>
              </button>
            </div>
          </div>

          {/* Right Column / Compact Academic Accreditation Card */}
          <div className="hidden md:flex md:col-span-5 lg:col-span-5 justify-end items-center">
            <div className="w-full max-w-sm rounded-2xl bg-white/[0.06] border border-white/10 p-3.5 sm:p-4 backdrop-blur-md shadow-inner space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-400/20 text-amber-400 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white tracking-wide">Academic Standards</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  HEC Aligned
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px]">Syllabus-Aligned</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px]">Timed Testing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px]">Instant Analytics</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px]">Verified Answers</span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5">
                <span>BSCS • BSSE • IT</span>
                <button
                  type="button"
                  onClick={() => navigate('/exam')}
                  className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 transition"
                >
                  <span>Simulate Exam</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SUMMARY STATS CARD (Faithful to Mockup: Single white card, 4 metrics in one line) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-2 sm:p-4">
        <div className="grid grid-cols-4 divide-x divide-slate-100 items-center text-center">
          {/* Metric 1: Books */}
          <div className="flex flex-col items-center justify-center px-0.5 sm:px-2">
            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </div>
            <span className="text-xs xs:text-sm sm:text-xl font-black text-slate-900 tracking-tight leading-none">
              {String(status.stats?.books || subjects.reduce((acc, s) => acc + (s.books?.length || s.bookCount || 1), 0) || 5).padStart(2, '0')}
            </span>
            <span className="text-[8px] xs:text-[9px] sm:text-xs font-semibold text-slate-500 mt-1 leading-none text-center">
              Books
            </span>
          </div>

          {/* Metric 2: Total MCQs */}
          <div className="flex flex-col items-center justify-center px-0.5 sm:px-2">
            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </div>
            <span className="text-xs xs:text-sm sm:text-xl font-black text-slate-900 tracking-tight leading-none">
              {status.stats?.questions || 158}
            </span>
            <span className="text-[8px] xs:text-[9px] sm:text-xs font-semibold text-slate-500 mt-1 leading-none text-center">
              Total MCQs
            </span>
          </div>

          {/* Metric 3: Practice Tests */}
          <div className="flex flex-col items-center justify-center px-0.5 sm:px-2">
            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
              <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </div>
            <span className="text-xs xs:text-sm sm:text-xl font-black text-slate-900 tracking-tight leading-none">
              {Math.max(status.stats?.exams || 0, 25)}+
            </span>
            <span className="text-[8px] xs:text-[9px] sm:text-xs font-semibold text-slate-500 mt-1 leading-none text-center">
              Practice Tests
            </span>
          </div>

          {/* Metric 4: Average Score */}
          <div className="flex flex-col items-center justify-center px-0.5 sm:px-2">
            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </div>
            <span className="text-xs xs:text-sm sm:text-xl font-black text-slate-900 tracking-tight leading-none">
              78%
            </span>
            <span className="text-[8px] xs:text-[9px] sm:text-xs font-semibold text-slate-500 mt-1 leading-none text-center">
              Average Score
            </span>
          </div>
        </div>
      </div>


      {/* 4. EXPLORE QUESTION BANKS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📖</span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Explore Question Banks</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Select a subject to begin your academic practice.</p>
          </div>
          <button
            onClick={() => navigate('/catalog')}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Subject Cards (Mockup styling: Colored squircle icon, title, mcqs + modules count, progress bar, chevron) */}
        {loading && filteredSubjects.length === 0 ? (
          <div className="py-12 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col items-center justify-center text-center animate-fadeIn">
            <div className="w-9 h-9 rounded-full border-3 border-amber-400/20 border-t-amber-500 animate-spin mb-3" />
            <p className="text-xs font-bold text-slate-700">Loading Question Banks...</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Retrieving verified academic subjects and syllabus modules</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredSubjects.map(sub => {
            const theme = getSubjectTheme(sub.name);
            const IconComponent = theme.icon;
            const moduleCount = sub.bookCount || sub.books?.length || 1;

            return (
              <div
                key={sub._id}
                onClick={() => navigate(`/practice?subjectId=${sub._id}`)}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition group flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-3.5">
                    {/* Colored squircle icon matching mockup */}
                    <div className={`w-12 h-12 rounded-2xl ${theme.bg} text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition transform`}>
                      <IconComponent className="w-6 h-6 stroke-[2.2]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                          {sub.name}
                        </h3>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition shrink-0" />
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-medium">{sub.questionCount || 0} MCQs</span>
                        <span>•</span>
                        <span>{String(moduleCount).padStart(2, '0')} Modules</span>
                      </div>

                      {/* Mockup Progress Bar */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${theme.progressColor} rounded-full`} style={{ width: '0%' }} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">0%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Action Footer Buttons */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/practice?subjectId=${sub._id}`);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition text-center"
                  >
                    Practice MCQs
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/exam?subjectId=${sub._id}`);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-100 transition text-center"
                  >
                    Start Exam
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

        {/* Mockup Bottom Pill Button: View All Subjects */}
        <button
          onClick={() => navigate('/catalog')}
          className="w-full py-3.5 px-4 rounded-2xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-blue-600 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-sm mt-2"
        >
          <Layers className="w-4 h-4" />
          <span>View All Subjects</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 5. RECENT EXAM RESULTS */}
      {recentExams.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-sm mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Recent Examination Submissions</h3>
            <span className="text-xs font-semibold text-slate-500">{recentExams.length} Recorded</span>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] sm:text-xs">
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Percentage</th>
                  <th className="py-2.5 px-3">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentExams.map(ex => (
                  <tr key={ex._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-medium text-slate-900">{ex.studentName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{ex.subjectId?.name || ex.title}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{ex.summary?.obtainedMarks}/{ex.summary?.totalQuestions}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{ex.summary?.percentage}%</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${ex.summary?.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {ex.summary?.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
 * 2. SUBJECTS & BOOKS CATALOG PAGE
 * ======================================================================== */
function CatalogPage() {
  const [books, setBooks] = useState(() => API_CACHE.books || []);
  const [subjects, setSubjects] = useState(() => API_CACHE.subjects || []);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(() => !API_CACHE.books || !API_CACHE.subjects);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('/api/subjects').then(r => r.json()).then(d => {
        const list = d.data || [];
        API_CACHE.subjects = list;
        return list;
      }).catch(() => []),
      fetch('/api/books').then(r => r.json()).then(d => {
        const list = d.data || [];
        API_CACHE.books = list;
        return list;
      }).catch(() => [])
    ])
      .then(([subList, bookList]) => {
        setSubjects(subList);
        setBooks(bookList);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AcademicLoader
        title="Loading Course & Book Catalog"
        subtitle="Retrieving accredited university textbooks, chapter breakdowns, and syllabus modules..."
      />
    );
  }

  const query = searchQuery.trim().toLowerCase();
  const visibleBooks = books.filter(b => {
    const matchesSubject = !selectedSubject || b.subjectId?._id === selectedSubject;
    if (!matchesSubject) return false;
    if (!query) return true;
    const titleMatch = b.title?.toLowerCase().includes(query);
    const authorMatch = b.author?.toLowerCase().includes(query);
    const subMatch = b.subjectId?.name?.toLowerCase().includes(query);
    const programMatch = b.programOrClass?.toLowerCase().includes(query);
    const semesterMatch = b.semester?.toLowerCase().includes(query);
    return titleMatch || authorMatch || subMatch || programMatch || semesterMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3.5 sm:py-6 space-y-3.5 sm:space-y-4 animate-fadeIn">
      {/* 1. COMPACT HEADER & SEARCH */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-navy/10 flex items-center justify-center text-brand-navy shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Academic Books & Course Catalog
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
                  {visibleBooks.length} Books
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Syllabus-aligned reference textbooks, chapters & assessment modules
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books, authors, subjects..."
              className="w-full pl-9 pr-8 py-1.5 sm:py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-brand-navy transition placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. SUBJECT PILL CHIPS FILTER STRIP */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            onClick={() => setSelectedSubject('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
              !selectedSubject
                ? 'bg-brand-navy text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>All Subjects</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              !selectedSubject ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {books.length}
            </span>
          </button>

          {subjects.map(s => {
            const isSelected = selectedSubject === s._id;
            const subBookCount = books.filter(b => b.subjectId?._id === s._id).length;
            return (
              <button
                key={s._id}
                type="button"
                onClick={() => setSelectedSubject(isSelected ? '' : s._id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{s.name}</span>
                {subBookCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {subBookCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. BOOKS GRID */}
      {visibleBooks.length === 0 ? (
        <div className="p-8 bg-white border border-slate-200/90 rounded-2xl text-center shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2.5">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Reference Books Found</h3>
          <p className="text-xs text-slate-500 mt-0.5 mb-3">
            {searchQuery
              ? `No books match "${searchQuery}". Try a different search keyword.`
              : 'No books have been published for this subject yet.'}
          </p>
          {(searchQuery || selectedSubject) && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedSubject(''); }}
              className="px-3.5 py-1.5 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navyDark transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {visibleBooks.map(book => {
            const theme = getSubjectTheme(book.subjectId?.name);
            const IconComp = theme.icon || BookOpen;

            return (
              <div
                key={book._id}
                className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 truncate max-w-[170px]">
                      {book.subjectId?.name || 'Academic Subject'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      {book.questionCount || 0} MCQs
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 my-1.5">
                    <div className={`w-9 h-9 rounded-xl ${theme.bg} text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition transform`}>
                      <IconComp className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-brand-navy transition leading-snug line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        Author: <strong className="text-slate-700">{book.author || 'Academic Faculty'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px] text-slate-500 font-medium">
                    {book.programOrClass && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        {book.programOrClass}
                      </span>
                    )}
                    {book.semester && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {book.semester}
                      </span>
                    )}
                    {book.edition && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {book.edition}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => navigate(`/practice?bookId=${book._id}`)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1 active:scale-98"
                  >
                    <Play className="w-3 h-3 text-amber-400" />
                    <span>Practice</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/exam?bookId=${book._id}`)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition flex items-center justify-center gap-1 active:scale-98"
                  >
                    <Award className="w-3 h-3 text-amber-600" />
                    <span>Take Exam</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
 * 3. INTERACTIVE PRACTICE MODE
 * ======================================================================== */
function PracticePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const cacheKey = location.search || 'default';
  const [questions, setQuestions] = useState(() => API_CACHE.questions[cacheKey] || []);
  const [loading, setLoading] = useState(() => !API_CACHE.questions[cacheKey]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [skippedQuestions, setSkippedQuestions] = useState(new Set());
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [instantFeedback, setInstantFeedback] = useState(true);
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('qb_bookmarks') || '[]'); } catch { return []; }
  });
  const [navViewMode, setNavViewMode] = useState('scroll');
  const navContainerRef = useRef(null);

  useEffect(() => {
    if (navContainerRef.current) {
      const activeEl = navContainerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex]);

  useEffect(() => {
    const key = location.search || 'default';
    if (!API_CACHE.questions[key]) {
      setLoading(true);
    }
    const params = new URLSearchParams(location.search);
    fetch(`/api/questions?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        const list = d.questions || [];
        API_CACHE.questions[key] = list;
        setQuestions(list);
        setCurrentIndex(0);
        setAnswers({});
        setSkippedQuestions(new Set());
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [location.search]);

  const toggleBookmark = (qId) => {
    const next = bookmarks.includes(qId) ? bookmarks.filter(id => id !== qId) : [...bookmarks, qId];
    setBookmarks(next);
    localStorage.setItem('qb_bookmarks', JSON.stringify(next));
  };

  const handleSelectOption = (optIdx) => {
    const q = questions[currentIndex];
    if (!q) return;
    setAnswers(prev => ({ ...prev, [q._id]: optIdx }));
    setSkippedQuestions(prev => {
      const next = new Set(prev);
      next.delete(q._id);
      return next;
    });
  };

  const handleSkipQuestion = () => {
    const q = questions[currentIndex];
    if (!q) return;
    if (answers[q._id] === undefined) {
      setSkippedQuestions(prev => new Set(prev).add(q._id));
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setShowSummaryModal(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setShowSummaryModal(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  };

  if (loading) {
    return (
      <AcademicLoader
        title="Loading Practice Assessment"
        subtitle="Preparing verified questions, Bloom's taxonomy weights, and detailed answer keys..."
      />
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200/90 rounded-2xl text-center shadow-sm animate-fadeIn">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Questions Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
          There are no published questions matching this filter criteria yet. Select another subject or module.
        </p>
        <button
          onClick={() => navigate('/catalog')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
        >
          <span>Explore All Question Banks</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const selected = answers[currentQ?._id];
  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter(q => answers[q._id] === q.correctAnswer).length;
  const incorrectCount = answeredCount - correctCount;
  const skippedCount = Array.from(skippedQuestions).filter(id => answers[id] === undefined).length;
  const accuracyRate = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3.5 sm:space-y-4">
      {/* Top Header Card & Progress */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-md bg-brand-navy text-amber-400 font-black text-[10px] uppercase tracking-wider shrink-0">
              Practice
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold truncate">
              <span>Q {currentIndex + 1}<span className="text-slate-400 font-normal">/{questions.length}</span></span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-bold">{correctCount} Correct</span>
              <span className="text-slate-300 hidden xs:inline">•</span>
              <span className="text-amber-700 font-medium hidden xs:inline">{answeredCount} Solved</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setNavViewMode(m => m === 'scroll' ? 'grid' : 'scroll')}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border transition ${
                navViewMode === 'grid'
                  ? 'bg-brand-navy text-amber-400 border-brand-navy'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title={navViewMode === 'scroll' ? "Expand into multi-row responsive grid" : "Collapse to single-row scroll"}
            >
              {navViewMode === 'scroll' ? (
                <>
                  <LayoutGrid className="w-3 h-3" />
                  <span className="hidden xs:inline">Grid</span>
                </>
              ) : (
                <>
                  <List className="w-3 h-3" />
                  <span className="hidden xs:inline">Row</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setInstantFeedback(!instantFeedback)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border transition ${
                instantFeedback
                  ? 'bg-amber-500/10 text-amber-800 border-amber-300/80'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
              title="Toggle Instant Feedback & Explanations"
            >
              <HelpCircle className="w-3 h-3 text-amber-600" />
              <span>Hints</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSummaryModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition"
            >
              <Award className="w-3 h-3 text-amber-500" />
              <span>{accuracyRate}%</span>
            </button>
          </div>
        </div>

        {/* Responsive Question Navigator (Width-Adaptive) */}
        <div
          ref={navViewMode === 'scroll' ? navContainerRef : undefined}
          className={`mt-2.5 pt-2 border-t border-slate-100 py-1 px-0.5 ${
            navViewMode === 'scroll'
              ? 'flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scroll-smooth'
              : 'flex flex-wrap items-center gap-1.5 sm:gap-2 max-h-64 overflow-y-auto'
          }`}
        >
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = answers[q._id] !== undefined;
            const isCorrect = isAnswered && answers[q._id] === q.correctAnswer;
            const isSkipped = skippedQuestions.has(q._id) && !isAnswered;
            let pillStyle = "bg-slate-50 text-slate-700 border border-slate-200/90 hover:bg-slate-100 font-bold shadow-2xs";
            if (isAnswered) {
              pillStyle = isCorrect
                ? "bg-emerald-600 text-white font-bold border border-emerald-600 shadow-xs"
                : "bg-rose-500 text-white font-bold border border-rose-500 shadow-xs";
              if (isCurrent) {
                pillStyle += " ring-2 ring-amber-400 ring-offset-2 ring-offset-white scale-110 z-10";
              }
            } else if (isCurrent) {
              pillStyle = "bg-amber-400 text-slate-950 font-black border-2 border-amber-500 ring-2 ring-amber-400/50 shadow-xs scale-110 z-10";
            } else if (isSkipped) {
              pillStyle = "bg-amber-50 text-amber-900 border-2 border-dashed border-amber-400 font-bold";
            }
            return (
              <button
                key={q._id}
                type="button"
                data-active={isCurrent ? "true" : undefined}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[11px] sm:text-xs flex items-center justify-center shrink-0 transition active:scale-95 ${pillStyle}`}
                title={`Question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact Question Card */}
      {currentQ && (
        <QuestionCard
          index={currentIndex}
          totalCount={questions.length}
          questionObj={currentQ}
          selectedOption={selected}
          onSelectOption={handleSelectOption}
          showFeedback={instantFeedback && selected !== undefined}
          isBookmarked={bookmarks.includes(currentQ._id)}
          onToggleBookmark={toggleBookmark}
          mode="practice"
        />
      )}

      {/* Professional Navigation Controls (Bottom Bar) */}
      <div className="sticky bottom-16 sm:bottom-2 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2 sm:p-2.5 shadow-lg sm:shadow-sm flex items-center gap-2 animate-fadeIn">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={handlePrevQuestion}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-3 sm:px-4 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev</span>
        </button>

        <button
          type="button"
          onClick={handleSkipQuestion}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 text-xs sm:text-sm font-bold transition active:scale-95"
        >
          <SkipForward className="w-4 h-4 text-amber-600" />
          <span>Skip</span>
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            type="button"
            onClick={handleNextQuestion}
            className="flex-[1.4] sm:flex-initial inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-4 sm:px-6 rounded-xl bg-brand-navy hover:bg-brand-navyDark text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 sm:ml-auto"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowSummaryModal(true)}
            className="flex-[1.4] sm:flex-initial inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-4 sm:px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 sm:ml-auto"
          >
            <Check className="w-4 h-4" />
            <span>Finish</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowSummaryModal(true)}
          className="hidden sm:inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition"
        >
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          <span>Scorecard</span>
        </button>
      </div>

      {/* Practice Scorecard / Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm sm:max-w-md w-full p-5 sm:p-6 shadow-2xl text-slate-900 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-black text-center text-slate-900">
              Practice Session Scorecard
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1 mb-4">
              Here is your performance summary for this question module.
            </p>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3.5 text-center">
              <div className="p-2 bg-white rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Correct</span>
                <p className="text-base font-black text-emerald-700">{correctCount}</p>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-red-600 uppercase">Wrong</span>
                <p className="text-base font-black text-red-600">{incorrectCount}</p>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-amber-700 uppercase">Skipped</span>
                <p className="text-base font-black text-amber-700">{skippedCount}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center mb-4">
              <span className="text-xs text-emerald-800 font-semibold">Accuracy Rate</span>
              <p className="text-2xl font-black text-emerald-900">{accuracyRate}%</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAnswers({});
                  setSkippedQuestions(new Set());
                  setCurrentIndex(0);
                  setShowSummaryModal(false);
                }}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Practice</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-brand-navy hover:bg-brand-navyDark text-white font-black text-xs sm:text-sm shadow-md transition"
              >
                Continue Practice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
 * 4. TIMED EXAMINATION & PRINTABLE A4 TRANSCRIPT
 * ======================================================================== */
function ExamPage({ studentUser, onOpenStudentLogin, onSaveStudent }) {
  const [subjects, setSubjects] = useState(() => API_CACHE.subjects || []);
  const [config, setConfig] = useState({
    subjectId: API_CACHE.subjects?.[0]?._id || '',
    questionCount: 20,
    durationMinutes: 20
  });
  const [inlineAuth, setInlineAuth] = useState({
    name: '',
    className: '',
    rollNo: '',
    institution: ''
  });
  const [inlineAuthError, setInlineAuthError] = useState('');
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentExamIndex, setCurrentExamIndex] = useState(0);
  const [skippedQuestions, setSkippedQuestions] = useState(() => new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(() => !API_CACHE.subjects);
  const [examNavViewMode, setExamNavViewMode] = useState('scroll');
  const examNavContainerRef = useRef(null);

  useEffect(() => {
    if (examNavContainerRef.current) {
      const activeEl = examNavContainerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentExamIndex]);

  useEffect(() => {
    fetch('/api/subjects')
      .then(r => r.json())
      .then(d => {
        const list = d.data || [];
        API_CACHE.subjects = list;
        setSubjects(list);
        if (list[0]) {
          setConfig(c => (c.subjectId ? c : { ...c, subjectId: list[0]._id }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmitExam = async () => {
    if (!session || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/exams/${session.attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      if (data.success) {
        setTranscript(data.data);
        setShowSubmitModal(false);
      } else {
        alert(data.message || 'Failed to submit exam.');
      }
    } catch (err) {
      alert('Connection error while submitting exam. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!session || transcript) return;
    if (secondsLeft <= 0) {
      handleSubmitExam();
      return;
    }
    const timer = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [session, secondsLeft, transcript]);

  if (loading && !session && !transcript) {
    return (
      <AcademicLoader
        title="Loading Examination Simulator"
        subtitle="Configuring timed test modules, negative marking rules, and official papers..."
      />
    );
  }

  const handleInlineLoginSubmit = (e) => {
    e.preventDefault();
    if (!inlineAuth.name.trim()) {
      setInlineAuthError('Please enter candidate full name.');
      return;
    }
    if (!inlineAuth.className.trim()) {
      setInlineAuthError('Please enter candidate class or degree program.');
      return;
    }
    if (onSaveStudent) {
      onSaveStudent({
        name: inlineAuth.name.trim(),
        className: inlineAuth.className.trim(),
        rollNo: inlineAuth.rollNo.trim(),
        institution: inlineAuth.institution.trim()
      });
    }
  };

  const startExam = async (e) => {
    e.preventDefault();
    if (!studentUser) {
      if (onOpenStudentLogin) onOpenStudentLogin();
      return;
    }
    const res = await fetch('/api/exams/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId: config.subjectId,
        studentName: studentUser.name,
        studentClass: studentUser.className || '',
        studentRollNo: studentUser.rollNo || '',
        studentInstitution: studentUser.institution || '',
        questionCount: config.questionCount,
        durationMinutes: config.durationMinutes
      })
    });
    const data = await res.json();
    if (data.success) {
      setSession(data);
      setAnswers({});
      setSkippedQuestions(new Set());
      setCurrentExamIndex(0);
      setShowSubmitModal(false);
      setSecondsLeft(data.durationMinutes * 60);
    } else {
      alert(data.message || 'Could not start examination');
    }
  };

  const handleSelectExamOption = (optIdx) => {
    if (!session || !session.questions[currentExamIndex]) return;
    const qId = session.questions[currentExamIndex]._id;
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
    setSkippedQuestions(prev => {
      if (!prev.has(qId)) return prev;
      const next = new Set(prev);
      next.delete(qId);
      return next;
    });
  };

  const handleSkipExamQuestion = () => {
    if (!session || !session.questions[currentExamIndex]) return;
    const qId = session.questions[currentExamIndex]._id;
    if (answers[qId] === undefined) {
      setSkippedQuestions(prev => new Set(prev).add(qId));
    }
    if (currentExamIndex < session.questions.length - 1) {
      setCurrentExamIndex(i => i + 1);
    }
  };

  const handleNextExamQuestion = () => {
    if (!session) return;
    if (currentExamIndex < session.questions.length - 1) {
      setCurrentExamIndex(i => i + 1);
    }
  };

  const handlePrevExamQuestion = () => {
    if (currentExamIndex > 0) {
      setCurrentExamIndex(i => i - 1);
    }
  };

  if (transcript) {
    const { summary, items, subjectId } = transcript;
    return (
      <div className="max-w-4xl mx-auto my-3.5 sm:my-6 px-3 sm:px-4 space-y-3.5 sm:space-y-4 animate-fadeIn">
        {/* Top Action Bar (Hidden on Print) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs flex items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
              <Award className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Official Examination Transcript
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500">
                Verified candidate assessment & certified grade report
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTranscript(null);
                setSession(null);
                setAnswers({});
                setSkippedQuestions(new Set());
                setCurrentExamIndex(0);
              }}
              className="px-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95"
            >
              New Exam
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl bg-brand-navy hover:bg-brand-navyDark text-white text-xs font-bold shadow-xs transition active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4 PDF</span>
            </button>
          </div>
        </div>

        {/* Certificate Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-sm print:border-black print:rounded-none print:shadow-none print:p-6">
          {/* Institution & Exam Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b-2 border-brand-navy pb-3 mb-4">
            <div className="flex items-start gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-navy text-amber-400 flex items-center justify-center font-black shrink-0 print:border print:border-black">
                <GraduationCap className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-brand-navy tracking-wider">
                  Academic Question Bank & Assessment Authority
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight mt-0.5">
                  {transcript.title || 'Official Academic Examination'}
                </h2>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  Subject: <strong className="text-slate-900">{subjectId?.name || 'General Knowledge'}</strong>
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className={`px-2.5 py-1 rounded-full text-xs font-black inline-flex items-center gap-1 ${
                summary.passed
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {summary.passed ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>{summary.passed ? 'PASSED' : 'FAILED'} • Grade {summary.grade}</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                {new Date(transcript.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Candidate Credentials Box */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 mb-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Candidate Name</span>
                <p className="font-black text-slate-900 text-xs sm:text-sm truncate">{transcript.studentName || 'Student'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Class / Program</span>
                <p className="font-bold text-slate-800 truncate">{transcript.studentClass || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Roll / Seat No</span>
                <p className="font-bold font-mono text-slate-800 truncate">{transcript.studentRollNo || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Institution</span>
                <p className="font-bold text-slate-800 truncate">{transcript.studentInstitution || 'Online Examination'}</p>
              </div>
            </div>
          </div>

          {/* 4 Score Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-5 text-center">
            <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/80">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Obtained Marks</span>
              <p className="text-lg sm:text-xl font-black text-brand-navy mt-0.5">
                {summary.obtainedMarks} <span className="text-xs font-normal text-slate-500">/ {summary.totalQuestions}</span>
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Percentage</span>
              <p className="text-lg sm:text-xl font-black text-amber-900 mt-0.5">{summary.percentage}%</p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-200/80">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Accuracy Rate</span>
              <p className="text-lg sm:text-xl font-black text-purple-900 mt-0.5">{summary.accuracyRate}%</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Correct / Skipped</span>
              <p className="text-lg sm:text-xl font-black text-emerald-800 mt-0.5">
                {summary.correct} <span className="text-xs font-normal text-slate-500">/ {summary.unanswered}</span>
              </p>
            </div>
          </div>

          {/* Question Review Section Header */}
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-brand-navy" />
              <span>Detailed Question Evaluation & Answer Keys</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-semibold">{items.length} Questions</span>
          </div>

          {/* Questions Review List */}
          <div className="space-y-2">
            {items.map((item, idx) => {
              const formatOption = (opt) => {
                if (opt === null || opt === undefined) return '';
                if (typeof opt === 'string') return opt;
                if (typeof opt === 'object') return opt.text || opt.option || opt.label || JSON.stringify(opt);
                return String(opt);
              };

              const hasAnswered = item.selectedOption !== null && item.selectedOption !== undefined;
              const isCorrect = item.isCorrect;
              const isUrdu = item.questionId?.language === 'ur' || /[\u0600-\u06FF]/.test(item.questionId?.question || '');

              const userOpt = hasAnswered && item.questionId?.options
                ? formatOption(item.questionId.options[item.selectedOption])
                : 'Unanswered / Skipped';
              const correctOpt = item.questionId?.options
                ? formatOption(item.questionId.options[item.questionId.correctAnswer])
                : '';

              return (
                <div
                  key={idx}
                  className={`p-2.5 sm:p-3 rounded-xl border transition ${
                    isCorrect
                      ? 'bg-emerald-50/30 border-emerald-200/80'
                      : !hasAnswered
                      ? 'bg-amber-50/30 border-amber-200/80'
                      : 'bg-red-50/30 border-red-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5" dir="ltr">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded font-black text-[10px] bg-slate-900 text-white font-mono">
                        Q{idx + 1}
                      </span>
                      {item.questionId?.difficulty && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-700">
                          {item.questionId.difficulty}
                        </span>
                      )}
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                      isCorrect
                        ? 'bg-emerald-600 text-white'
                        : !hasAnswered
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-red-500 text-white'
                    }`}>
                      {isCorrect ? 'Correct (+1)' : !hasAnswered ? 'Skipped (0)' : 'Incorrect (0)'}
                    </span>
                  </div>

                  <p className={`text-xs sm:text-sm font-bold text-slate-900 mb-2 ${
                    isUrdu ? 'font-urdu text-right leading-relaxed text-sm sm:text-base' : 'leading-snug'
                  }`} dir={isUrdu ? 'rtl' : 'ltr'}>
                    {item.questionId?.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    <div className={`p-1.5 px-2 rounded-lg flex items-center gap-1.5 ${
                      isCorrect
                        ? 'bg-emerald-100/70 text-emerald-950 font-bold'
                        : !hasAnswered
                        ? 'bg-amber-100/60 text-amber-900'
                        : 'bg-red-100/70 text-red-950 font-bold'
                    }`}>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Your:</span>
                      <span className="truncate">{userOpt}</span>
                    </div>

                    {!isCorrect && (
                      <div className="p-1.5 px-2 rounded-lg bg-emerald-100/70 text-emerald-950 font-bold flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-emerald-700">Correct:</span>
                        <span className="truncate">{correctOpt}</span>
                      </div>
                    )}
                  </div>

                  {item.questionId?.explanation && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-600 flex items-start gap-1">
                      <HelpCircle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                      <p className={isUrdu ? 'font-urdu text-right leading-relaxed' : 'leading-relaxed'}>
                        {item.questionId.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Accreditation Stamp */}
          <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
            <span>Official Examination Verification Code: <strong className="font-mono text-slate-600">{transcript._id || transcript.attemptId}</strong></span>
            <span>Academic Standards Verified</span>
          </div>
        </div>
      </div>
    );
  }

  if (session) {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    const currentQ = session.questions[currentExamIndex];
    const answeredCount = Object.keys(answers).length;
    const skippedCount = Array.from(skippedQuestions).filter(id => answers[id] === undefined).length;
    const unansweredCount = session.questions.length - answeredCount;
    const progressPct = Math.round((answeredCount / session.questions.length) * 100);

    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3.5 sm:space-y-4">
        {/* Compact Exam Header Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-xs flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-brand-navy text-amber-400 font-black text-[10px] uppercase tracking-wider">
                Exam
              </span>
              {studentUser && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 truncate max-w-[140px] sm:max-w-none">
                  {studentUser.name}
                </span>
              )}
              <span className="text-xs text-slate-700 font-bold">
                Q {currentExamIndex + 1}<span className="text-slate-400 font-normal">/{session.questions.length}</span>
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-emerald-700 font-bold text-xs hidden sm:inline">{answeredCount} Answered ({progressPct}%)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Timer Badge */}
            <div className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 font-mono font-black text-xs sm:text-sm ${
              secondsLeft < 120
                ? 'bg-red-50 border-red-200 text-red-600 animate-pulse'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{mins}:{secs < 10 ? `0${secs}` : secs}</span>
            </div>

            {/* Quick Submit Button */}
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition active:scale-95 flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>
          </div>
        </div>

        {/* Question Navigator Width-Adaptive Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-xs">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Question Navigator
              </span>
              <button
                type="button"
                onClick={() => setExamNavViewMode(m => m === 'scroll' ? 'grid' : 'scroll')}
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border transition ${
                  examNavViewMode === 'grid'
                    ? 'bg-brand-navy text-amber-400 border-brand-navy'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
                title={examNavViewMode === 'scroll' ? "Switch to multi-row grid" : "Switch to single-row scroll"}
              >
                {examNavViewMode === 'scroll' ? (
                  <>
                    <LayoutGrid className="w-2.5 h-2.5" />
                    <span>Grid</span>
                  </>
                ) : (
                  <>
                    <List className="w-2.5 h-2.5" />
                    <span>Row</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Answered ({answeredCount})
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Skipped ({skippedCount})
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span> Pending ({session.questions.length - answeredCount - skippedCount})
              </span>
            </div>
          </div>

          <div
            ref={examNavViewMode === 'scroll' ? examNavContainerRef : undefined}
            className={`pb-1 pt-0.5 px-0.5 ${
              examNavViewMode === 'scroll'
                ? 'flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scroll-smooth'
                : 'flex flex-wrap items-center gap-1.5 sm:gap-2 max-h-64 overflow-y-auto'
            }`}
          >
            {session.questions.map((q, idx) => {
              const isCurrent = idx === currentExamIndex;
              const isAnswered = answers[q._id] !== undefined;
              const isSkipped = skippedQuestions.has(q._id) && !isAnswered;

              let btnStyle = 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/90 font-bold shadow-2xs';
              if (isAnswered) {
                btnStyle = 'bg-emerald-600 text-white font-bold hover:bg-emerald-700 border border-emerald-600 shadow-xs';
                if (isCurrent) {
                  btnStyle += ' ring-2 ring-amber-400 ring-offset-2 ring-offset-white scale-110 z-10';
                }
              } else if (isCurrent) {
                btnStyle = 'bg-amber-400 text-slate-950 font-black border-2 border-amber-500 ring-2 ring-amber-400/50 shadow-xs scale-110 z-10';
              } else if (isSkipped) {
                btnStyle = 'border-2 border-dashed border-amber-400 bg-amber-50 text-amber-900 font-bold hover:bg-amber-100';
              }

              return (
                <button
                  key={q._id || idx}
                  type="button"
                  data-active={isCurrent ? 'true' : undefined}
                  onClick={() => setCurrentExamIndex(idx)}
                  className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[11px] sm:text-xs flex items-center justify-center transition active:scale-95 ${btnStyle}`}
                  title={`Question ${idx + 1}${isAnswered ? ' (Answered)' : isSkipped ? ' (Skipped)' : ''}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Single Question Card */}
        {currentQ && (
          <QuestionCard
            index={currentExamIndex}
            totalCount={session.questions.length}
            questionObj={currentQ}
            selectedOption={answers[currentQ._id]}
            onSelectOption={handleSelectExamOption}
            showFeedback={false}
            mode="exam"
          />
        )}

        {/* Professional Navigation Controls (Sticky Bottom Bar) */}
        <div className="sticky bottom-16 sm:bottom-2 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2 sm:p-2.5 shadow-lg sm:shadow-sm flex items-center gap-2 animate-fadeIn">
          {/* Previous Button */}
          <button
            type="button"
            disabled={currentExamIndex === 0}
            onClick={handlePrevExamQuestion}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-3 sm:px-4 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          {/* Skip Button */}
          <button
            type="button"
            onClick={handleSkipExamQuestion}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 text-xs sm:text-sm font-bold transition active:scale-95"
          >
            <SkipForward className="w-4 h-4 text-amber-600" />
            <span>Skip</span>
          </button>

          {/* Next or Finish Button */}
          {currentExamIndex < session.questions.length - 1 ? (
            <button
              type="button"
              onClick={handleNextExamQuestion}
              className="flex-[1.4] sm:flex-initial inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-4 sm:px-6 rounded-xl bg-brand-navy hover:bg-brand-navyDark text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 sm:ml-auto"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="flex-[1.4] sm:flex-initial inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-4 sm:px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 sm:ml-auto"
            >
              <Check className="w-4 h-4" />
              <span>Submit</span>
            </button>
          )}

          {/* Right: Submit Button on desktop */}
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="hidden sm:inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 ml-auto"
          >
            <Check className="w-4 h-4" />
            <span>Finalize Exam</span>
          </button>
        </div>

        {/* Examination Submission Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-sm sm:max-w-md w-full p-5 sm:p-6 shadow-2xl text-slate-900 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-emerald-600" />
              </div>

              <h3 className="text-lg font-black text-center text-slate-900">
                Confirm Examination Submission
              </h3>
              <p className="text-xs text-slate-500 text-center mt-1 mb-4">
                Please verify your progress before officially finalizing your attempt.
              </p>

              {/* Status Breakdown Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3 text-center">
                <div className="p-2 bg-white rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Total</span>
                  <p className="text-base font-black text-slate-900">{session.questions.length}</p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Answered</span>
                  <p className="text-base font-black text-emerald-700">{answeredCount}</p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-amber-700 uppercase">Unanswered</span>
                  <p className="text-base font-black text-amber-700">{unansweredCount}</p>
                </div>
              </div>

              {/* Warning if any unanswered */}
              {unansweredCount > 0 && (
                <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    You have <strong>{unansweredCount} unanswered</strong> or skipped question{unansweredCount > 1 ? 's' : ''}. Unanswered questions will receive 0 marks.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                {unansweredCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmitModal(false);
                      const firstUnanswered = session.questions.findIndex(q => answers[q._id] === undefined);
                      if (firstUnanswered !== -1) {
                        setCurrentExamIndex(firstUnanswered);
                      }
                    }}
                    className="w-full sm:flex-1 py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
                  >
                    Review Questions
                  </button>
                )}
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitExam}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Grading Exam...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm & Submit</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium py-1"
                >
                  Return to Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If candidate is not authenticated yet, require student login before configuring exam
  if (!studentUser) {
    return (
      <div className="max-w-md mx-auto my-4 sm:my-6 px-3.5 sm:px-4 animate-fadeIn">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-600 flex items-center justify-center mx-auto mb-2.5 border border-amber-400/30">
            <GraduationCap className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight text-center">
            Candidate Login Required
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-4 max-w-xs sm:max-w-sm mx-auto text-center leading-relaxed">
            Please enter candidate credentials (Name, Class/Degree, and Roll Number) to start the examination and generate transcripts.
          </p>

          {inlineAuthError && (
            <div className="p-2 mb-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>{inlineAuthError}</span>
            </div>
          )}

          <form onSubmit={handleInlineLoginSubmit} className="space-y-3 text-left">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Candidate Full Name <span className="text-amber-500">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={inlineAuth.name}
                  onChange={(e) => {
                    setInlineAuth({ ...inlineAuth, name: e.target.value });
                    setInlineAuthError('');
                  }}
                  placeholder="Enter candidate full name"
                  className="w-full pl-10 pr-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Class / Degree / Grade <span className="text-amber-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Layers className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={inlineAuth.className}
                    onChange={(e) => {
                      setInlineAuth({ ...inlineAuth, className: e.target.value });
                      setInlineAuthError('');
                    }}
                    placeholder="e.g. BSCS 6th / Class 12"
                    className="w-full pl-10 pr-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Roll / Seat Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={inlineAuth.rollNo}
                    onChange={(e) => setInlineAuth({ ...inlineAuth, rollNo: e.target.value })}
                    placeholder="e.g. BCS-2023-042"
                    className="w-full pl-10 pr-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Institution / College <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <School className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={inlineAuth.institution}
                  onChange={(e) => setInlineAuth({ ...inlineAuth, institution: e.target.value })}
                  placeholder="e.g. Punjab University / Govt College"
                  className="w-full pl-10 pr-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 transition active:scale-98 flex items-center justify-center gap-1.5 mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Profile & Continue to Exam</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-4 sm:my-6 px-3.5 sm:px-4 animate-fadeIn">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-sm">
        {/* Candidate Profile Verification Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-xs shadow-sm shrink-0">
              {studentUser.name ? studentUser.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-900 text-xs sm:text-sm">{studentUser.name}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Class: <strong className="text-slate-700">{studentUser.className}</strong>
                {studentUser.rollNo && <> • Roll: <strong className="text-slate-700 font-mono">{studentUser.rollNo}</strong></>}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenStudentLogin}
            className="text-xs text-amber-600 hover:text-amber-700 font-bold transition px-2 py-1 rounded-lg hover:bg-amber-50 border border-amber-200 shrink-0"
          >
            Edit
          </button>
        </div>

        <h1 className="text-lg sm:text-xl font-black text-slate-900 mb-1">Configure Timed Examination</h1>
        <p className="text-xs text-slate-500 mb-4">
          Randomized syllabus questions with server evaluation & certified transcript.
        </p>

        <form onSubmit={startExam} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Select Subject</label>
            <select
              value={config.subjectId}
              onChange={(e) => setConfig({ ...config, subjectId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-brand-navy"
            >
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.questionCount} MCQs)</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Number of Questions</label>
              <input
                type="number"
                min="1"
                max="100"
                value={config.questionCount}
                onChange={(e) => setConfig({ ...config, questionCount: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm mb-1.5"
              />
              <div className="flex flex-wrap items-center gap-1">
                {[10, 20, 30, 50].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setConfig(c => ({ ...c, questionCount: cnt, durationMinutes: Math.round(cnt * 1.5) }))}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition border ${
                      Number(config.questionCount) === cnt
                        ? 'bg-brand-navy text-amber-400 border-brand-navy'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {cnt} MCQs
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                min="1"
                max="180"
                value={config.durationMinutes}
                onChange={(e) => setConfig({ ...config, durationMinutes: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-brand-navy hover:bg-brand-navyDark text-white font-bold text-sm shadow-sm transition active:scale-98 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 text-amber-400" />
            <span>Start Official Examination</span>
          </button>
        </form>
      </div>
    </div>
  );
}

/* ==========================================================================
 * 5. COMPREHENSIVE ADMIN CONTROL CENTER
 * ======================================================================== */
function AdminPanel({ adminUser, setAdminUser }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Data states
  const [stats, setStats] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [books, setBooks] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionPagination, setQuestionPagination] = useState({ total: 0, page: 1, pages: 1 });

  // Filters
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectProgramFilter, setSubjectProgramFilter] = useState('all');
  const [subjectStatusFilter, setSubjectStatusFilter] = useState('all');

  const [questionSearch, setQuestionSearch] = useState('');
  const [questionSubjectFilter, setQuestionSubjectFilter] = useState('');
  const [questionDifficultyFilter, setQuestionDifficultyFilter] = useState('all');

  // Modals & Edit Form States
  const [editingSubject, setEditingSubject] = useState(null);
  const [editSubjectForm, setEditSubjectForm] = useState({
    name: '', code: '', programOrClass: 'BSCS', semester: '5th', academicYear: '2026', language: 'en', status: 'published', description: ''
  });
  const [isCreatingSubject, setIsCreatingSubject] = useState(false);
  const [newSubjectForm, setNewSubjectForm] = useState({
    name: '', code: '', programOrClass: 'BSCS', semester: '5th', academicYear: '2026', language: 'en', status: 'published', description: ''
  });
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [isDeletingSubject, setIsDeletingSubject] = useState(false);

  // JSON & File Upload States
  const [uploadMode, setUploadMode] = useState('json'); // 'json' or 'file'
  const [uploadFile, setUploadFile] = useState(null);
  const [rawJsonText, setRawJsonText] = useState(JSON.stringify(SAMPLE_JSON_TEMPLATE, null, 2));
  const [uploadSubjectId, setUploadSubjectId] = useState('');
  const [isNewSubjectUpload, setIsNewSubjectUpload] = useState(false);
  const [newSubjectForUpload, setNewSubjectForUpload] = useState({ name: '', programOrClass: 'BSCS', code: '' });
  const [uploadBookTitle, setUploadBookTitle] = useState('');
  const [publishImmediately, setPublishImmediately] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(true);
  const [preview, setPreview] = useState(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  // Edit Question State
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Refresh all admin data
  const refreshAdminData = async () => {
    try {
      const headers = getAuthHeaders();
      const [statsRes, subRes, booksRes] = await Promise.all([
        fetch('/api/admin/stats', { headers, credentials: 'include' }),
        fetch('/api/admin/subjects', { headers, credentials: 'include' }),
        fetch('/api/admin/books', { headers, credentials: 'include' })
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats);
      }
      if (subRes.ok) {
        const d = await subRes.json();
        setSubjects(d.data || []);
        if (d.data?.length > 0 && !uploadSubjectId) {
          setUploadSubjectId(d.data[0]._id);
        }
      }
      if (booksRes.ok) {
        const d = await booksRes.json();
        setBooks(d.data || []);
      }
    } catch (err) {
      console.error('Failed to refresh admin data:', err);
    }
  };

  // Fetch questions with current filters
  const fetchQuestions = async (page = 1) => {
    try {
      const headers = getAuthHeaders();
      const params = new URLSearchParams({
        page,
        limit: 15,
        ...(questionSearch ? { search: questionSearch } : {}),
        ...(questionSubjectFilter ? { subjectId: questionSubjectFilter } : {}),
        ...(questionDifficultyFilter !== 'all' ? { difficulty: questionDifficultyFilter } : {})
      });
      const res = await fetch(`/api/admin/questions?${params.toString()}`, { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.data || []);
        setQuestionPagination(data.pagination || { total: 0, page: 1, pages: 1 });
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    }
  };

  useEffect(() => {
    if (adminUser) {
      refreshAdminData();
    }
  }, [adminUser]);

  useEffect(() => {
    if (adminUser && activeTab === 'questions') {
      fetchQuestions(1);
    }
  }, [adminUser, activeTab, questionSubjectFilter, questionDifficultyFilter]);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        if (res.status === 405 || res.status === 404) {
          throw new Error('API server is not responding at /api/admin/login. Ensure Vercel Root Directory is set to `./` so backend serverless functions are active.');
        }
        throw new Error(text.slice(0, 100) || `Server error (${res.status})`);
      }
      if (data.success) {
        localStorage.setItem('qb_admin_token', data.token);
        localStorage.setItem('qb_admin_user', JSON.stringify(data.user));
        setAdminUser(data.user);
        setStatusMsg('Welcome back, ' + data.user.name);
      } else {
        setAuthError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setAuthError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {}
    localStorage.removeItem('qb_admin_token');
    localStorage.removeItem('qb_admin_user');
    setAdminUser(null);
    setStats(null);
  };

  // --- SUBJECT ACTIONS ---
  const handleOpenEditSubject = (subject) => {
    setEditingSubject(subject);
    setEditSubjectForm({
      name: subject.name || '',
      code: subject.code || '',
      programOrClass: subject.programOrClass || 'BSCS',
      semester: subject.semester || '',
      academicYear: subject.academicYear || '2026',
      language: subject.language || 'en',
      status: subject.status || 'published',
      description: subject.description || ''
    });
  };

  const handleUpdateSubject = async (e) => {
    e.preventDefault();
    if (!editingSubject) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/subjects/${editingSubject._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(editSubjectForm)
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Subject "${data.data.name}" updated successfully!`);
        setEditingSubject(null);
        refreshAdminData();
      } else {
        alert(data.message || 'Failed to update subject');
      }
    } catch (err) {
      alert('Error updating subject: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(newSubjectForm)
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Subject "${data.data.name}" created successfully!`);
        setIsCreatingSubject(false);
        setNewSubjectForm({
          name: '', code: '', programOrClass: 'BSCS', semester: '5th', academicYear: '2026', language: 'en', status: 'published', description: ''
        });
        refreshAdminData();
      } else {
        alert(data.message || 'Failed to create subject');
      }
    } catch (err) {
      alert('Error creating subject: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteDeleteSubject = async (subjectId, archiveOnly = false) => {
    setIsDeletingSubject(true);
    try {
      const url = `/api/admin/subjects/${subjectId}?${archiveOnly ? 'archiveOnly=true' : 'cascade=true'}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        if (archiveOnly) {
          setSubjects(prev => prev.map(s => s._id === subjectId ? { ...s, status: 'archived' } : s));
          setStatusMsg(data.message || 'Subject archived.');
        } else {
          // Immediately remove from state for instant feedback
          setSubjects(prev => prev.filter(s => s._id !== subjectId));
          setStatusMsg(data.message || 'Subject deleted permanently.');
        }
        setSubjectToDelete(null);
        refreshAdminData();
      } else {
        alert(data.message || 'Failed to delete subject');
      }
    } catch (err) {
      alert('Error deleting subject: ' + err.message);
    } finally {
      setIsDeletingSubject(false);
    }
  };

  const handleDeleteBook = async (book) => {
    if (!window.confirm(`Are you sure you want to permanently delete reference book "${book.title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/books/${book._id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setBooks(prev => prev.filter(b => b._id !== book._id));
        setStatusMsg(data.message || 'Book deleted.');
        refreshAdminData();
      } else {
        alert(data.message || 'Failed to delete book');
      }
    } catch (err) {
      alert('Error deleting book: ' + err.message);
    }
  };

  // --- JSON / FILE BULK UPLOAD ACTIONS ---
  const handlePreviewUpload = async (e) => {
    e.preventDefault();
    setPreview(null);
    setLoading(true);

    try {
      const selectedSubObj = subjects.find(s => s._id === uploadSubjectId);
      const effectiveSubName = isNewSubjectUpload ? newSubjectForUpload.name : (selectedSubObj ? selectedSubObj.name : '');

      if (!effectiveSubName) {
        alert('Please select an existing subject or provide a new subject name.');
        setLoading(false);
        return;
      }

      if (uploadMode === 'file') {
        if (!uploadFile) {
          alert('Please select a JSON, CSV, or DOCX file to upload.');
          setLoading(false);
          return;
        }
        const fd = new FormData();
        fd.append('file', uploadFile);
        fd.append('subjectName', effectiveSubName);
        if (isNewSubjectUpload) fd.append('programOrClass', newSubjectForUpload.programOrClass);

        const token = localStorage.getItem('qb_admin_token');
        const res = await fetch('/api/admin/imports/preview', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include',
          body: fd
        });
        const data = await res.json();
        if (data.success) {
          setPreview(data.preview);
          if (data.preview.metadata?.book && !uploadBookTitle) {
            setUploadBookTitle(data.preview.metadata.book);
          }
        } else {
          alert(data.message || 'Validation failed');
        }
      } else {
        // Direct Raw JSON Mode
        if (!rawJsonText.trim()) {
          alert('Please enter or paste JSON MCQs array.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/admin/imports/json', {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({
            jsonContent: rawJsonText,
            subjectName: effectiveSubName,
            programOrClass: isNewSubjectUpload ? newSubjectForUpload.programOrClass : undefined
          })
        });
        const data = await res.json();
        if (data.success) {
          setPreview(data.preview);
          if (data.preview.metadata?.book && !uploadBookTitle) {
            setUploadBookTitle(data.preview.metadata.book);
          }
        } else {
          alert(data.message || 'Validation failed');
        }
      }
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommitImport = async () => {
    if (!preview || !preview.stagedPayload || preview.stagedPayload.length === 0) {
      alert('No valid questions available to import.');
      return;
    }

    setLoading(true);
    try {
      const selectedSubObj = subjects.find(s => s._id === uploadSubjectId);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          subjectId: isNewSubjectUpload ? null : (selectedSubObj?._id || preview.subjectResolution?.subject?._id || null),
          createNewSubject: isNewSubjectUpload ? newSubjectForUpload : (!uploadSubjectId && !preview.subjectResolution?.subject ? { name: preview.filename } : null),
          bookTitle: uploadBookTitle,
          questions: preview.stagedPayload,
          publishImmediately,
          randomizeOptions
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(
          `Successfully committed ${data.summary.insertedCount} MCQs to database! (${data.summary.skippedDuplicates} duplicates automatically skipped).`
        );
        setPreview(null);
        setUploadFile(null);
        refreshAdminData();
        setActiveTab('dashboard');
      } else {
        alert(data.message || 'Commit failed');
      }
    } catch (err) {
      alert('Error committing import: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(JSON.stringify(SAMPLE_JSON_TEMPLATE, null, 2));
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([JSON.stringify(SAMPLE_JSON_TEMPLATE, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mcqs_import_template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- QUESTION ACTIONS ---
  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`/api/admin/questions/${qId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('Question deleted.');
        fetchQuestions(questionPagination.page);
        refreshAdminData();
      }
    } catch (e) {
      alert('Failed to delete question');
    }
  };

  // ========================================================================
  // RENDER: LOGIN FORM (If not logged in)
  // ========================================================================
  if (!adminUser) {
    return (
      <div className="max-w-md mx-auto my-8 sm:my-16 px-4 animate-fadeIn">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 shadow-xs mb-1">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Faculty & Admin Portal</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
              Secure institutional access for question banking, syllabus governance, and curriculum oversight.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/90 text-rose-700 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{authError}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="name@institution.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 transition bg-slate-50/50 hover:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 transition bg-slate-50/50 hover:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-semibold text-sm hover:from-blue-800 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-600/25 transition disabled:opacity-50 shadow-md shadow-blue-700/15 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In to Governance Portal</span>
              )}
            </button>
          </form>

          {/* Security Notice Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>256-bit Encrypted Session · Faculty Authorized Only</span>
          </div>
        </div>
      </div>
    );
  }

  // Filtered Subjects
  const filteredSubjects = subjects.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      (s.code || '').toLowerCase().includes(subjectSearch.toLowerCase()) ||
      (s.programOrClass || '').toLowerCase().includes(subjectSearch.toLowerCase());
    const matchesProgram = subjectProgramFilter === 'all' || s.programOrClass === subjectProgramFilter;
    const matchesStatus = subjectStatusFilter === 'all' || s.status === subjectStatusFilter;
    return matchesSearch && matchesProgram && matchesStatus;
  });

  const uniquePrograms = Array.from(new Set(subjects.map(s => s.programOrClass).filter(Boolean)));

  // ========================================================================
  // RENDER: FULL ADMIN DASHBOARD & CONTROL CENTER
  // ========================================================================
  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-3 sm:py-5 space-y-3.5 sm:space-y-4">
      {/* Top Admin Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Admin Control Center</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Session
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Logged in as <strong>{adminUser.name}</strong> ({adminUser.email}) • Role: <span className="capitalize font-semibold text-slate-700">{adminUser.role}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => { setActiveTab('upload'); setUploadMode('json'); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-brand-gold text-slate-950 text-xs font-bold hover:bg-brand-goldHover transition shadow-2xs"
          >
            <UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span>Upload JSON</span>
          </button>
          <button
            onClick={() => setIsCreatingSubject(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navyDark transition shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span>Add Subject</span>
          </button>
          <button
            onClick={refreshAdminData}
            title="Refresh statistics and data"
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Status / Alert Banner */}
      {statusMsg && (
        <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMsg}</span>
          </div>
          <button onClick={() => setStatusMsg('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs - Sleek Pill Strip */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 text-xs font-semibold whitespace-nowrap">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg transition ${
            activeTab === 'dashboard'
              ? 'bg-white text-brand-navy shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg transition ${
            activeTab === 'subjects'
              ? 'bg-white text-brand-navy shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Subjects ({subjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg transition ${
            activeTab === 'upload'
              ? 'bg-white text-brand-navy shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>JSON Upload</span>
          <span className="px-1 py-0.2 rounded text-[9px] bg-brand-gold text-slate-950 font-black">BULK</span>
        </button>

        <button
          onClick={() => { setActiveTab('questions'); fetchQuestions(1); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg transition ${
            activeTab === 'questions'
              ? 'bg-white text-brand-navy shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>MCQs Bank</span>
        </button>

        <button
          onClick={() => setActiveTab('books')}
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg transition ${
            activeTab === 'books'
              ? 'bg-white text-brand-navy shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Books ({books.length})</span>
        </button>
      </div>

      {/* ====================================================================
       * TAB 1: DASHBOARD & OVERVIEW
       * ================================================================== */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-3.5 sm:space-y-4">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] uppercase font-bold text-slate-400">
                <span>Total MCQs</span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-brand-navy mt-0.5">{stats.totalQuestions}</p>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate block mt-0.5">
                {stats.publishedQuestions} Live • {stats.draftQuestions} Drafts
              </span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] uppercase font-bold text-slate-400">
                <span>Active Subjects</span>
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats.totalSubjects}</p>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate block mt-0.5">
                {stats.publishedSubjects} Live in Portal
              </span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] uppercase font-bold text-slate-400">
                <span>Syllabus Books</span>
                <Layers className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats.totalBooks}</p>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate block mt-0.5">
                Across All Semesters
              </span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] uppercase font-bold text-slate-400">
                <span>Exams Taken</span>
                <Award className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">{stats.totalExams}</p>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate block mt-0.5">
                Candidate Submissions
              </span>
            </div>
          </div>

          {/* Quick Actions & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
            {/* Subject Distribution */}
            <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">MCQs Distribution by Subject</h3>
                <button
                  onClick={() => setActiveTab('subjects')}
                  className="text-xs font-semibold text-brand-navy hover:underline"
                >
                  Manage Subjects →
                </button>
              </div>

              <div className="space-y-2.5">
                {stats.subjectBreakdown?.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{item.subject} {item.code ? `(${item.code})` : ''}</span>
                      <span className="text-slate-500">{item.count} MCQs</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-brand-navy h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (item.count / (stats.totalQuestions || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-2.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Administrator Shortcuts</h3>
              <div className="space-y-2">
                <button
                  onClick={() => { setActiveTab('upload'); setUploadMode('json'); }}
                  className="w-full p-2.5 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-100/60 text-left flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-gold text-slate-950 flex items-center justify-center font-bold shrink-0">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Upload MCQs via JSON</p>
                      <p className="text-[11px] text-slate-500">Bulk import with duplicate checks</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => { setActiveTab('subjects'); setIsCreatingSubject(true); }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-navy text-white flex items-center justify-center font-bold shrink-0">
                      <FolderPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Add New Academic Subject</p>
                      <p className="text-[11px] text-slate-500">Course code & program syllabus</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => { setActiveTab('questions'); fetchQuestions(1); }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold shrink-0">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Browse Question Bank</p>
                      <p className="text-[11px] text-slate-500">Audit answers & explanations</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Recent Candidate Exams */}
          {stats.recentExams && stats.recentExams.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xs space-y-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Recent Examination Submissions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                      <th className="py-2 px-2.5">Candidate</th>
                      <th className="py-2 px-2.5">Subject</th>
                      <th className="py-2 px-2.5">Score</th>
                      <th className="py-2 px-2.5">Percentage</th>
                      <th className="py-2 px-2.5">Grade</th>
                      <th className="py-2 px-2.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentExams.map(ex => (
                      <tr key={ex._id} className="hover:bg-slate-50/60 transition">
                        <td className="py-2 px-2.5 font-semibold text-slate-900">{ex.studentName}</td>
                        <td className="py-2 px-2.5 text-slate-600">{ex.subjectId?.name || ex.title}</td>
                        <td className="py-2 px-2.5 font-medium">{ex.summary?.obtainedMarks} / {ex.summary?.totalQuestions}</td>
                        <td className="py-2 px-2.5 font-bold">{ex.summary?.percentage}%</td>
                        <td className="py-2 px-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ex.summary?.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {ex.summary?.grade}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-slate-400 text-[11px]">{new Date(ex.submittedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
       * TAB 2: SUBJECT MANAGEMENT (Update Any Subject & Add New)
       * ================================================================== */}
      {activeTab === 'subjects' && (
        <div className="space-y-3 sm:space-y-3.5">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-2xs">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Academic Subjects Catalog</h2>
              <p className="text-[11px] sm:text-xs text-slate-500">Edit curriculum, update syllabus, change status, or add new subjects</p>
            </div>
            <button
              onClick={() => setIsCreatingSubject(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navyDark transition shadow-2xs self-start sm:self-auto"
            >
              <PlusCircle className="w-3.5 h-3.5" /> <span>Add New Subject</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search subject by name, code, program..."
                value={subjectSearch}
                onChange={e => setSubjectSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-brand-navy"
              />
            </div>

            <select
              value={subjectProgramFilter}
              onChange={e => setSubjectProgramFilter(e.target.value)}
              className="px-2.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs font-medium bg-white"
            >
              <option value="all">All Programs ({subjects.length})</option>
              {uniquePrograms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select
              value={subjectStatusFilter}
              onChange={e => setSubjectStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs font-medium bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Subjects Table */}
          <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[10px] sm:text-[11px] uppercase font-bold tracking-wider">
                    <th className="py-2 px-3">Subject Name</th>
                    <th className="py-2 px-2.5">Code</th>
                    <th className="py-2 px-2.5">Program</th>
                    <th className="py-2 px-2.5">Semester</th>
                    <th className="py-2 px-2.5">MCQs</th>
                    <th className="py-2 px-2.5">Books</th>
                    <th className="py-2 px-2.5">Status</th>
                    <th className="py-2 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubjects.map(sub => (
                    <tr key={sub._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-900 text-xs">{sub.name}</div>
                        {sub.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">{sub.description}</div>
                        )}
                      </td>
                      <td className="py-2 px-2.5 font-mono text-[11px] font-semibold text-slate-700">
                        {sub.code || '—'}
                      </td>
                      <td className="py-2 px-2.5 text-xs font-medium text-slate-700">
                        {sub.programOrClass || 'General'}
                      </td>
                      <td className="py-2 px-2.5 text-xs text-slate-600">
                        {sub.semester || '—'}
                      </td>
                      <td className="py-2 px-2.5 font-bold text-slate-900">
                        {sub.questionCount || 0}
                      </td>
                      <td className="py-2 px-2.5 text-xs text-slate-600">
                        {sub.bookCount || 0}
                      </td>
                      <td className="py-2 px-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          sub.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : sub.status === 'draft'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditSubject(sub)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 text-[11px] font-bold text-slate-700 hover:bg-slate-100 hover:text-brand-navy transition shadow-2xs"
                            title="Update Subject details"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setSubjectToDelete(sub)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            title={`Delete subject "${sub.name}"`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSubjects.length === 0 && (
                    <tr>
                      <td colSpan="8" className="py-6 text-center text-slate-500 text-xs">
                        No subjects match your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
       * TAB 3: UPLOAD USING JSON FILE IN MCQS BANK
       * ================================================================== */}
      {activeTab === 'upload' && (
        <div className="space-y-3 sm:space-y-3.5">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-brand-navy to-slate-900 text-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
                  Bulk MCQ Ingestion Engine
                </span>
                <h2 className="text-base sm:text-lg font-bold mt-1">Upload MCQs Using JSON File</h2>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 max-w-xl">
                  Import questions in bulk with automatic schema validation, option formatting, and duplicate checks.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyTemplate}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition"
                >
                  {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTemplate ? 'Copied!' : 'Copy Sample'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-gold text-slate-950 text-xs font-bold hover:bg-brand-goldHover transition shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5">
            {/* Left Column: Target Configuration & Input */}
            <div className="lg:col-span-7 space-y-3">
              {/* Step 1: Target Subject */}
              <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-2xs space-y-2.5">
                <h3 className="text-xs font-bold uppercase text-brand-navy flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-brand-navy/10 text-brand-navy flex items-center justify-center text-[11px] font-bold">1</span>
                  Select Target Academic Subject
                </h3>

                <div className="flex gap-3 text-xs font-semibold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="subType"
                      checked={!isNewSubjectUpload}
                      onChange={() => setIsNewSubjectUpload(false)}
                      className="text-brand-navy"
                    />
                    Existing Subject
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="subType"
                      checked={isNewSubjectUpload}
                      onChange={() => setIsNewSubjectUpload(true)}
                      className="text-brand-navy"
                    />
                    + New Subject On The Fly
                  </label>
                </div>

                {!isNewSubjectUpload ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Subject</label>
                    <select
                      value={uploadSubjectId}
                      onChange={e => setUploadSubjectId(e.target.value)}
                      className="w-full px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs bg-white"
                    >
                      {subjects.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.name} {s.code ? `(${s.code})` : ''} — {s.programOrClass} ({s.questionCount || 0} MCQs)
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Subject Name *"
                      value={newSubjectForUpload.name}
                      onChange={e => setNewSubjectForUpload({ ...newSubjectForUpload, name: e.target.value })}
                      className="px-3 py-1.5 rounded-lg border text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Program (e.g. BSCS)"
                      value={newSubjectForUpload.programOrClass}
                      onChange={e => setNewSubjectForUpload({ ...newSubjectForUpload, programOrClass: e.target.value })}
                      className="px-3 py-1.5 rounded-lg border text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Code (e.g. CS-301)"
                      value={newSubjectForUpload.code}
                      onChange={e => setNewSubjectForUpload({ ...newSubjectForUpload, code: e.target.value })}
                      className="px-3 py-1.5 rounded-lg border text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Reference Book / Syllabus Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Operating System Concepts (9th Edition)"
                    value={uploadBookTitle}
                    onChange={e => setUploadBookTitle(e.target.value)}
                    className="w-full px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Step 2: JSON or File Input */}
              <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase text-brand-navy flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-brand-navy/10 text-brand-navy flex items-center justify-center text-[11px] font-bold">2</span>
                    Provide JSON MCQs Data
                  </h3>

                  <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setUploadMode('json')}
                      className={`px-2.5 py-0.5 rounded-md transition text-[11px] ${uploadMode === 'json' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                    >
                      Paste JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('file')}
                      className={`px-2.5 py-0.5 rounded-md transition text-[11px] ${uploadMode === 'file' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                    >
                      Upload File
                    </button>
                  </div>
                </div>

                {uploadMode === 'file' ? (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-brand-navy transition bg-slate-50/50">
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-slate-700">Drag & drop your .json file here, or browse</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Supports .json, .csv, and .docx formats up to 15MB</p>
                    <input
                      type="file"
                      accept=".json,.csv,.docx"
                      onChange={e => setUploadFile(e.target.files?.[0] || null)}
                      className="mt-2.5 block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-navy file:text-white hover:file:bg-brand-navyDark"
                    />
                    {uploadFile && (
                      <div className="mt-2 text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>Questions array or object with "questions" array</span>
                      <button
                        type="button"
                        onClick={() => setRawJsonText(JSON.stringify(SAMPLE_JSON_TEMPLATE, null, 2))}
                        className="text-brand-navy font-semibold hover:underline"
                      >
                        Reset Template
                      </button>
                    </div>
                    <textarea
                      rows={8}
                      value={rawJsonText}
                      onChange={e => setRawJsonText(e.target.value)}
                      placeholder='[ { "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0 } ]'
                      className="w-full font-mono text-xs p-3 rounded-xl border border-slate-300 bg-slate-900 text-emerald-400 focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={publishImmediately}
                        onChange={e => setPublishImmediately(e.target.checked)}
                        className="rounded text-brand-navy"
                      />
                      <span>Publish immediately (Live in student portal)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={randomizeOptions}
                        onChange={e => setRandomizeOptions(e.target.checked)}
                        className="rounded text-brand-navy"
                      />
                      <span>Randomize option positions (Distributes correct answer across A, B, C, D)</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handlePreviewUpload}
                    className="px-4 py-2 rounded-lg sm:rounded-xl bg-brand-gold text-slate-950 font-extrabold text-xs hover:bg-brand-goldHover transition shadow-2xs disabled:opacity-50 self-end sm:self-auto"
                  >
                    {loading ? 'Validating...' : 'Validate & Preview JSON'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Validation & Live Preview */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold uppercase text-brand-navy flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-brand-navy/10 text-brand-navy flex items-center justify-center text-[11px] font-bold">3</span>
                  Validation Report & Staged MCQs
                </h3>

                {!preview ? (
                  <div className="p-6 text-center border border-dashed rounded-xl text-slate-400 space-y-1.5">
                    <Eye className="w-6 h-6 mx-auto text-slate-300" />
                    <p className="text-xs font-medium">Click "Validate & Preview JSON" to inspect parsed MCQs, duplicate checks, and options formatting.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Metrics Banner */}
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="p-2 rounded-xl bg-slate-50 border">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
                        <p className="text-base font-bold text-slate-800">{preview.totalParsed}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                        <span className="text-[10px] uppercase font-bold text-emerald-600">Valid</span>
                        <p className="text-base font-bold text-emerald-800">{preview.validCount}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                        <span className="text-[10px] uppercase font-bold text-amber-700">Duplicates</span>
                        <p className="text-base font-bold text-amber-800">{preview.duplicateCount}</p>
                      </div>
                    </div>

                    {/* Subject Resolution Note */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border text-xs">
                      <p className="text-slate-600 truncate">
                        File: <strong>{preview.filename}</strong>
                      </p>
                      <p className="text-slate-600 mt-0.5">
                        Target: <strong className="text-brand-navy">{preview.subjectResolution?.status}</strong>
                      </p>
                    </div>

                    {/* Errors Report if any */}
                    {preview.errors && preview.errors.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-1 max-h-28 overflow-y-auto">
                        <p className="font-bold">Errors Found ({preview.errors.length}):</p>
                        {preview.errors.map((err, i) => (
                          <p key={i}>• {err}</p>
                        ))}
                      </div>
                    )}

                    {/* Question Preview List */}
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-700">Previewing Questions ({preview.validCount}):</p>
                      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                        {preview.stagedPayload?.slice(0, 8).map((q, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                            <p className="font-semibold text-slate-900 leading-snug">{idx + 1}. {q.question}</p>
                            <div className="grid grid-cols-2 gap-1 text-[10px]">
                              {q.options?.map((opt, optIdx) => (
                                <span
                                  key={optIdx}
                                  className={`px-1.5 py-0.5 rounded truncate ${
                                    optIdx === q.correctAnswer
                                      ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                                      : 'bg-white text-slate-600 border border-slate-200'
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIdx)}. {opt}
                                </span>
                              ))}
                            </div>
                            {q.explanation && (
                              <p className="text-[10px] text-slate-500 italic">Exp: {q.explanation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Commit Button */}
                    <button
                      type="button"
                      disabled={loading || preview.validCount === 0}
                      onClick={handleCommitImport}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition shadow-2xs disabled:opacity-50"
                    >
                      {loading ? 'Committing...' : `Commit ${preview.validCount} MCQs to Bank`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
       * TAB 4: QUESTIONS BANK MANAGER
       * ================================================================== */}
      {activeTab === 'questions' && (
        <div className="space-y-3 sm:space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-2xs">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">MCQs Bank Repository</h2>
              <p className="text-[11px] sm:text-xs text-slate-500">Search, inspect correct answers, difficulty ratings, or delete questions</p>
            </div>
            <button
              onClick={() => { setActiveTab('upload'); setUploadMode('json'); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl bg-brand-gold text-slate-950 text-xs font-bold hover:bg-brand-goldHover transition shadow-2xs self-start sm:self-auto"
            >
              <UploadCloud className="w-3.5 h-3.5" /> <span>Bulk Upload JSON</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search question text or chapter..."
                value={questionSearch}
                onChange={e => setQuestionSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchQuestions(1)}
                className="w-full pl-8 pr-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-brand-navy"
              />
            </div>

            <select
              value={questionSubjectFilter}
              onChange={e => setQuestionSubjectFilter(e.target.value)}
              className="px-2.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs font-medium bg-white"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>

            <select
              value={questionDifficultyFilter}
              onChange={e => setQuestionDifficultyFilter(e.target.value)}
              className="px-2.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs font-medium bg-white"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <button
              onClick={() => fetchQuestions(1)}
              className="px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navyDark transition"
            >
              Search
            </button>
          </div>

          {/* Questions Cards */}
          <div className="space-y-2.5">
            {questions.map((q, idx) => (
              <div key={q._id} className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-brand-navy/10 text-brand-navy">
                      {q.subjectId?.name || 'Subject'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold capitalize bg-slate-100 text-slate-700">
                      {q.difficulty}
                    </span>
                    {q.chapter && <span className="text-[11px] text-slate-500 font-medium">{q.chapter}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDeleteQuestion(q._id)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="font-semibold text-slate-900 text-xs sm:text-sm leading-snug">{q.question}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  {q.options?.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`p-2 rounded-lg border text-xs ${
                        optIdx === q.correctAnswer
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-slate-200 bg-slate-50/70 text-slate-700'
                      }`}
                    >
                      <span className="inline-block w-4 font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}

            {questions.length === 0 && (
              <div className="p-8 text-center bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl">
                <p className="text-slate-500 text-xs font-medium">No questions found matching criteria.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {questionPagination.pages > 1 && (
            <div className="flex items-center justify-between text-xs font-semibold pt-1">
              <span className="text-slate-500 text-[11px]">
                Page {questionPagination.page} of {questionPagination.pages} ({questionPagination.total} MCQs)
              </span>
              <div className="flex gap-1.5">
                <button
                  disabled={questionPagination.page <= 1}
                  onClick={() => fetchQuestions(questionPagination.page - 1)}
                  className="px-2.5 py-1 rounded-lg border bg-white text-xs disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={questionPagination.page >= questionPagination.pages}
                  onClick={() => fetchQuestions(questionPagination.page + 1)}
                  className="px-2.5 py-1 rounded-lg border bg-white text-xs disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
       * TAB 5: REFERENCE BOOKS MANAGER
       * ================================================================== */}
      {activeTab === 'books' && (
        <div className="space-y-3 sm:space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-2xs">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Academic Books & Syllabi</h2>
              <p className="text-[11px] sm:text-xs text-slate-500">Manage course textbooks, authors, and syllabus chapters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
            {books.map(b => (
              <div key={b._id} className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-2xs flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-brand-navy mb-1.5">
                    <span>{b.subjectId?.name || 'Subject'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                      {b.questionCount || 0} MCQs
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">{b.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Author: {b.author || 'Academic Faculty'} • {b.edition || 'Standard Edition'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Program: {b.programOrClass || 'General'} {b.semester}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t text-[11px] text-slate-400">
                  <span>Version {b.contentVersion || 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="capitalize font-semibold text-emerald-700">{b.status}</span>
                    <button
                      onClick={() => handleDeleteBook(b)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      title={`Delete book "${b.title}"`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================
       * MODAL: EDIT SUBJECT MODAL (Update Any Subject)
       * ================================================================== */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-xl space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2.5">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-brand-navy" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">Update Subject: {editingSubject.name}</h3>
              </div>
              <button
                onClick={() => setEditingSubject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubject} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={editSubjectForm.name}
                  onChange={e => setEditSubjectForm({ ...editSubjectForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-brand-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CS-301"
                    value={editSubjectForm.code}
                    onChange={e => setEditSubjectForm({ ...editSubjectForm, code: e.target.value })}
                    className="w-full px-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Program / Class</label>
                  <input
                    type="text"
                    placeholder="e.g. BSCS"
                    value={editSubjectForm.programOrClass}
                    onChange={e => setEditSubjectForm({ ...editSubjectForm, programOrClass: e.target.value })}
                    className="w-full px-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Semester</label>
                  <input
                    type="text"
                    placeholder="e.g. 5th"
                    value={editSubjectForm.semester}
                    onChange={e => setEditSubjectForm({ ...editSubjectForm, semester: e.target.value })}
                    className="w-full px-2.5 py-1.5 sm:py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Language</label>
                  <select
                    value={editSubjectForm.language}
                    onChange={e => setEditSubjectForm({ ...editSubjectForm, language: e.target.value })}
                    className="w-full px-2 py-1.5 sm:py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="en">English</option>
                    <option value="ur">Urdu</option>
                    <option value="bilingual">Bilingual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Status</label>
                  <select
                    value={editSubjectForm.status}
                    onChange={e => setEditSubjectForm({ ...editSubjectForm, status: e.target.value })}
                    className="w-full px-2 py-1.5 sm:py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Description / Syllabus</label>
                <textarea
                  rows={2}
                  value={editSubjectForm.description}
                  onChange={e => setEditSubjectForm({ ...editSubjectForm, description: e.target.value })}
                  placeholder="Outline topics covered in this question bank..."
                  className="w-full px-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-navy"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-3.5 py-1.5 sm:py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 sm:py-2 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navyDark shadow-2xs disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
       * MODAL: ADD NEW SUBJECT
       * ================================================================== */}
      {isCreatingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-xl space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2.5">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-brand-navy" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Add New Academic Subject</h3>
              </div>
              <button
                onClick={() => setIsCreatingSubject(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Database Systems"
                  value={newSubjectForm.name}
                  onChange={e => setNewSubjectForm({ ...newSubjectForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-brand-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CS-402"
                    value={newSubjectForm.code}
                    onChange={e => setNewSubjectForm({ ...newSubjectForm, code: e.target.value })}
                    className="w-full px-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Program / Class</label>
                  <input
                    type="text"
                    placeholder="e.g. BSCS"
                    value={newSubjectForm.programOrClass}
                    onChange={e => setNewSubjectForm({ ...newSubjectForm, programOrClass: e.target.value })}
                    className="w-full px-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Semester</label>
                  <input
                    type="text"
                    placeholder="e.g. 6th"
                    value={newSubjectForm.semester}
                    onChange={e => setNewSubjectForm({ ...newSubjectForm, semester: e.target.value })}
                    className="w-full px-2.5 py-1.5 sm:py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Language</label>
                  <select
                    value={newSubjectForm.language}
                    onChange={e => setNewSubjectForm({ ...newSubjectForm, language: e.target.value })}
                    className="w-full px-2 py-1.5 sm:py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="en">English</option>
                    <option value="ur">Urdu</option>
                    <option value="bilingual">Bilingual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Status</label>
                  <select
                    value={newSubjectForm.status}
                    onChange={e => setNewSubjectForm({ ...newSubjectForm, status: e.target.value })}
                    className="w-full px-2 py-1.5 sm:py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Description / Syllabus</label>
                <textarea
                  rows={2}
                  value={newSubjectForm.description}
                  onChange={e => setNewSubjectForm({ ...newSubjectForm, description: e.target.value })}
                  placeholder="Outline syllabus topics..."
                  className="w-full px-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-navy"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreatingSubject(false)}
                  className="px-3.5 py-1.5 sm:py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 sm:py-2 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navyDark shadow-2xs disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
       * MODAL: CONFIRM DELETE SUBJECT
       * ================================================================== */}
      {subjectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 sm:p-5 shadow-2xl space-y-3 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Academic Subject</h3>
                <p className="text-[11px] text-slate-500">Remove from question bank repository</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">{subjectToDelete.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white border font-bold text-slate-700">
                  {subjectToDelete.code || 'No Code'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <span>{subjectToDelete.programOrClass || 'General'}</span>
                <span>•</span>
                <span>{subjectToDelete.semester || 'No Semester'}</span>
                <span>•</span>
                <span className="capitalize">{subjectToDelete.status}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex gap-3 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1">
                  <span className="font-bold text-brand-navy">{subjectToDelete.questionCount || 0}</span> MCQs
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-bold text-brand-navy">{subjectToDelete.bookCount || 0}</span> Books
                </span>
              </div>
            </div>

            {subjectToDelete.questionCount > 0 ? (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  Contains {subjectToDelete.questionCount} Active MCQs
                </p>
                <p className="text-slate-600">
                  You can permanently delete the subject and its questions, or archive it to hide from candidates.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                Are you sure you want to delete <strong>"{subjectToDelete.name}"</strong>?
              </p>
            )}

            <div className="flex flex-col gap-1.5 pt-1">
              <button
                type="button"
                disabled={isDeletingSubject}
                onClick={() => handleExecuteDeleteSubject(subjectToDelete._id, false)}
                className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {isDeletingSubject
                    ? 'Deleting...'
                    : subjectToDelete.questionCount > 0
                    ? 'Delete Subject & All MCQs'
                    : 'Delete Subject Permanently'}
                </span>
              </button>

              {subjectToDelete.questionCount > 0 && (
                <button
                  type="button"
                  disabled={isDeletingSubject}
                  onClick={() => handleExecuteDeleteSubject(subjectToDelete._id, true)}
                  className="w-full py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>Archive Only (Hide from Students)</span>
                </button>
              )}

              <button
                type="button"
                disabled={isDeletingSubject}
                onClick={() => setSubjectToDelete(null)}
                className="w-full py-1.5 px-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
 * SITE FOOTER COMPONENT (Compact for Mobile, Academic Standard for Desktop)
 * ======================================================================== */
function Footer({ onOpenAppModal }) {
  return (
    <footer className="bg-[#0B1329] text-slate-300 border-t border-slate-800 print:hidden mt-auto">
      {/* 1. MOBILE COMPACT FOOTER (Shown on Mobile screens < md) */}
      <div className="md:hidden py-5 px-4 bg-slate-950/80 space-y-3 text-center pb-20">
        <div className="flex items-center justify-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-900 border border-amber-400/40 text-amber-400 flex items-center justify-center shadow-sm">
            <GraduationCap className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-base font-black text-white">
            MCQs <span className="text-amber-400">Bank</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-semibold">
            Academic Portal
          </span>
        </div>

        <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
          Official Higher Education Assessment & Timed Examination System.
        </p>

        {/* Quick Nav Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
          <Link to="/catalog" className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition">
            Curriculum
          </Link>
          <Link to="/practice" className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition">
            Practice
          </Link>
          <Link to="/exam" className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition">
            Exam
          </Link>
          <Link to="/admin" className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 transition">
            Faculty
          </Link>
          <button
            type="button"
            onClick={onOpenAppModal}
            className="px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/20 transition flex items-center gap-1"
          >
            <Smartphone className="w-3 h-3 text-amber-400" />
            <span>App</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
          <p>© {new Date().getFullYear()} MCQs Bank. Syllabus-Aligned Academic Standards.</p>
        </div>
      </div>

      {/* 2. DESKTOP COMPACT & PROFESSIONAL FOOTER (Shown on Desktop screens >= md) */}
      <div className="hidden md:block py-5 px-6 bg-slate-950/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Brand & Academic Note */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-amber-400/40 text-amber-400 flex items-center justify-center shadow-sm">
              <GraduationCap className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white">
                  MCQs <span className="text-amber-400">Bank</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Academic Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official Higher Education Assessment & Timed Examination System
              </p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="flex items-center gap-5 text-xs font-medium text-slate-300">
            <Link to="/catalog" className="hover:text-amber-400 transition">
              Curriculum
            </Link>
            <Link to="/practice" className="hover:text-amber-400 transition">
              Practice
            </Link>
            <Link to="/exam" className="hover:text-amber-400 transition">
              Examination
            </Link>
            <button
              type="button"
              onClick={onOpenAppModal}
              className="hover:text-amber-400 transition flex items-center gap-1.5 text-slate-300"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>App</span>
            </button>
            <Link
              to="/admin"
              className="px-3 py-1 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/25 font-semibold hover:bg-amber-400/20 transition"
            >
              Faculty Portal
            </Link>
          </div>
        </div>

        {/* Bottom Micro-Bar */}
        <div className="max-w-7xl mx-auto mt-3.5 pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} MCQs Bank. Syllabus-Aligned Academic Standards.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Academic Integrity</span>
            <span>•</span>
            <span>Peer-Reviewed Curricula</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ==========================================================================
 * MAIN APP WRAPPER WITH GLOBAL STATE
 * ======================================================================== */
export default function App() {
  const location = useLocation();
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('qb_admin_user') || 'null');
    } catch {
      return null;
    }
  });
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Detect standalone mode and listen for PWA install prompt in Chrome
  useEffect(() => {
    try {
      const isStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator?.standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
      }
    } catch (_) {}

    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('[PWA] Chrome beforeinstallprompt event captured');
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('[PWA] MCQs Bank installed successfully');
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
        setIsAppModalOpen(false);
      }
    } else {
      setIsAppModalOpen(true);
    }
  };

  // Verify auth session on initial load
  useEffect(() => {
    const token = localStorage.getItem('qb_admin_token');
    fetch('/api/admin/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include'
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.user) {
          setAdminUser(d.user);
          localStorage.setItem('qb_admin_user', JSON.stringify(d.user));
        } else if (!token) {
          setAdminUser(null);
        }
      })
      .catch(() => {});
  }, []);

  const [studentUser, setStudentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('academic_student_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  const handleSaveStudent = (data) => {
    setStudentUser(data);
    try {
      localStorage.setItem('academic_student_user', JSON.stringify(data));
    } catch {}
    setIsStudentModalOpen(false);
  };

  const handleStudentLogout = () => {
    setStudentUser(null);
    try {
      localStorage.removeItem('academic_student_user');
    } catch {}
  };

  const handleGlobalLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {}
    localStorage.removeItem('qb_admin_token');
    localStorage.removeItem('qb_admin_user');
    setAdminUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopProgressBar />
      <Navbar
        adminUser={adminUser}
        onLogout={handleGlobalLogout}
        studentUser={studentUser}
        onOpenStudentLogin={() => setIsStudentModalOpen(true)}
        onStudentLogout={handleStudentLogout}
        onOpenAppModal={() => setIsAppModalOpen(true)}
        onInstallApp={handleInstallApp}
        isInstalled={isInstalled}
      />
      <main key={location.pathname} className="flex-1 pb-16 md:pb-0 animate-fadeIn">
        <Routes>
          <Route path="/" element={<HomePage onOpenAppModal={() => setIsAppModalOpen(true)} />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route
            path="/exam"
            element={
              <ExamPage
                studentUser={studentUser}
                onOpenStudentLogin={() => setIsStudentModalOpen(true)}
                onSaveStudent={handleSaveStudent}
              />
            }
          />
          <Route path="/admin/*" element={<AdminPanel adminUser={adminUser} setAdminUser={setAdminUser} />} />
        </Routes>
      </main>
      <Footer onOpenAppModal={() => setIsAppModalOpen(true)} />
      <MobileBottomNav onOpenAppModal={() => setIsAppModalOpen(true)} />
      {isAppModalOpen && (
        <MobileAppModal
          onClose={() => setIsAppModalOpen(false)}
          onInstallChrome={handleInstallApp}
          isInstalled={isInstalled}
        />
      )}
      <StudentProfileModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        studentUser={studentUser}
        onSave={handleSaveStudent}
        onLogout={handleStudentLogout}
      />
    </div>
  );
}
