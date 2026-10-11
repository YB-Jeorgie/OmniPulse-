import React, { useState, useRef, useEffect } from 'react';
import { PersonaId, ChatMessage, LocationData, StepTrackerData } from '../types';
import { PERSONAS, QUICK_PROMPTS } from '../constants/personas';
import { getPersonaIcon } from './AIIcons';
import {
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Footprints,
  MapPin,
  Edit3,
  Bot,
  User,
  Users,
  Info,
} from 'lucide-react';

interface AIChatBoxProps {
  currentActivity: string;
  location: LocationData;
  tracker: StepTrackerData;
  shareWithAI: boolean;
}

export const AIChatBox: React.FC<AIChatBoxProps> = ({
  currentActivity,
  location,
  tracker,
  shareWithAI,
}) => {
  const [activePersona, setActivePersona] = useState<PersonaId>('all');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-1',
        role: 'ai',
        persona: 'all',
        text: "👋 Welcome to the Multi-AI Activity Lounge! We're connected to your live steps, location, and your typed activity. Ask anything, compare perspectives, or let us roast your day!",
        timestamp: Date.now() - 10000,
      },
      {
        id: 'welcome-2',
        role: 'ai',
        persona: 'grok',
        text: "I see you're here. Let's see if those steps actually add up to something interesting today or if you're just gaming the accelerometer.",
        timestamp: Date.now() - 8000,
      },
    ];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Copy to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Text-to-Speech using Web Speech API
  const handleSpeak = (id: string, text: string, persona: PersonaId) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const cfg = PERSONAS[persona] || PERSONAS.gemini;
    utterance.pitch = cfg.voicePitch;
    utterance.rate = cfg.voiceRate;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Stop speaking when unmounted
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Send message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    setInputMessage('');

    // Telemetry snapshot
    const locStr = [location.city, location.country].filter(Boolean).join(', ') || location.address;
    const telemetrySnapshot = shareWithAI
      ? {
          steps: tracker.steps,
          activity: currentActivity,
          locationStr: locStr,
        }
      : undefined;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      persona: activePersona,
      text: textToSend,
      timestamp: Date.now(),
      telemetrySnapshot,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const telemetryPayload = shareWithAI
        ? {
            activity: currentActivity,
            steps: tracker.steps,
            cadence: tracker.cadence,
            location: {
              latitude: location.latitude,
              longitude: location.longitude,
              city: location.city,
              country: location.country,
              address: location.address,
            },
            shareTelemetry: true,
          }
        : { shareTelemetry: false };

      if (activePersona === 'all') {
        // Multi-AI Group Lounge: All 4 models respond!
        const res = await fetch('/api/chat-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: textToSend,
            telemetry: telemetryPayload,
          }),
        });

        if (!res.ok) throw new Error('Failed to get group replies');
        const data = await res.json();

        if (Array.isArray(data.responses)) {
          const aiMsgs: ChatMessage[] = data.responses.map(
            (item: { persona: PersonaId; reply: string }, idx: number) => ({
              id: `ai-${item.persona}-${Date.now()}-${idx}`,
              role: 'ai',
              persona: item.persona,
              text: item.reply,
              timestamp: Date.now() + idx * 50,
            })
          );
          setMessages((prev) => [...prev, ...aiMsgs]);
        }
      } else {
        // Single AI 1-on-1 response
        // Extract history for this persona
        const relevantHistory = messages
          .filter((m) => m.persona === activePersona || m.persona === 'all')
          .slice(-6)
          .map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.text,
          }));

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: textToSend,
            persona: activePersona,
            telemetry: telemetryPayload,
            history: relevantHistory,
          }),
        });

        if (!res.ok) throw new Error('Failed to get response');
        const data = await res.json();

        const aiMsg: ChatMessage = {
          id: `ai-${activePersona}-${Date.now()}`,
          role: 'ai',
          persona: activePersona,
          text: data.reply,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'ai',
        persona: activePersona === 'all' ? 'gemini' : activePersona,
        text: `Error connecting to AI: ${err?.message || 'Please check your connection and retry.'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `cleared-${Date.now()}`,
        role: 'ai',
        persona: activePersona,
        text: `Chat thread reset. We're ready for your next message!`,
        timestamp: Date.now(),
      },
    ]);
  };

  // Filter messages based on active persona tab
  const displayedMessages = messages.filter((m) => {
    if (activePersona === 'all') return true;
    return m.persona === activePersona || m.persona === 'all' || m.role === 'user';
  });

  const activePersonaCfg = PERSONAS[activePersona];

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[640px] relative overflow-hidden backdrop-blur-md">
      {/* 1. TOP PERSONA TABS BAR */}
      <div className="bg-slate-950/90 border-b border-slate-800 p-2 sm:p-3 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Round Table / All AIs */}
          <button
            onClick={() => setActivePersona('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              activePersona === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40 ring-1 ring-purple-400/50'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-purple-300" />
            <span>All AIs Lounge</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800">
              4 AIs
            </span>
          </button>

          {/* Individual AIs: Gemini, ChatGPT, Meta AI, Grok */}
          {(['gemini', 'chatgpt', 'meta', 'grok'] as PersonaId[]).map((pid) => {
            const p = PERSONAS[pid];
            const isCurrent = activePersona === pid;
            return (
              <button
                key={pid}
                onClick={() => setActivePersona(pid)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                  isCurrent
                    ? `${p.badgeBg} text-white shadow-sm ring-1 ${p.borderColor}`
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span className="shrink-0">{getPersonaIcon(pid, 'w-3.5 h-3.5')}</span>
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Clear Chat Button */}
        <button
          onClick={handleClearChat}
          className="text-xs p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors shrink-0"
          title="Reset conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. PERSONA SUB-BANNER */}
      <div className="bg-slate-950/50 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">{activePersonaCfg.name}</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400 text-[11px] truncate hidden sm:inline">
            {activePersonaCfg.tagline}
          </span>
        </div>

        {activePersona === 'all' && (
          <span className="text-[11px] text-purple-300 bg-purple-950/70 border border-purple-800/60 px-2 py-0.5 rounded-full shrink-0">
            ⚡ 4-way AI debate mode
          </span>
        )}
      </div>

      {/* 3. MESSAGE FEED */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayedMessages.map((msg) => {
          const isUser = msg.role === 'user';
          const pCfg = PERSONAS[msg.persona] || PERSONAS.gemini;

          if (isUser) {
            return (
              <div key={msg.id} className="flex flex-col items-end space-y-1 max-w-[85%] ml-auto">
                {/* Telemetry pill attached to user message */}
                {msg.telemetrySnapshot && (
                  <div className="flex items-center gap-2 text-[10px] text-indigo-300 bg-indigo-950/80 border border-indigo-800/70 px-2.5 py-1 rounded-full mb-0.5 shadow-sm">
                    <span className="flex items-center gap-1 font-mono">
                      <Footprints className="w-2.5 h-2.5 text-indigo-400" />
                      {msg.telemetrySnapshot.steps.toLocaleString()}
                    </span>
                    {msg.telemetrySnapshot.locationStr && (
                      <span className="flex items-center gap-1 truncate max-w-[140px]">
                        <MapPin className="w-2.5 h-2.5 text-sky-400" />
                        {msg.telemetrySnapshot.locationStr}
                      </span>
                    )}
                    {msg.telemetrySnapshot.activity && (
                      <span className="flex items-center gap-1 truncate max-w-[120px] text-emerald-300">
                        <Edit3 className="w-2.5 h-2.5 text-emerald-400" />
                        {msg.telemetrySnapshot.activity}
                      </span>
                    )}
                  </div>
                )}

                <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm shadow-md shadow-indigo-950/30 whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </div>

                <span className="text-[10px] text-slate-500 mr-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            );
          }

          // AI Response Bubble
          return (
            <div key={msg.id} className="flex items-start gap-3 max-w-[90%] sm:max-w-[85%] group">
              {/* Persona Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${pCfg.avatarBg}`}
                title={`${pCfg.name} (${pCfg.creator})`}
              >
                {getPersonaIcon(msg.persona, 'w-4 h-4')}
              </div>

              <div className="flex-1 space-y-1 min-w-0">
                {/* Sender badge */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">{pCfg.name}</span>
                  <span className="text-[10px] text-slate-500 font-medium px-1.5 py-0.2 rounded bg-slate-800">
                    {pCfg.creator}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Message Body */}
                <div
                  className={`rounded-2xl rounded-tl-sm p-3.5 sm:p-4 text-sm text-slate-100 border ${pCfg.bubbleBg} ${pCfg.borderColor} leading-relaxed whitespace-pre-wrap shadow-lg`}
                >
                  {msg.text}
                </div>

                {/* Bubble action toolbar (Copy, Speak) */}
                <div className="flex items-center gap-2 pt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-800"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleSpeak(msg.id, msg.text, msg.persona)}
                    className={`text-[11px] flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-800 ${
                      speakingId === msg.id
                        ? 'text-indigo-400 font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={speakingId === msg.id ? 'Stop audio' : 'Listen with TTS'}
                  >
                    {speakingId === msg.id ? (
                      <>
                        <VolumeX className="w-3 h-3 text-indigo-400" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3" />
                        <span>Read aloud</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 text-xs text-slate-400 animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-slate-300 flex items-center gap-2">
              <span>
                {activePersona === 'all'
                  ? 'All 4 AIs (Gemini, ChatGPT, Meta AI, Grok) are thinking...'
                  : `${activePersonaCfg.name} is responding...`}
              </span>
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. QUICK PROMPT PILLS */}
      <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2 scrollbar-none">
        <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">Prompts:</span>
        {QUICK_PROMPTS.map((qp) => (
          <button
            key={qp.label}
            onClick={() => handleSendMessage(qp.text)}
            disabled={isLoading}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* 5. TELEMETRY BADGE PREVIEW ABOVE INPUT */}
      <div className="px-4 py-1.5 bg-slate-950/90 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-slate-300">Context Attached:</span>
          {shareWithAI ? (
            <div className="flex items-center gap-2 truncate text-slate-300">
              <span className="text-emerald-400 font-mono">
                👟 {tracker.steps.toLocaleString()} steps
              </span>
              <span>•</span>
              <span className="text-sky-300 truncate">
                📍 {location.city || 'Determining location'}
              </span>
              <span>•</span>
              <span className="text-indigo-300 truncate font-medium">
                ✍️ {currentActivity || 'No activity typed'}
              </span>
            </div>
          ) : (
            <span className="text-amber-400 italic">Off (AI won't see steps or GPS)</span>
          )}
        </div>

        <span className="text-[10px] text-slate-500 uppercase tracking-wider hidden sm:inline">
          {activePersona === 'all' ? 'Group Room' : activePersona}
        </span>
      </div>

      {/* 6. INPUT BAR */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            activePersona === 'all'
              ? 'Message Gemini, ChatGPT, Meta AI, and Grok together...'
              : `Ask ${activePersonaCfg.name} about your steps, activity, or anything...`
          }
          disabled={isLoading}
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-50 shadow-inner"
        />

        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center shrink-0"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
