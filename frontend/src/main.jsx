import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/index.js';
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
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Register Service Worker cleanly for Mobile PWA, WebAPK, and offline support in production
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (import.meta.env.PROD && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((reg) => {
          reg.update().catch(() => {});
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed (non-critical):', err);
        });
    });
  } else {
    // In development mode, unregister any stale service workers that could block mobile views
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
  }
}
