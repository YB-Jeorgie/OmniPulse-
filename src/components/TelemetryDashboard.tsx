import React, { useState } from 'react';
import { LocationData, StepTrackerData } from '../types';
import {
  Footprints,
  Compass,
  MapPin,
  Flame,
  Activity,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Navigation2,
  Radio,
  ExternalLink,
  ChevronDown,
  Globe,
} from 'lucide-react';

interface TelemetryDashboardProps {
  tracker: StepTrackerData;
  location: LocationData;
  onToggleSimulate: () => void;
  onAddSteps: (count: number) => void;
  onResetSteps: () => void;
  onRefreshLocation: () => void;
  onSetPresetLocation: (
    name: string,
    lat: number,
    lng: number,
    address: string,
    city: string,
    country: string
  ) => void;
}

const PRESET_CITIES = [
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194, addr: 'Market St, San Francisco, CA', city: 'San Francisco', country: 'USA' },
  { name: 'New York', lat: 40.7128, lng: -74.006, addr: 'Broadway & 5th Ave, New York, NY', city: 'New York', country: 'USA' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, addr: 'Shibuya Crossing, Tokyo', city: 'Tokyo', country: 'Japan' },
  { name: 'London', lat: 51.5074, lng: -0.1278, addr: 'Westminster, London', city: 'London', country: 'United Kingdom' },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, addr: 'Champs-Élysées, Paris', city: 'Paris', country: 'France' },
];

export const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({
  tracker,
  location,
  onToggleSimulate,
  onAddSteps,
  onResetSteps,
  onRefreshLocation,
  onSetPresetLocation,
}) => {
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const goalPercent = Math.min(100, Math.round((tracker.steps / tracker.dailyGoal) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. AUTOMATIC STEP COUNTER CARD */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden backdrop-blur-md flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div>
          {/* Card Title & Sensor Status */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Footprints className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Step Counter
                </h3>
                <span className="text-xs text-slate-400">Automatic Pedometer</span>
              </div>
            </div>

            {/* Live Sensor / Simulation Status */}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${tracker.status !== 'idle' ? 'bg-emerald-400 opacity-75' : 'bg-slate-500 opacity-20'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${tracker.status !== 'idle' ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
              </span>
              <span className="text-[11px] font-semibold text-slate-300">
                {tracker.isSensorActive
                  ? 'Device Sensor'
                  : tracker.isAutoSimulating
                  ? 'Auto-Stride'
                  : 'Idle'}
              </span>
            </div>
          </div>

          {/* Main Step Metric */}
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums">
                {tracker.steps.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 ml-2 font-medium">
                / {tracker.dailyGoal.toLocaleString()} goal
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 uppercase">
                {goalPercent}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2.5 mb-4 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/50"
              style={{ width: `${goalPercent}%` }}
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center mb-3">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                <Navigation2 className="w-3 h-3 text-emerald-400" /> Distance
              </div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">
                {tracker.distanceKm} <span className="text-[10px] text-slate-400 font-normal">km</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" /> Burned
              </div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">
                {tracker.calories} <span className="text-[10px] text-slate-400 font-normal">kcal</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" /> Cadence
              </div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">
                {tracker.cadence} <span className="text-[10px] text-slate-400 font-normal">spm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={onToggleSimulate}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all ${
              tracker.isAutoSimulating
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {tracker.isAutoSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause Auto
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Resume Auto
              </>
            )}
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onAddSteps(100)}
              className="text-xs px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1"
              title="Add 100 test steps"
            >
              <Plus className="w-3 h-3" /> 100
            </button>
            <button
              onClick={() => onAddSteps(500)}
              className="text-xs px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1"
              title="Add 500 test steps"
            >
              <Plus className="w-3 h-3" /> 500
            </button>
            <button
              onClick={onResetSteps}
              className="text-xs p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
              title="Reset today's steps"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. AUTOMATIC LOCATION CARD */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden backdrop-blur-md flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Live Location
                </h3>
                <span className="text-xs text-slate-400">Automatic GPS Geolocation</span>
              </div>
            </div>

            {/* GPS Lock status */}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
              </span>
              <span className="text-[11px] font-semibold text-sky-300">
                {location.status === 'active' ? 'GPS Locked' : 'Locating...'}
              </span>
            </div>
          </div>

          {/* Place & Address */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 mb-3">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-sm sm:text-base font-bold text-white tracking-wide truncate">
                  {location.city || 'Determining Location...'}
                  {location.country ? `, ${location.country}` : ''}
                </div>
                <div className="text-xs text-slate-400 truncate mt-0.5">
                  {location.address || 'Resolving nearby address via GPS...'}
                </div>
              </div>
            </div>
          </div>

          {/* Radar / Coordinates visualization */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                Coordinates
              </span>
              <span className="font-mono text-slate-200 text-xs font-medium block truncate">
                {location.latitude?.toFixed(4) ?? '---'}°, {location.longitude?.toFixed(4) ?? '---'}°
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                GPS Accuracy
              </span>
              <span className="font-mono text-slate-200 text-xs font-medium block">
                ±{location.accuracy ? Math.round(location.accuracy) : 10} meters
              </span>
            </div>
          </div>
        </div>

        {/* Location Controls & Picker */}
        <div className="relative pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshLocation}
              className="text-xs px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition-colors flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 text-sky-400" /> Refresh GPS
            </button>

            {location.latitude && location.longitude && (
              <a
                href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=16/${location.latitude}/${location.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors inline-flex items-center gap-1"
                title="View on OpenStreetMap"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Presets</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLocationPicker && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-30">
                <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Test Locations
                </div>
                {PRESET_CITIES.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      onSetPresetLocation(c.name, c.lat, c.lng, c.addr, c.city, c.country);
                      setShowLocationPicker(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between"
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-slate-500">{c.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
