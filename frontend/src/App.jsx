import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen, GraduationCap, LayoutDashboard, UploadCloud, CheckCircle2,
  Clock, Printer, ShieldCheck, Search, Play, Award, PlusCircle, LogOut,
  Edit, Trash2, FileText, Check, AlertCircle, RefreshCw, Eye, X, Copy,
  Download, ChevronRight, Filter, Sparkles, Layers, FolderPlus, FileCode,
  Smartphone, QrCode, ExternalLink, Cpu, Database, Network, Boxes, Trophy,
  HelpCircle, ArrowRight, Bell, Home, CheckSquare
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
 * COMPACT PROFESSIONAL NAVBAR WITH MOBILE APP CTA
 * ======================================================================== */
function Navbar({ adminUser, onLogout, onOpenAppModal }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const isAdminActive = location.pathname.startsWith('/admin');

  const handleSearchClick = () => {
    if (location.pathname !== '/') {
      navigate('/?focusSearch=true');
    } else {
      const searchInput = document.getElementById('main-search-input');
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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

          {/* Quick Search Action */}
          <button
            type="button"
            onClick={handleSearchClick}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition active:scale-95"
            title="Search subjects & MCQs"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-200" />
          </button>

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
                <a
                  href="https://github.com/IftikharZahid/MCQs-Bank/releases/latest/download/app-debug.apk"
                  className="primary appDownloadAnchor w-full mt-1 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition text-center flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowNotifications(false)}
                >
                  <span>🤖</span>
                  <span>Download Official APK</span>
                </a>
              </div>
            )}
          </div>

          {/* Mobile App Download Button */}
          <button
            type="button"
            onClick={onOpenAppModal}
            className="inline-flex items-center gap-1 h-7 sm:h-8 px-2 sm:px-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-sm hover:shadow-amber-500/20 hover:shadow-md transition transform active:scale-95"
            title="Download MCQs Bank Mobile App for Android"
          >
            <Smartphone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-950" />
            <span className="hidden xs:inline text-[11px]">App</span>
            <span className="px-1 py-0.2 bg-slate-950/20 text-[9px] font-black rounded uppercase tracking-wider">
              APK
            </span>
          </button>

          {/* Admin Indicator & Button */}
          {adminUser ? (
            <div className="flex items-center gap-1 ml-0.5 pl-1 sm:ml-1.5 sm:pl-1.5 border-l border-slate-700">
              <Link
                to="/admin"
                className={`inline-flex items-center gap-1 h-7 sm:h-8 px-2 rounded-lg font-bold transition text-xs active:scale-95 ${
                  isAdminActive
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-emerald-600/90 text-white hover:bg-emerald-600'
                }`}
                title="Admin Control Center"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </Link>
              <button
                onClick={onLogout}
                title={`Signed in as ${adminUser.email}`}
                className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/admin"
              className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 border border-slate-700 transition flex items-center gap-1 active:scale-95"
              title="Faculty & Admin Access"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Faculty / </span>
              <span className="hidden xs:inline">Admin</span>
            </Link>
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

        {/* Mobile App Download Button */}
        <button
          type="button"
          onClick={onOpenAppModal}
          className="flex flex-col items-center justify-center h-full py-1 text-slate-700 hover:text-amber-500 font-semibold transition"
        >
          <div className="relative p-1 rounded-xl bg-amber-400 text-slate-950 shadow-sm">
            <Smartphone className="w-4 h-4 stroke-[2.2]" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
          </div>
          <span className="text-[10px] font-bold text-amber-600">Get App</span>
        </button>
      </div>
    </nav>
  );
}

/* ==========================================================================
 * MOBILE APP MODAL
 * ======================================================================== */
function MobileAppModal({ onClose }) {
  const [downloadInfo, setDownloadInfo] = useState({
    version: '1.0',
    appName: 'MCQs Bank',
    packageName: 'com.ZahidCodes.mcqsBank',
    fileSize: '~12 MB',
    minAndroid: 'Android 7.0+ (API 24)',
    features: [
      '5+ Core CS & Academic Subjects with verified MCQs',
      'Timed practice tests & chapter-by-chapter study modes',
      '100% offline access to downloaded question banks',
      'Detailed explanations in both English and Urdu',
      'Comprehensive performance analytics & score tracker'
    ]
  });

  useEffect(() => {
    fetch('/api/downloads/info')
      .then(r => r.json())
      .then(d => {
        if (d.data) setDownloadInfo(prev => ({ ...prev, ...d.data }));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full text-white shadow-2xl overflow-hidden relative">
        {/* Header with App Branding */}
        <div className="bg-gradient-to-r from-[#0B1329] via-[#0F172A] to-[#1E293B] p-6 border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <GraduationCap className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight text-white">MCQs <span className="text-amber-400">Bank</span></h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Android APK v{downloadInfo.version}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Academic Portal • Higher Education</p>
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
          {/* Visual Companion Row */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Phone Mockup Frame */}
            <div className="shrink-0 w-28 xs:w-32 sm:w-36 rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-lg p-1 flex flex-col items-center">
              <div className="w-8 h-0.5 bg-slate-700 rounded-full mb-1 opacity-70" />
              <img
                src="/mobile-app-mockup.png"
                alt="MCQs Bank Android App Mockup"
                className="w-full h-auto object-contain rounded-xl select-none"
              />
            </div>

            {/* Feature Highlights & Specs */}
            <div className="flex-1 space-y-3 w-full">
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Companion Android App Highlights</h4>
                <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-200">
                  {downloadInfo.features?.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick specs box */}
              <div className="grid grid-cols-3 gap-1.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-center text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase">Package</span>
                  <p className="font-mono text-[10px] text-amber-300 truncate" title={downloadInfo.packageName}>{downloadInfo.packageName}</p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase">Requirement</span>
                  <p className="font-semibold text-slate-200 text-[11px]">{downloadInfo.minAndroid}</p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase">File Size</span>
                  <p className="font-semibold text-slate-200 text-[11px]">{downloadInfo.fileSize}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Download CTA & Direct action */}
          <div className="space-y-2 pt-1">
            <a
              href="https://github.com/IftikharZahid/MCQs-Bank/releases/latest/download/app-debug.apk"
              className="primary appDownloadAnchor w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition transform active:scale-98"
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="text-base">🤖</span>
              <span>Download Official APK</span>
            </a>

            <p className="text-[10px] sm:text-[11px] text-center text-slate-400">
              After downloading, open the APK file on your Android smartphone or tablet and tap <span className="text-slate-200 font-semibold">Install</span>.
            </p>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="bg-slate-950/80 px-6 py-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Verified Safe APK • Direct Download
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
 * 1. STUDENT HOMEPAGE
 * ======================================================================== */
function HomePage({ onOpenAppModal }) {
  const [status, setStatus] = useState({ stats: { subjects: 0, books: 0, questions: 0, exams: 0 } });
  const [subjects, setSubjects] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetch('/api/status').then(r => r.json()).then(setStatus).catch(() => {});
    fetch('/api/subjects').then(r => r.json()).then(d => setSubjects(d.data || [])).catch(() => {});
    fetch('/api/exams/recent').then(r => r.json()).then(d => setRecentExams(d.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (location.search.includes('focusSearch')) {
      const searchInput = document.getElementById('main-search-input');
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [location.search]);

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.programOrClass || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-3.5 sm:space-y-6">
      {/* 1. HERO CARD (Faithful to Mockup: Dark navy, rounded-3xl, 'Practice. Assess. Improve.') */}
      <section className="bg-gradient-to-br from-[#0B1536] via-[#0E1B40] to-[#14265A] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 shadow-xl border border-slate-800/80 relative overflow-hidden">
        {/* Subtle ambient glows */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
          <div className="lg:col-span-8 space-y-2.5 sm:space-y-4">
            {/* Mockup Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/10 text-slate-200 border border-white/10">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>ACADEMIC PREP PORTAL</span>
            </div>

            {/* Mockup Heading */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
              Practice. Assess. <span className="text-amber-400">Improve.</span>
            </h1>

            {/* Mockup Subtitle */}
            <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed max-w-xl">
              High-quality, verified MCQs from multiple books and syllabi to strengthen your concepts.
            </p>

            {/* Mockup Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <button
                onClick={() => navigate('/practice')}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md transition transform active:scale-95"
              >
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                <span>Start Practice →</span>
              </button>

              <button
                onClick={() => navigate('/catalog')}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-200" />
                <span>Browse Subjects</span>
              </button>
            </div>
          </div>

          {/* Right Column / Phone Showcase (Desktop/Tablet) */}
          <div className="hidden lg:flex lg:col-span-4 justify-center items-center">
            <div
              onClick={onOpenAppModal}
              title="Click to view and download MCQs Bank Mobile App"
              className="relative group cursor-pointer transition transform hover:-translate-y-1 duration-300 w-48 lg:w-52 max-w-[210px]"
            >
              <div className="absolute -inset-2 bg-gradient-to-b from-amber-400/25 via-blue-500/20 to-amber-500/20 rounded-[32px] blur-md opacity-75 group-hover:opacity-100 transition duration-500" />
              <div className="relative rounded-[30px] overflow-hidden bg-slate-950 border-[2px] border-slate-700/80 shadow-2xl p-1.5 flex flex-col items-center">
                <div className="w-12 h-1 bg-slate-800 rounded-full mb-1 opacity-80" />
                <div className="relative w-full rounded-[24px] overflow-hidden border border-slate-800/80 bg-slate-900">
                  <img
                    src="/mobile-app-mockup.png"
                    alt="MCQs Bank Android Mobile App"
                    className="w-full h-auto object-contain block select-none"
                  />
                  <a
                    href="https://github.com/IftikharZahid/MCQs-Bank/releases/latest/download/app-debug.apk"
                    className="primary appDownloadAnchor absolute inset-x-2 bottom-2 py-1.5 px-1.5 rounded-xl bg-slate-950/95 backdrop-blur-md border border-amber-400/50 text-center shadow-lg hover:bg-amber-400 hover:text-slate-950 transition-all duration-200 flex items-center justify-center gap-1 text-[11px] font-black text-amber-300 hover:scale-[1.02] active:scale-95 group/btn"
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-xs group-hover/btn:animate-bounce">🤖</span>
                    <span className="truncate">Download Official APK</span>
                  </a>
                </div>
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

      {/* 3. SEARCH BAR (Full-width pill input: 'Search subjects, books or topics...') */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          id="main-search-input"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subjects, books or topics..."
          className="w-full pl-11 pr-10 py-3 rounded-full border border-slate-200 bg-white shadow-sm text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
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
  const [books, setBooks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/subjects').then(r => r.json()).then(d => setSubjects(d.data || []));
    fetch('/api/books').then(r => r.json()).then(d => setBooks(d.data || []));
  }, []);

  const visibleBooks = selectedSubject
    ? books.filter(b => b.subjectId?._id === selectedSubject)
    : books;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academic Books & Course Catalog</h1>
          <p className="text-sm text-slate-500">Filter by subject to practice book-specific chapters and weeks</p>
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium"
        >
          <option value="">All Subjects ({books.length} Books)</option>
          {subjects.map(s => (
            <option key={s._id} value={s._id}>{s.name} ({s.programOrClass})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visibleBooks.map(book => (
          <div key={book._id} className="bg-white border border-slate-200 rounded-[18px] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-brand-navy mb-2">
                <span>{book.subjectId?.name || 'Subject'}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {book.questionCount || 0} MCQs
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{book.title}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Author: <strong>{book.author || 'Academic Faculty'}</strong> • {book.programOrClass} {book.semester}
              </p>
            </div>
            <div className="flex gap-3 mt-5 pt-4 border-t border-slate-100">
              <button
                onClick={() => navigate(`/practice?bookId=${book._id}`)}
                className="flex-1 py-2 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navyDark"
              >
                Practice Book MCQs
              </button>
              <button
                onClick={() => navigate(`/exam?bookId=${book._id}`)}
                className="flex-1 py-2 rounded-xl border border-brand-navy text-brand-navy text-xs font-bold hover:bg-brand-navy/5"
              >
                Take Book Exam
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
 * 3. INTERACTIVE PRACTICE MODE
 * ======================================================================== */
function PracticePage() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [instantFeedback, setInstantFeedback] = useState(true);
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('qb_bookmarks') || '[]'); } catch { return []; }
  });
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    fetch(`/api/questions?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        setQuestions(d.questions || []);
        setCurrentIndex(0);
      });
  }, [location.search]);

  const toggleBookmark = (qId) => {
    const next = bookmarks.includes(qId) ? bookmarks.filter(id => id !== qId) : [...bookmarks, qId];
    setBookmarks(next);
    localStorage.setItem('qb_bookmarks', JSON.stringify(next));
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center">
        <p className="text-lg font-semibold text-slate-700">No published questions found for this filter.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const selected = answers[currentQ._id];
  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter(q => answers[q._id] === q.correctAnswer).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white border border-slate-200 rounded-[18px] p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase text-brand-navy">Interactive Practice Session</span>
          <p className="text-sm font-semibold text-slate-700">
            Question {currentIndex + 1} of {questions.length} • Score: {correctCount}/{answeredCount}
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={instantFeedback}
            onChange={(e) => setInstantFeedback(e.target.checked)}
            className="rounded text-brand-navy"
          />
          Show Instant Answer & Explanation
        </label>
      </div>

      <QuestionCard
        index={currentIndex}
        questionObj={currentQ}
        selectedOption={selected}
        onSelectOption={(optIdx) => setAnswers(prev => ({ ...prev, [currentQ._id]: optIdx }))}
        showFeedback={instantFeedback && selected !== undefined}
        isBookmarked={bookmarks.includes(currentQ._id)}
        onToggleBookmark={toggleBookmark}
      />

      <div className="flex items-center justify-between">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(i => i - 1)}
          className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold disabled:opacity-40"
        >
          Previous
        </button>
        <button
          disabled={currentIndex === questions.length - 1}
          onClick={() => setCurrentIndex(i => i + 1)}
          className="px-6 py-2.5 rounded-xl bg-brand-navy text-white text-sm font-semibold disabled:opacity-40"
        >
          Next Question
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
 * 4. TIMED EXAMINATION & PRINTABLE A4 TRANSCRIPT
 * ======================================================================== */
function ExamPage() {
  const [subjects, setSubjects] = useState([]);
  const [config, setConfig] = useState({ subjectId: '', studentName: '', questionCount: 10, durationMinutes: 15 });
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [transcript, setTranscript] = useState(null);

  useEffect(() => {
    fetch('/api/subjects').then(r => r.json()).then(d => {
      const list = d.data || [];
      setSubjects(list);
      if (list[0]) setConfig(c => ({ ...c, subjectId: list[0]._id }));
    });
  }, []);

  useEffect(() => {
    if (!session || transcript) return;
    if (secondsLeft <= 0) {
      handleSubmitExam();
      return;
    }
    const timer = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [session, secondsLeft, transcript]);

  const startExam = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/exams/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    const data = await res.json();
    if (data.success) {
      setSession(data);
      setAnswers({});
      setSecondsLeft(data.durationMinutes * 60);
    } else {
      alert(data.message || 'Could not start examination');
    }
  };

  const handleSubmitExam = async () => {
    if (!session) return;
    const res = await fetch(`/api/exams/${session.attemptId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    });
    const data = await res.json();
    if (data.success) setTranscript(data.data);
  };

  if (transcript) {
    const { summary, items, subjectId } = transcript;
    return (
      <div className="max-w-4xl mx-auto my-8 px-4 space-y-6">
        <div className="flex justify-between items-center print:hidden">
          <h1 className="text-2xl font-bold">Official Examination Transcript</h1>
          <div className="flex gap-3">
            <button
              onClick={() => { setTranscript(null); setSession(null); }}
              className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
            >
              New Exam
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-navy text-white text-sm font-bold shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print A4 PDF
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[18px] p-8 shadow-sm print:border-black">
          <div className="flex justify-between items-start border-b-2 border-brand-navy pb-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase text-brand-navy">Academic Examination Transcript</span>
              <h2 className="text-2xl font-bold mt-1">{transcript.title}</h2>
              <p className="text-sm text-slate-600">Candidate: <strong>{transcript.studentName}</strong> • Subject: {subjectId?.name}</p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${summary.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {summary.passed ? 'PASSED' : 'FAILED'} • Grade {summary.grade}
              </span>
              <p className="text-xs text-slate-500 mt-1">{new Date(transcript.submittedAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border">
              <span className="text-xs text-slate-500">Marks</span>
              <p className="text-xl font-bold text-brand-navy">{summary.obtainedMarks}/{summary.totalQuestions}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border">
              <span className="text-xs text-slate-500">Percentage</span>
              <p className="text-xl font-bold">{summary.percentage}%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border">
              <span className="text-xs text-slate-500">Accuracy</span>
              <p className="text-xl font-bold">{summary.accuracyRate}%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border">
              <span className="text-xs text-slate-500">Correct / Skipped</span>
              <p className="text-xl font-bold text-emerald-700">{summary.correct} / {summary.unanswered}</p>
            </div>
          </div>

          <div className="divide-y divide-slate-200 text-sm">
            {items.map((item, idx) => (
              <div key={idx} className="py-3">
                <p className="font-semibold">{idx + 1}. {item.questionId?.question}</p>
                <p className="text-xs text-slate-600 mt-1">
                  Your Answer: <strong>{item.selectedOption !== null ? item.questionId?.options[item.selectedOption] : 'Unanswered'}</strong> |
                  Correct: <strong className="text-emerald-700"> {item.questionId?.options[item.questionId?.correctAnswer]}</strong>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (session) {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="sticky top-16 z-20 bg-white border border-slate-200 rounded-[18px] p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-brand-navy">Live Examination</span>
            <p className="text-sm font-semibold">Answered: {Object.keys(answers).length} / {session.questions.length}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 font-mono font-bold text-base">
              {mins}:{secs < 10 ? `0${secs}` : secs}
            </span>
            <button
              onClick={handleSubmitExam}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-sm"
            >
              Submit Exam
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {session.questions.map((q, idx) => (
            <QuestionCard
              key={q._id}
              index={idx}
              questionObj={q}
              selectedOption={answers[q._id]}
              onSelectOption={(optIdx) => setAnswers(prev => ({ ...prev, [q._id]: optIdx }))}
              showFeedback={false}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto my-12 bg-white border border-slate-200 rounded-[18px] p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Configure Timed Examination</h1>
      <p className="text-sm text-slate-500 mb-6"> Randomized questions with authoritative server-side grading.</p>
      <form onSubmit={startExam} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Candidate Full Name</label>
          <input
            type="text"
            required
            value={config.studentName}
            onChange={(e) => setConfig({ ...config, studentName: e.target.value })}
            placeholder="Enter your name for the transcript"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-navy"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Select Subject</label>
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
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Number of Questions</label>
            <input
              type="number"
              min="1"
              max="100"
              value={config.questionCount}
              onChange={(e) => setConfig({ ...config, questionCount: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Duration (Minutes)</label>
            <input
              type="number"
              min="1"
              max="180"
              value={config.durationMinutes}
              onChange={(e) => setConfig({ ...config, durationMinutes: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>
        </div>
        <button type="submit" className="w-full py-3 rounded-xl bg-brand-navy text-white font-bold text-sm hover:bg-brand-navyDark shadow-sm">
          Start Official Examination
        </button>
      </form>
    </div>
  );
}

/* ==========================================================================
 * 5. COMPREHENSIVE ADMIN CONTROL CENTER
 * ======================================================================== */
function AdminPanel({ adminUser, setAdminUser }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [email, setEmail] = useState('admin@mqsbank.com');
  const [password, setPassword] = useState('Admin@MCQsBank2026!');
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
      const data = await res.json();
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
          publishImmediately
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
      <div className="max-w-md mx-auto my-16 bg-white border border-slate-200 rounded-[22px] p-8 shadow-sm">
        <div className="flex items-center gap-3 text-brand-navy font-bold text-xl mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center text-brand-navy">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span>Administrator Portal</span>
            <p className="text-xs text-slate-500 font-normal">Academic Question Bank Governance</p>
          </div>
        </div>

        <div className="my-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <p className="font-semibold text-slate-800 mb-1">Pre-configured Admin Credentials:</p>
          <p>Email: <code className="text-brand-navy font-bold">admin@mqsbank.com</code></p>
          <p>Password: <code className="text-brand-navy font-bold">Admin@MCQsBank2026!</code></p>
        </div>

        {authError && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Admin Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-navy"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Secure Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-navy"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-navy text-white font-bold text-sm hover:bg-brand-navyDark transition disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Dashboard'}
          </button>
        </form>
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6">
      {/* Top Admin Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl sm:rounded-[20px] p-4 sm:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Admin Control Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Session
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong>{adminUser.name}</strong> ({adminUser.email}) • Role: <span className="capitalize font-semibold">{adminUser.role}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => { setActiveTab('upload'); setUploadMode('json'); }}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-brand-gold text-slate-950 text-xs font-bold hover:bg-brand-goldHover transition shadow-sm"
          >
            <UploadCloud className="w-4 h-4" /> Upload JSON MCQs
          </button>
          <button
            onClick={() => setIsCreatingSubject(true)}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navyDark transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Add Subject
          </button>
          <button
            onClick={refreshAdminData}
            title="Refresh statistics and data"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Status / Alert Banner */}
      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{statusMsg}</span>
          </div>
          <button onClick={() => setStatusMsg('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto no-scrollbar pb-1 text-xs sm:text-sm font-semibold whitespace-nowrap">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition ${
            activeTab === 'dashboard'
              ? 'bg-white border-t-2 border-l border-r border-slate-200 text-brand-navy border-t-brand-navy font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard & Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition ${
            activeTab === 'subjects'
              ? 'bg-white border-t-2 border-l border-r border-slate-200 text-brand-navy border-t-brand-navy font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Subject Management ({subjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition ${
            activeTab === 'upload'
              ? 'bg-white border-t-2 border-l border-r border-slate-200 text-brand-navy border-t-brand-navy font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span className="text-amber-700 font-extrabold">Upload Using JSON File</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-brand-gold text-slate-950 font-black">JSON</span>
        </button>

        <button
          onClick={() => { setActiveTab('questions'); fetchQuestions(1); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition ${
            activeTab === 'questions'
              ? 'bg-white border-t-2 border-l border-r border-slate-200 text-brand-navy border-t-brand-navy font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>MCQs Bank Manager</span>
        </button>

        <button
          onClick={() => setActiveTab('books')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition ${
            activeTab === 'books'
              ? 'bg-white border-t-2 border-l border-r border-slate-200 text-brand-navy border-t-brand-navy font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Reference Books ({books.length})</span>
        </button>
      </div>

      {/* ====================================================================
       * TAB 1: DASHBOARD & OVERVIEW
       * ================================================================== */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-[18px] p-5 shadow-sm">
              <span className="text-xs uppercase font-bold text-slate-400">Total Question Bank</span>
              <p className="text-3xl font-extrabold text-brand-navy mt-1">{stats.totalQuestions}</p>
              <span className="text-xs text-slate-500 font-medium">
                {stats.publishedQuestions} Published • {stats.draftQuestions} Drafts
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-[18px] p-5 shadow-sm">
              <span className="text-xs uppercase font-bold text-slate-400">Active Subjects</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalSubjects}</p>
              <span className="text-xs text-slate-500 font-medium">
                {stats.publishedSubjects} Live in Student Portal
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-[18px] p-5 shadow-sm">
              <span className="text-xs uppercase font-bold text-slate-400">Syllabus Books</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalBooks}</p>
              <span className="text-xs text-slate-500 font-medium">Across All Semesters</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-[18px] p-5 shadow-sm">
              <span className="text-xs uppercase font-bold text-slate-400">Exams Completed</span>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.totalExams}</p>
              <span className="text-xs text-slate-500 font-medium">Official Submissions</span>
            </div>
          </div>

          {/* Quick Actions & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Subject Distribution */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-[18px] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">MCQs Distribution by Subject</h3>
                <button
                  onClick={() => setActiveTab('subjects')}
                  className="text-xs font-semibold text-brand-navy hover:underline"
                >
                  Manage All Subjects →
                </button>
              </div>

              <div className="space-y-3">
                {stats.subjectBreakdown?.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{item.subject} {item.code ? `(${item.code})` : ''}</span>
                      <span className="text-slate-500">{item.count} MCQs</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-brand-navy h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (item.count / (stats.totalQuestions || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-[18px] p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Quick Administrator Actions</h3>
              <div className="space-y-2.5">
                <button
                  onClick={() => { setActiveTab('upload'); setUploadMode('json'); }}
                  className="w-full p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 text-left flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-gold text-slate-950 flex items-center justify-center font-bold">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Upload MCQs using JSON File</p>
                      <p className="text-[11px] text-slate-500">Bulk import questions with validation & duplicate checks</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => { setActiveTab('subjects'); setIsCreatingSubject(true); }}
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-navy text-white flex items-center justify-center font-bold">
                      <FolderPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Add or Update Academic Subject</p>
                      <p className="text-[11px] text-slate-500">Define course code, program syllabus & semester</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => { setActiveTab('questions'); fetchQuestions(1); }}
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold">
                      <Search className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Browse & Audit Question Bank</p>
                      <p className="text-[11px] text-slate-500">Inspect explanations, options, and edit questions</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Recent Candidate Exams */}
          {stats.recentExams && stats.recentExams.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-[18px] p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-3">Recent Examination Submissions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b text-slate-500 uppercase">
                      <th className="py-2 px-3">Candidate</th>
                      <th className="py-2 px-3">Subject</th>
                      <th className="py-2 px-3">Score</th>
                      <th className="py-2 px-3">Percentage</th>
                      <th className="py-2 px-3">Grade</th>
                      <th className="py-2 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentExams.map(ex => (
                      <tr key={ex._id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{ex.studentName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{ex.subjectId?.name || ex.title}</td>
                        <td className="py-2.5 px-3 font-medium">{ex.summary?.obtainedMarks} / {ex.summary?.totalQuestions}</td>
                        <td className="py-2.5 px-3 font-bold">{ex.summary?.percentage}%</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded font-bold ${ex.summary?.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {ex.summary?.grade}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{new Date(ex.submittedAt).toLocaleDateString()}</td>
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
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-[18px] p-5 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Academic Subjects Catalog</h2>
              <p className="text-xs text-slate-500">Edit, update syllabus, change status, or add new subjects to MCQs Bank</p>
            </div>
            <button
              onClick={() => setIsCreatingSubject(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navyDark transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> Add New Subject
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search subject by name, code, program..."
                value={subjectSearch}
                onChange={e => setSubjectSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-brand-navy"
              />
            </div>

            <select
              value={subjectProgramFilter}
              onChange={e => setSubjectProgramFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
            >
              <option value="all">All Programs ({subjects.length})</option>
              {uniquePrograms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select
              value={subjectStatusFilter}
              onChange={e => setSubjectStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Subjects Table */}
          <div className="bg-white border border-slate-200 rounded-[18px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                    <th className="py-3 px-4">Subject Name</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Program / Class</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4">MCQs Count</th>
                    <th className="py-3 px-4">Books</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubjects.map(sub => (
                    <tr key={sub._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{sub.name}</div>
                        {sub.description && (
                          <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">{sub.description}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">
                        {sub.code || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                        {sub.programOrClass || 'General'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {sub.semester || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {sub.questionCount || 0}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {sub.bookCount || 0}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                          sub.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : sub.status === 'draft'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditSubject(sub)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-brand-navy transition shadow-sm"
                            title="Update Subject details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setSubjectToDelete(sub)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border border-transparent transition"
                            title={`Delete subject "${sub.name}"`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSubjects.length === 0 && (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-500 text-sm">
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
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-brand-navy to-slate-900 text-white rounded-[20px] p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
                  Bulk MCQ Ingestion Engine
                </span>
                <h2 className="text-xl font-bold mt-1">Upload MCQs Using JSON File into MCQs Bank</h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Upload standard JSON files or paste raw JSON. The engine automatically parses questions, validates options, verifies correct answer indices, and screens against existing questions in the database to prevent duplicates.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition"
                >
                  {copiedTemplate ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedTemplate ? 'Copied Template!' : 'Copy Sample JSON'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-gold text-slate-950 text-xs font-bold hover:bg-brand-goldHover transition shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Sample .json</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Target Configuration & Input */}
            <div className="lg:col-span-7 space-y-5">
              {/* Step 1: Target Subject */}
              <div className="bg-white border border-slate-200 rounded-[18px] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold uppercase text-brand-navy flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-navy/10 text-brand-navy flex items-center justify-center text-xs">1</span>
                  Select Target Academic Subject
                </h3>

                <div className="flex gap-4 text-xs font-semibold">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="subType"
                      checked={!isNewSubjectUpload}
                      onChange={() => setIsNewSubjectUpload(false)}
                      className="text-brand-navy"
                    />
                    Choose Existing Subject
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="subType"
                      checked={isNewSubjectUpload}
                      onChange={() => setIsNewSubjectUpload(true)}
                      className="text-brand-navy"
                    />
                    + Create New Subject On The Fly
                  </label>
                </div>

                {!isNewSubjectUpload ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Target Subject</label>
                    <select
                      value={uploadSubjectId}
                      onChange={e => setUploadSubjectId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      {subjects.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.name} {s.code ? `(${s.code})` : ''} — {s.programOrClass} ({s.questionCount || 0} MCQs)
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Subject Name *"
                      value={newSubjectForUpload.name}
                      onChange={e => setNewSubjectForUpload({ ...newSubjectForUpload, name: e.target.value })}
                      className="px-3.5 py-2 rounded-xl border text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Program (e.g. BSCS)"
                      value={newSubjectForUpload.programOrClass}
                      onChange={e => setNewSubjectForUpload({ ...newSubjectForUpload, programOrClass: e.target.value })}
                      className="px-3.5 py-2 rounded-xl border text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Code (e.g. CS-301)"
                      value={newSubjectForUpload.code}
                      onChange={e => setNewSubjectForUpload({ ...newSubjectForUpload, code: e.target.value })}
                      className="px-3.5 py-2 rounded-xl border text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Optional Reference Book / Syllabus Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Operating System Concepts (9th Edition)"
                    value={uploadBookTitle}
                    onChange={e => setUploadBookTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border text-sm"
                  />
                </div>
              </div>

              {/* Step 2: JSON or File Input */}
              <div className="bg-white border border-slate-200 rounded-[18px] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase text-brand-navy flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-navy/10 text-brand-navy flex items-center justify-center text-xs">2</span>
                    Provide JSON MCQs Data
                  </h3>

                  <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setUploadMode('json')}
                      className={`px-3 py-1 rounded-md transition ${uploadMode === 'json' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                    >
                      Paste Raw JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('file')}
                      className={`px-3 py-1 rounded-md transition ${uploadMode === 'file' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                    >
                      Upload .json File
                    </button>
                  </div>
                </div>

                {uploadMode === 'file' ? (
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-brand-navy transition bg-slate-50/50">
                    <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Drag and drop your .json file here, or browse</p>
                    <p className="text-xs text-slate-500 mt-0.5">Supports .json, .csv, and .docx formats up to 15MB</p>
                    <input
                      type="file"
                      accept=".json,.csv,.docx"
                      onChange={e => setUploadFile(e.target.files?.[0] || null)}
                      className="mt-3 block w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-navy file:text-white hover:file:bg-brand-navyDark"
                    />
                    {uploadFile && (
                      <div className="mt-3 text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Enter an array of questions or an object with a "questions" property</span>
                      <button
                        type="button"
                        onClick={() => setRawJsonText(JSON.stringify(SAMPLE_JSON_TEMPLATE, null, 2))}
                        className="text-brand-navy font-semibold hover:underline"
                      >
                        Reset to Sample Template
                      </button>
                    </div>
                    <textarea
                      rows={12}
                      value={rawJsonText}
                      onChange={e => setRawJsonText(e.target.value)}
                      placeholder='[ { "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0 } ]'
                      className="w-full font-mono text-xs p-3.5 rounded-xl border border-slate-300 bg-slate-900 text-emerald-400 focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={publishImmediately}
                      onChange={e => setPublishImmediately(e.target.checked)}
                      className="rounded text-brand-navy"
                    />
                    Publish immediately (Make available in Student Portal right away)
                  </label>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handlePreviewUpload}
                    className="px-5 py-2.5 rounded-xl bg-brand-gold text-slate-950 font-extrabold text-xs hover:bg-brand-goldHover transition shadow-sm disabled:opacity-50"
                  >
                    {loading ? 'Validating...' : 'Validate & Preview JSON'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Validation & Live Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-slate-200 rounded-[18px] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold uppercase text-brand-navy flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-navy/10 text-brand-navy flex items-center justify-center text-xs">3</span>
                  Validation Report & Staged MCQs
                </h3>

                {!preview ? (
                  <div className="p-8 text-center border border-dashed rounded-xl text-slate-400 space-y-2">
                    <Eye className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-medium">Click "Validate & Preview JSON" to inspect parsed MCQs, duplicate checks, and options formatting before saving to database.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Metrics Banner */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-slate-50 border">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Total Parsed</span>
                        <p className="text-lg font-bold text-slate-800">{preview.totalParsed}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                        <span className="text-[10px] uppercase font-bold text-emerald-600">Valid MCQs</span>
                        <p className="text-lg font-bold text-emerald-800">{preview.validCount}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                        <span className="text-[10px] uppercase font-bold text-amber-700">Duplicates</span>
                        <p className="text-lg font-bold text-amber-800">{preview.duplicateCount}</p>
                      </div>
                    </div>

                    {/* Subject Resolution Note */}
                    <div className="p-3 rounded-xl bg-slate-50 border text-xs">
                      <p className="text-slate-600">
                        File / Payload: <strong>{preview.filename}</strong>
                      </p>
                      <p className="text-slate-600 mt-0.5">
                        Target Match: <strong className="text-brand-navy">{preview.subjectResolution?.status}</strong>
                      </p>
                    </div>

                    {/* Errors Report if any */}
                    {preview.errors && preview.errors.length > 0 && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-1 max-h-32 overflow-y-auto">
                        <p className="font-bold">Errors Found ({preview.errors.length}):</p>
                        {preview.errors.map((err, i) => (
                          <p key={i}>• {err}</p>
                        ))}
                      </div>
                    )}

                    {/* Question Preview List */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-700">Previewing Staged Questions ({preview.validCount}):</p>
                      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                        {preview.stagedPayload?.slice(0, 8).map((q, idx) => (
                          <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1.5">
                            <p className="font-semibold text-slate-900">{idx + 1}. {q.question}</p>
                            <div className="grid grid-cols-2 gap-1 text-[11px]">
                              {q.options?.map((opt, optIdx) => (
                                <span
                                  key={optIdx}
                                  className={`px-2 py-0.5 rounded truncate ${
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
                      className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
                    >
                      {loading ? 'Committing to Database...' : `Confirm & Commit ${preview.validCount} MCQs to Bank`}
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
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-[18px] p-5 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900">MCQs Bank Repository</h2>
              <p className="text-xs text-slate-500">Search, inspect correct answers, difficulty ratings, or delete questions</p>
            </div>
            <button
              onClick={() => { setActiveTab('upload'); setUploadMode('json'); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-gold text-slate-950 text-xs font-bold hover:bg-brand-goldHover transition shadow-sm"
            >
              <UploadCloud className="w-4 h-4" /> Bulk Upload via JSON
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search question text or chapter..."
                value={questionSearch}
                onChange={e => setQuestionSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchQuestions(1)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              />
            </div>

            <select
              value={questionSubjectFilter}
              onChange={e => setQuestionSubjectFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>

            <select
              value={questionDifficultyFilter}
              onChange={e => setQuestionDifficultyFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <button
              onClick={() => fetchQuestions(1)}
              className="px-4 py-2 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navyDark"
            >
              Search
            </button>
          </div>

          {/* Questions Cards */}
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={q._id} className="bg-white border border-slate-200 rounded-[18px] p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-brand-navy/10 text-brand-navy">
                      {q.subjectId?.name || 'Subject'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold capitalize bg-slate-100 text-slate-700">
                      {q.difficulty}
                    </span>
                    {q.chapter && <span className="text-xs text-slate-500 font-medium">{q.chapter}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteQuestion(q._id)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="font-semibold text-slate-900 text-sm leading-relaxed">{q.question}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options?.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`p-2.5 rounded-xl border ${
                        optIdx === q.correctAnswer
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-slate-200 bg-slate-50/70 text-slate-700'
                      }`}
                    >
                      <span className="inline-block w-5 font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}

            {questions.length === 0 && (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-[18px]">
                <p className="text-slate-500 text-sm font-medium">No questions found matching criteria.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {questionPagination.pages > 1 && (
            <div className="flex items-center justify-between text-xs font-semibold pt-2">
              <span className="text-slate-500">
                Page {questionPagination.page} of {questionPagination.pages} ({questionPagination.total} total MCQs)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={questionPagination.page <= 1}
                  onClick={() => fetchQuestions(questionPagination.page - 1)}
                  className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={questionPagination.page >= questionPagination.pages}
                  onClick={() => fetchQuestions(questionPagination.page + 1)}
                  className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-40"
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
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-[18px] p-5 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Academic Books & Syllabi</h2>
              <p className="text-xs text-slate-500">Manage course textbooks, authors, and syllabus chapters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.map(b => (
              <div key={b._id} className="bg-white border border-slate-200 rounded-[18px] p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-brand-navy mb-2">
                    <span>{b.subjectId?.name || 'Subject'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {b.questionCount || 0} MCQs
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{b.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Author: {b.author || 'Academic Faculty'} • {b.edition || 'Standard Edition'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Program: {b.programOrClass || 'General'} {b.semester}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-slate-400">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[22px] max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-brand-navy" />
                <h3 className="text-lg font-bold text-slate-900">Update Subject: {editingSubject.name}</h3>
              </div>
              <button
                onClick={() => setEditingSubject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={editSubjectForm.name}
                  onChange={e => setEditSubjectForm({ ...editSubjectForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CS-301"
                    value={editSubjectForm.code}
                    onChange={e => setEditSubjectForm({ ...editSubjectForm, code: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Program / Class</label>
                  <input
                    type="text"
                    placeholder="e.g. BSCS, ADP"
                    value={editSubjectForm.programOrClass}
                    onChange={e => setEditSubjectForm({ ...editSubjectForm, programOrClass: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Semester</label>
                  <input
                    type="text"
                    placeholder="e.g. 5th Semester"
                    value={editSubjectForm.semester}
                    onChange={e => setEditSubjectForm({ ...editSubjectForm, semester: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Language</label>
                  <select
                    value={editSubjectForm.language}
                    onChange={e => setEditSubjectForm({ ...editSubjectForm, language: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="en">English (en)</option>
                    <option value="ur">Urdu (ur)</option>
                    <option value="bilingual">Bilingual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Status</label>
                  <select
                    value={editSubjectForm.status}
                    onChange={e => setEditSubjectForm({ ...editSubjectForm, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Description / Syllabus Overview</label>
                <textarea
                  rows={3}
                  value={editSubjectForm.description}
                  onChange={e => setEditSubjectForm({ ...editSubjectForm, description: e.target.value })}
                  placeholder="Outline topics covered in this question bank..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-navy"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navyDark shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Saving Changes...' : 'Save Subject Changes'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[22px] max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-brand-navy" />
                <h3 className="text-lg font-bold text-slate-900">Add New Academic Subject</h3>
              </div>
              <button
                onClick={() => setIsCreatingSubject(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Database Systems"
                  value={newSubjectForm.name}
                  onChange={e => setNewSubjectForm({ ...newSubjectForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CS-402"
                    value={newSubjectForm.code}
                    onChange={e => setNewSubjectForm({ ...newSubjectForm, code: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Program / Class</label>
                  <input
                    type="text"
                    placeholder="e.g. BSCS"
                    value={newSubjectForm.programOrClass}
                    onChange={e => setNewSubjectForm({ ...newSubjectForm, programOrClass: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Semester</label>
                  <input
                    type="text"
                    placeholder="e.g. 6th Semester"
                    value={newSubjectForm.semester}
                    onChange={e => setNewSubjectForm({ ...newSubjectForm, semester: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Language</label>
                  <select
                    value={newSubjectForm.language}
                    onChange={e => setNewSubjectForm({ ...newSubjectForm, language: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="en">English (en)</option>
                    <option value="ur">Urdu (ur)</option>
                    <option value="bilingual">Bilingual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Status</label>
                  <select
                    value={newSubjectForm.status}
                    onChange={e => setNewSubjectForm({ ...newSubjectForm, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Description / Syllabus</label>
                <textarea
                  rows={3}
                  value={newSubjectForm.description}
                  onChange={e => setNewSubjectForm({ ...newSubjectForm, description: e.target.value })}
                  placeholder="Outline syllabus topics..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-brand-navy"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreatingSubject(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navyDark shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Academic Subject'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[22px] max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Academic Subject</h3>
                <p className="text-xs text-slate-500">Remove subject from question bank repository</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">{subjectToDelete.name}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border font-bold text-slate-700">
                  {subjectToDelete.code || 'No Code'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span>{subjectToDelete.programOrClass || 'General'}</span>
                <span>•</span>
                <span>{subjectToDelete.semester || 'No Semester'}</span>
                <span>•</span>
                <span className="capitalize">{subjectToDelete.status}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex gap-4 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1">
                  <span className="font-bold text-brand-navy">{subjectToDelete.questionCount || 0}</span> MCQs
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-bold text-brand-navy">{subjectToDelete.bookCount || 0}</span> Books
                </span>
              </div>
            </div>

            {subjectToDelete.questionCount > 0 ? (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  Subject contains active questions
                </p>
                <p className="text-slate-600">
                  This subject has <strong>{subjectToDelete.questionCount} MCQs</strong> and <strong>{subjectToDelete.bookCount} books</strong>. You can permanently delete the subject and its questions, or archive it to hide from students.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                Are you sure you want to permanently delete <strong>"{subjectToDelete.name}"</strong>? This action cannot be undone.
              </p>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                disabled={isDeletingSubject}
                onClick={() => handleExecuteDeleteSubject(subjectToDelete._id, false)}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {isDeletingSubject
                    ? 'Deleting...'
                    : subjectToDelete.questionCount > 0
                    ? 'Delete Subject & All MCQs Permanently'
                    : 'Delete Subject Permanently'}
                </span>
              </button>

              {subjectToDelete.questionCount > 0 && (
                <button
                  type="button"
                  disabled={isDeletingSubject}
                  onClick={() => handleExecuteDeleteSubject(subjectToDelete._id, true)}
                  className="w-full py-2 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <span>Archive Subject Only (Hide from Students)</span>
                </button>
              )}

              <button
                type="button"
                disabled={isDeletingSubject}
                onClick={() => setSubjectToDelete(null)}
                className="w-full py-2 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
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
 * SITE FOOTER COMPONENT
 * ======================================================================== */
function Footer({ onOpenAppModal }) {
  return (
    <footer className="bg-[#0B1329] text-slate-300 border-t border-slate-800 print:hidden mt-auto">
      {/* Top Footer Banner */}
      <div className="border-b border-slate-800/80 bg-slate-950/40 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md">
              <GraduationCap className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white">MCQs</span>
                <span className="text-lg font-black text-amber-400">Bank</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Live Academic Portal
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Higher Education Question Bank, Assessment & Timed Examination System
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAppModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md transition transform active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-slate-950" />
              <span>Get Android App (APK)</span>
            </button>
            <Link
              to="/practice"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition"
            >
              <Play className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span>Quick Practice</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main 4-Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
        {/* Col 1: Portal Overview */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">About MCQs Bank</h4>
          <p className="text-slate-400 leading-relaxed">
            MCQs Bank provides verified, syllabus-aligned multiple choice questions curated from standard university reference books. Designed for computer science, engineering, and academic degree programs.
          </p>
        </div>

        {/* Col 2: Academic Features */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Portal Features</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/catalog" className="text-slate-400 hover:text-amber-400 transition flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-amber-400" />
                Subjects & Reference Books
              </Link>
            </li>
            <li>
              <Link to="/practice" className="text-slate-400 hover:text-amber-400 transition flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-amber-400" />
                Chapter-Wise Practice Engine
              </Link>
            </li>
            <li>
              <Link to="/exam" className="text-slate-400 hover:text-amber-400 transition flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-amber-400" />
                Timed Examination & Assessment
              </Link>
            </li>
            <li>
              <Link to="/admin" className="text-slate-400 hover:text-amber-400 transition flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-amber-400" />
                Faculty & Admin Management
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Key Subjects */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Featured Curricula</h4>
          <ul className="space-y-2 text-slate-400">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Computer Architecture & Organization
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Database Management Systems
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Theory of Automata & Formal Languages
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              OOP: Analysis & UML Design
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Operating Systems & Networks
            </li>
          </ul>
        </div>

        {/* Col 4: Mobile App & Direct Download */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Mobile Companion App</h4>
          <p className="text-slate-400 leading-relaxed">
            Practice questions on your phone anytime, even when offline. Includes instant answer feedback and progress tracking.
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Android App</span>
              <span className="text-amber-400 font-mono font-bold">v1.0 (Build 2)</span>
            </div>
            <a
              href="https://github.com/IftikharZahid/MCQs-Bank/releases/latest/download/app-debug.apk"
              className="primary appDownloadAnchor w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-sm"
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>🤖</span>
              <span>Download Official APK</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 sm:px-6 pb-20 md:pb-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>
            © {new Date().getFullYear()} <span className="text-slate-300 font-semibold">MCQs Bank</span> — Academic Portal • Higher Education. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>English & اردو Support</span>
            <span>•</span>
            <span>Academic Integrity</span>
            <span>•</span>
            <Link to="/admin" className="hover:text-amber-400 transition">Faculty Access</Link>
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
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('qb_admin_user') || 'null');
    } catch {
      return null;
    }
  });
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);

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
      <Navbar
        adminUser={adminUser}
        onLogout={handleGlobalLogout}
        onOpenAppModal={() => setIsAppModalOpen(true)}
      />
      <main className="flex-1 pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<HomePage onOpenAppModal={() => setIsAppModalOpen(true)} />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/admin/*" element={<AdminPanel adminUser={adminUser} setAdminUser={setAdminUser} />} />
        </Routes>
      </main>
      <Footer onOpenAppModal={() => setIsAppModalOpen(true)} />
      <MobileBottomNav onOpenAppModal={() => setIsAppModalOpen(true)} />
      {isAppModalOpen && <MobileAppModal onClose={() => setIsAppModalOpen(false)} />}
    </div>
  );
}
