export type PersonaId = 'all' | 'gemini' | 'chatgpt' | 'meta' | 'grok';

export interface PersonaConfig {
  id: PersonaId;
  name: string;
  creator: string;
  title: string;
  tagline: string;
  avatarBg: string;
  accentColor: string;
  badgeBg: string;
  bubbleBg: string;
  borderColor: string;
  avatarIcon: string;
  voicePitch: number;
  voiceRate: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  persona: PersonaId;
  text: string;
  timestamp: number;
  telemetrySnapshot?: {
    steps: number;
    activity: string;
    locationStr: string;
  };
  isLoading?: boolean;
}

export interface UserActivityEntry {
  id: string;
  text: string;
  timestamp: number;
  stepsAtTime: number;
  locationAtTime: string;
  category?: string;
}

export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  address: string;
  city: string;
  country: string;
  status: 'idle' | 'requesting' | 'active' | 'denied' | 'error';
  errorMessage?: string;
  lastUpdated: number | null;
}

export interface StepTrackerData {
  steps: number;
  dailyGoal: number;
  cadence: number; // steps per minute
  distanceKm: number;
  calories: number;
  activeMinutes: number;
  status: 'walking' | 'running' | 'idle';
  isAutoSimulating: boolean;
  isSensorSupported: boolean;
  isSensorActive: boolean;
}
