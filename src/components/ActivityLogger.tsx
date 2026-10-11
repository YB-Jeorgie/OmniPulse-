import React, { useState } from 'react';
import { UserActivityEntry, LocationData, StepTrackerData } from '../types';
import { Edit3, CheckCircle2, History, Trash2, Tag, Compass, Footprints, Clock } from 'lucide-react';

interface ActivityLoggerProps {
  currentActivity: string;
  onUpdateActivity: (newActivity: string) => void;
  activityHistory: UserActivityEntry[];
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  location: LocationData;
  tracker: StepTrackerData;
  shareWithAI: boolean;
  onToggleShareWithAI: (val: boolean) => void;
}

const PRESET_ACTIVITIES = [
  { icon: '💻', label: 'Coding & Debugging' },
  { icon: '🏃', label: 'Jogging Outdoors' },
  { icon: '🚶', label: 'Casual Walking' },
  { icon: '☕', label: 'Coffee & Chill' },
  { icon: '🏋️', label: 'Weightlifting at Gym' },
  { icon: '📚', label: 'Deep Study Session' },
  { icon: '🎧', label: 'Listening to Podcasts' },
  { icon: '🍕', label: 'Grabbing Lunch' },
];

export const ActivityLogger: React.FC<ActivityLoggerProps> = ({
  currentActivity,
  onUpdateActivity,
  activityHistory,
  onClearHistory,
  onDeleteHistoryItem,
  location,
  tracker,
  shareWithAI,
  onToggleShareWithAI,
}) => {
  const [inputValue, setInputValue] = useState(currentActivity);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;
    onUpdateActivity(inputValue.trim());
    setJustUpdated(true);
    setTimeout(() => setJustUpdated(false), 2200);
  };

  const handleSelectPreset = (label: string) => {
    setInputValue(label);
    onUpdateActivity(label);
    setJustUpdated(true);
    setTimeout(() => setJustUpdated(false), 2200);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Edit3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              Current Activity
              <span className="text-[10px] font-normal normal-case px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                User-Typed
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              You specify what you're doing; steps & location are tracked automatically.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activityHistory.length > 0 && (
            <button
              onClick={() => setShowHistoryModal(!showHistoryModal)}
              className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors"
              title="View activity log timeline"
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>Log ({activityHistory.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Active Status Banner */}
      <div className="mb-4 bg-slate-950/70 border border-indigo-500/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
          </span>
          <div className="truncate">
            <span className="text-xs text-slate-400 block font-medium">Right now I am:</span>
            <span className="text-sm sm:text-base font-semibold text-white tracking-wide truncate block">
              {currentActivity || 'No activity specified yet — type below!'}
            </span>
          </div>
        </div>

        {justUpdated && (
          <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-700/50 animate-bounce">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Updated!</span>
          </div>
        )}
      </div>

      {/* Manual Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type what you're doing right now..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save Status</span>
        </button>
      </form>

      {/* Quick Preset Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-none">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
          <Tag className="w-3 h-3 text-slate-500" /> Quick:
        </span>
        {PRESET_ACTIVITIES.map((item) => (
          <button
            key={item.label}
            onClick={() => handleSelectPreset(item.label)}
            className="shrink-0 text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-all flex items-center gap-1 hover:border-slate-500"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Telemetry Sharing Toggle */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={shareWithAI}
            onChange={(e) => onToggleShareWithAI(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 focus:ring-indigo-500 rounded-sm cursor-pointer"
          />
          <span className="text-slate-300">
            Share this activity, automatic steps & GPS with AIs
          </span>
        </label>

        <span className="text-[11px] text-slate-400 hidden sm:inline">
          {shareWithAI ? '✨ Context enabled' : '🔒 Privacy mode'}
        </span>
      </div>

      {/* History Drawer/Modal */}
      {showHistoryModal && (
        <div className="mt-4 pt-3 border-t border-slate-800 bg-slate-950/80 -mx-4 -mb-4 p-4 rounded-b-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              Activity Log Timeline
            </h3>
            <button
              onClick={onClearHistory}
              className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Clear log
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {activityHistory.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between gap-2 hover:border-slate-700 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-medium text-slate-200 truncate">{item.text}</div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Footprints className="w-3 h-3 text-indigo-400" />
                      {item.stepsAtTime.toLocaleString()} steps
                    </span>
                    {item.locationAtTime && (
                      <span className="flex items-center gap-1 truncate max-w-[120px]">
                        <Compass className="w-3 h-3 text-emerald-400" />
                        {item.locationAtTime}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteHistoryItem(item.id)}
                  className="text-slate-500 hover:text-red-400 p-1 rounded-md transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
