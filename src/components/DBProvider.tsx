import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

interface DBContextValue {
  ready: boolean;
  error: string | null;
}

const DBContext = createContext<DBContextValue>({ ready: false, error: null });

export function useDB() {
  return useContext(DBContext);
}

interface DBProviderProps {
  children: ReactNode;
}

// ─── Loading Spinner ─────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg-darkest">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 rounded-full border-2 border-border-subtle" />
        {/* Spinning arc */}
        <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-info animate-spin" />
        {/* Inner pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-info animate-pulse-dot" />
        </div>
      </div>
      <div className="mt-6 text-[14px] font-medium text-text-secondary tracking-tight">
        SuiteAI Dashboard
      </div>
      <div className="mt-1 text-[12px] text-text-tertiary">
        Initializing SQLite database...
      </div>
    </div>
  );
}

// ─── Error Screen ────────────────────────────────────────────────────────────

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg-darkest">
      <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <div className="text-[14px] font-medium text-text-primary mb-1">
        Failed to initialize database
      </div>
      <div className="text-[12px] text-text-tertiary max-w-[320px] text-center">
        {message}
      </div>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-bg-elevated border border-border-default text-text-primary text-[13px] rounded-md hover:bg-bg-hover transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

// ─── Provider Component ──────────────────────────────────────────────────────

export default function DBProvider({ children }: DBProviderProps) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const init = useDashboardStore((s) => s.init);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        await init();
        if (!cancelled) {
          setReady(true);
        }
      } catch (err: any) {
        console.error('[DBProvider] Init failed:', err);
        if (!cancelled) {
          setError(err?.message || 'Unknown error');
        }
      }
    }

    boot();

    return () => {
      cancelled = true;
    };
  }, [init]);

  if (error) {
    return <ErrorScreen message={error} />;
  }

  if (!ready) {
    return <LoadingScreen />;
  }

  return (
    <DBContext.Provider value={{ ready, error }}>
      {children}
    </DBContext.Provider>
  );
}
