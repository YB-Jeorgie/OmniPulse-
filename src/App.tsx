import { useState, useEffect } from 'react';
import { useStepCounter } from './hooks/useStepCounter';
import { useLocationTracker } from './hooks/useLocationTracker';
import { Header } from './components/Header';
import { ActivityLogger } from './components/ActivityLogger';
import { TelemetryDashboard } from './components/TelemetryDashboard';
import { AIChatBox } from './components/AIChatBox';
import { UserActivityEntry } from './types';

const ACTIVITY_STORAGE_KEY = 'omnipulse_current_activity';
const HISTORY_STORAGE_KEY = 'omnipulse_activity_history';
const SHARE_AI_STORAGE_KEY = 'omnipulse_share_ai_telemetry';

export default function App() {
  const { tracker, toggleAutoSimulating, addManualSteps, resetSteps } = useStepCounter();
  const { location, startTracking, setPresetLocation } = useLocationTracker();

  // Current user-typed activity
  const [currentActivity, setCurrentActivity] = useState<string>(() => {
    try {
      return localStorage.getItem(ACTIVITY_STORAGE_KEY) || 'Building & testing full-stack app';
    } catch {
      return 'Building & testing full-stack app';
    }
  });

  // History log of user-typed activities
  const [activityHistory, setActivityHistory] = useState<UserActivityEntry[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'hist-1',
        text: 'Morning walk & coffee run',
        timestamp: Date.now() - 3600000 * 2,
        stepsAtTime: 1840,
        locationAtTime: 'Market St, San Francisco',
      },
      {
        id: 'hist-2',
        text: 'Building & testing full-stack app',
        timestamp: Date.now() - 1800000,
        stepsAtTime: 3200,
        locationAtTime: 'San Francisco, CA',
      },
    ];
  });

  // Toggle to share telemetry with AIs
  const [shareWithAI, setShareWithAI] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SHARE_AI_STORAGE_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Update current activity and append to history
  const handleUpdateActivity = (newActivity: string) => {
    setCurrentActivity(newActivity);
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, newActivity);
    } catch {}

    const locStr = [location.city, location.country].filter(Boolean).join(', ') || location.address;
    const newEntry: UserActivityEntry = {
      id: `act-${Date.now()}`,
      text: newActivity,
      timestamp: Date.now(),
      stepsAtTime: tracker.steps,
      locationAtTime: locStr,
    };

    setActivityHistory((prev) => {
      const updated = [newEntry, ...prev.slice(0, 24)];
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearHistory = () => {
    setActivityHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {}
  };

  const handleDeleteHistoryItem = (id: string) => {
    setActivityHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleToggleShareWithAI = (val: boolean) => {
    setShareWithAI(val);
    try {
      localStorage.setItem(SHARE_AI_STORAGE_KEY, JSON.stringify(val));
    } catch {}
  };

  // Re-save history on unload
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, currentActivity);
      localStorage.setItem(SHARE_AI_STORAGE_KEY, JSON.stringify(shareWithAI));
    } catch {}
  }, [currentActivity, shareWithAI]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Header with real-time indicators */}
      <Header currentActivity={currentActivity} location={location} tracker={tracker} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Top Section: Activity Logger & Automatic Telemetry (5 cols on lg) */}
          <section className="lg:col-span-5 space-y-6">
            {/* 1. What I am doing (Manual User Typing as specifically requested) */}
            <ActivityLogger
              currentActivity={currentActivity}
              onUpdateActivity={handleUpdateActivity}
              activityHistory={activityHistory}
              onClearHistory={handleClearHistory}
              onDeleteHistoryItem={handleDeleteHistoryItem}
              location={location}
              tracker={tracker}
              shareWithAI={shareWithAI}
              onToggleShareWithAI={handleToggleShareWithAI}
            />

            {/* 2. Automatic Steps & GPS Location Dashboards */}
            <TelemetryDashboard
              tracker={tracker}
              location={location}
              onToggleSimulate={toggleAutoSimulating}
              onAddSteps={addManualSteps}
              onResetSteps={resetSteps}
              onRefreshLocation={startTracking}
              onSetPresetLocation={setPresetLocation}
            />
          </section>

          {/* Right Section: Multi-AI Chat Lounge (Gemini, ChatGPT, Meta AI, Grok, or All 4) (7 cols on lg) */}
          <section className="lg:col-span-7">
            <AIChatBox
              currentActivity={currentActivity}
              location={location}
              tracker={tracker}
              shareWithAI={shareWithAI}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            OmniPulse • Automatic Pedometer & GPS Telemetry with User-Specified Activity Logging
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Gemini (Google)</span>
            <span>•</span>
            <span>ChatGPT (OpenAI)</span>
            <span>•</span>
            <span>Meta AI</span>
            <span>•</span>
            <span>Grok (xAI)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
