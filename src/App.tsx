import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { InspectPage } from './pages/InspectPage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { Inspection, SampleMediaItem } from './types/index.ts';
import { api } from './services/api.ts';

function MainApp() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname;
    return ['/', '/login', '/dashboard', '/inspect', '/history', '/settings'].includes(path) ? path : '/';
  });

  const [samples, setSamples] = useState<SampleMediaItem[]>([]);
  const [activeInspection, setActiveInspection] = useState<Inspection | null>(null);

  // Sync browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentRoute(['/', '/login', '/dashboard', '/inspect', '/history', '/settings'].includes(path) ? path : '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    if (window.location.pathname !== route) {
      window.history.pushState({}, '', route);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load sample media presets on mount
  useEffect(() => {
    async function loadSamples() {
      try {
        const response = await api.getSampleMedia();
        setSamples(response.samples);
      } catch (err) {
        console.error('Failed to load sample media:', err);
      }
    }
    loadSamples();
  }, []);

  // Handler when selecting an inspection from Dashboard or History to inspect in detail
  const handleSelectInspection = (inspection: Inspection) => {
    setActiveInspection(inspection);
    navigate('/inspect');
  };

  // If loading session on first turn
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>INITIALIZING VISIONIQ ENTERPRISE...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar currentRoute={currentRoute} navigate={navigate} />

      <main className="flex-1">
        {currentRoute === '/' && (
          <LandingPage navigate={navigate} samples={samples} />
        )}

        {currentRoute === '/login' && (
          <LoginPage navigate={navigate} />
        )}

        {currentRoute === '/dashboard' && (
          <DashboardPage
            navigate={navigate}
            onSelectInspection={handleSelectInspection}
          />
        )}

        {currentRoute === '/inspect' && (
          <InspectPage
            samples={samples}
            preloadedInspection={activeInspection}
            onClearPreloaded={() => setActiveInspection(null)}
          />
        )}

        {currentRoute === '/history' && (
          <HistoryPage onSelectInspection={handleSelectInspection} />
        )}

        {currentRoute === '/settings' && (
          <SettingsPage />
        )}
      </main>

      {/* Enterprise Quiet Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">VisionIQ Enterprise</span>
            <span>·</span>
            <span>Multimodal Computer Vision Inspection Engine</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <span>Powered by Google Gemini Vision</span>
            <span>·</span>
            <span>PostgreSQL Audit Store</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
