import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderSync,
  FileText,
  Copy,
  Sparkles,
  Clock,
  HelpCircle,
  Menu,
  X,
} from 'lucide-react';
import { SlothMascot } from './components/SlothMascot';
import { AiStatusBadge } from './components/AiStatusBadge';
import { ModeToggle } from './components/ModeToggle';
import { DashboardView } from './views/DashboardView';
import { ScannerOrganizerView } from './views/ScannerOrganizerView';
import { SummarizerView } from './views/SummarizerView';
import { DuplicateFinderView } from './views/DuplicateFinderView';
import { LazyModeView } from './views/LazyModeView';
import { HistoryView } from './views/HistoryView';
import { WhyOpenAiView } from './views/WhyOpenAiView';
import { ScanResult, SessionRecord, OllamaStatus } from './types';
import * as api from './api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isResettingDemo, setIsResettingDemo] = useState<boolean>(false);

  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [pickerSuggestions, setPickerSuggestions] = useState<Array<{ name: string; path: string }>>([]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Initialize data on mount
  useEffect(() => {
    const init = async () => {
      // 1. Fetch Health / Ollama Status
      try {
        const health = await api.fetchHealth();
        setOllamaStatus(health.ollama);
      } catch (e) {
        console.error('Failed to load health:', e);
      }

      // 2. Load History
      loadHistory();

      // 3. Load Picker Suggestions
      try {
        const p = await api.getPickerSuggestions();
        setPickerSuggestions(p.suggestions);
        if (p.suggestions.length > 0) {
          const defaultPath = p.suggestions[0].path;
          setCurrentPath(defaultPath);
          // Initial scan of sample workspace
          try {
            const initialScan = await api.scanFolder(defaultPath);
            setScanResult(initialScan);
          } catch (e) {
            console.error('Initial scan failed:', e);
          }
        }
      } catch (e) {
        console.error('Failed to load picker suggestions:', e);
      }
    };

    init();
  }, []);

  const loadHistory = async () => {
    try {
      const hist = await api.getHistory();
      setHistory(hist);
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  };

  const handleRefreshHealth = async () => {
    try {
      const health = await api.fetchHealth();
      setOllamaStatus(health.ollama);
    } catch (e) {
      console.error('Failed to refresh health:', e);
    }
  };

  const handleModeToggle = async (enableDemo: boolean) => {
    setIsDemoMode(enableDemo);
    if (enableDemo) {
      // Switch to sample workspace
      const demoItem = pickerSuggestions.find((p) => p.name.includes('Demo') || p.name.includes('Sample'));
      const targetPath = demoItem ? demoItem.path : currentPath;
      setCurrentPath(targetPath);
      try {
        const res = await api.scanFolder(targetPath);
        setScanResult(res);
      } catch (e) {
        console.error('Demo scan failed:', e);
      }
    }
  };

  const handleResetDemoWorkspace = async () => {
    setIsResettingDemo(true);
    try {
      const res = await api.resetDemoWorkspace();
      setCurrentPath(res.path);
      const scanRes = await api.scanFolder(res.path);
      setScanResult(scanRes);
      alert('Demo workspace reset successfully with fresh sample files.');
    } catch (e: any) {
      alert(`Reset failed: ${e.message}`);
    } finally {
      setIsResettingDemo(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'organizer', label: 'Smart Organizer', icon: <FolderSync className="w-4 h-4" /> },
    { id: 'summarizer', label: 'Document Summaries', icon: <FileText className="w-4 h-4" /> },
    { id: 'duplicates', label: 'Duplicate Finder', icon: <Copy className="w-4 h-4" /> },
    { id: 'lazy-mode', label: 'Lazy Mode 🦥', icon: <Sparkles className="w-4 h-4 text-emerald-400" /> },
    { id: 'history', label: 'Activity History', icon: <Clock className="w-4 h-4" /> },
    { id: 'why-open-ai', label: 'Why Open AI? & Settings', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF8F5] text-stone-900 font-sans">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-300 flex flex-col shrink-0 border-r border-stone-800">
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <SlothMascot size={38} mood="relaxed" />
            <div>
              <span className="font-extrabold text-base tracking-tight text-white font-brand block leading-none">
                LazyDesk AI
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wide uppercase">
                Stay Lazy. Get Organized.
              </span>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-stone-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className={`p-3 space-y-1 md:block ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-md shadow-emerald-950/30'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mascot in Sidebar Footer */}
        <div className="mt-auto p-4 border-t border-stone-800/80 hidden md:block">
          <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700/60 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-white">
              <span className="text-emerald-400 text-sm">🦥</span>
              <span>Local Sloth Philosophy</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Why do manual file sorting when open-weight AI can do the chores on-device?
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top App Bar */}
        <header className="h-16 px-6 bg-white/80 backdrop-blur-md border-b border-stone-200/80 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 truncate">
            <ModeToggle
              isDemoMode={isDemoMode}
              onToggle={handleModeToggle}
              onResetDemo={handleResetDemoWorkspace}
              isResetting={isResettingDemo}
            />
          </div>

          <div className="flex items-center gap-3">
            <AiStatusBadge
              status={ollamaStatus}
              onOpenSettings={() => setActiveTab('why-open-ai')}
            />
          </div>
        </header>

        {/* View Router */}
        <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              currentPath={currentPath}
              scanResult={scanResult}
              history={history}
              ollamaStatus={ollamaStatus}
              onNavigate={(tab) => setActiveTab(tab)}
              onStartLazyMode={() => setActiveTab('lazy-mode')}
              isDemoMode={isDemoMode}
            />
          )}

          {activeTab === 'organizer' && (
            <ScannerOrganizerView
              currentPath={currentPath}
              onPathChange={setCurrentPath}
              scanResult={scanResult}
              onScanComplete={setScanResult}
              pickerSuggestions={pickerSuggestions}
              onRefreshHistory={loadHistory}
            />
          )}

          {activeTab === 'summarizer' && (
            <SummarizerView
              availableFiles={scanResult ? scanResult.files : []}
              currentPath={currentPath}
            />
          )}

          {activeTab === 'duplicates' && (
            <DuplicateFinderView
              duplicates={scanResult ? scanResult.duplicates : []}
              currentPath={currentPath}
            />
          )}

          {activeTab === 'lazy-mode' && (
            <LazyModeView
              currentPath={currentPath}
              onRefreshHistory={loadHistory}
              onScanUpdated={setScanResult}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              sessions={history}
              onRefresh={loadHistory}
            />
          )}

          {activeTab === 'why-open-ai' && (
            <WhyOpenAiView
              ollamaStatus={ollamaStatus}
              onRefreshHealth={handleRefreshHealth}
            />
          )}
        </main>
      </div>
    </div>
  );
};
