import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Portal Runtime Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xl">!</div>
            <h1 className="text-xl font-bold text-slate-800">Something went wrong</h1>
            <p className="text-sm text-slate-600">{this.state.error?.message || 'An unexpected rendering error occurred.'}</p>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold text-sm transition"
            >
              Reload Portal Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

// Ensure clean, stable execution across all mobile browsers without stale worker crashes
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
  }).catch(() => {});
}
if ('caches' in window) {
  caches.keys().then(keys => {
    keys.forEach(k => caches.delete(k));
  }).catch(() => {});
}
