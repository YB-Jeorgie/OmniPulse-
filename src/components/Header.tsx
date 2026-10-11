import React, { useState } from 'react';
import { LocationData, StepTrackerData } from '../types';
import {
  Sparkles,
  HelpCircle,
  X,
  Compass,
  Footprints,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { GeminiLogo } from './AIIcons';

interface HeaderProps {
  currentActivity: string;
  location: LocationData;
  tracker: StepTrackerData;
}

export const Header: React.FC<HeaderProps> = ({ currentActivity, location, tracker }) => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <>
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <GeminiLogo className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  OmniPulse
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Multi-AI
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Live Steps & GPS Tracker • Gemini, ChatGPT, Meta AI & Grok
              </p>
            </div>
          </div>

          {/* Live Quick Status Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {/* Steps Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 shadow-sm shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Footprints className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono font-semibold text-white">
                {tracker.steps.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">steps</span>
            </div>

            {/* Location Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 shadow-sm shrink-0 max-w-[160px] truncate">
              <Compass className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate font-medium text-slate-200">
                {location.city || 'Locating...'}
              </span>
            </div>

            {/* Current Activity Pill */}
            {currentActivity && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-xs text-indigo-300 shadow-sm shrink-0 max-w-[180px] truncate">
                <span className="text-[10px] uppercase font-bold text-indigo-400">Doing:</span>
                <span className="truncate font-medium">{currentActivity}</span>
              </div>
            )}

            {/* Info / Guide Modal trigger */}
            <button
              onClick={() => setShowInfoModal(true)}
              className="p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors shrink-0"
              title="How tracking & Multi-AI works"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Info & Transparency Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">How OmniPulse Works</h3>
                <p className="text-xs text-slate-400">Telemetry Tracking & Multi-AI Explained</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                  <Footprints className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white mb-0.5">Automatic Step Counter</div>
                  <p className="text-slate-400 leading-relaxed">
                    Uses physical device motion accelerometer when accessible on mobile/tablets,
                    paired with an automatic background stride simulator so your steps continuously
                    accumulate during workouts and walks even in a desktop browser.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 mt-0.5">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white mb-0.5">Automatic GPS Location</div>
                  <p className="text-slate-400 leading-relaxed">
                    Automatically watches your GPS coordinates via the HTML5 Geolocation API and
                    reverse-geocodes your street and city. You can also pick test preset cities anytime.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white mb-0.5">Manual Activity Typing (As Requested)</div>
                  <p className="text-slate-400 leading-relaxed">
                    The app never guesses or assumes what you are doing. You type your exact activity
                    (e.g., "Studying at cafe", "Gym leg day", "Walking the dog") whenever you change tasks.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white mb-0.5">Multi-AI Lounge (Gemini, ChatGPT, Meta AI, Grok)</div>
                  <p className="text-slate-400 leading-relaxed">
                    Chat with each AI individually or open the <strong>All AIs Lounge</strong> to get
                    answers from all 4 models simultaneously. Each model maintains its authentic
                    personality, style, and reactions to your live activity and steps.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
              >
                Got it, let's go!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
