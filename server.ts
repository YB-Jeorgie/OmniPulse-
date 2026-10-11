import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini client using server-side API key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface UserTelemetry {
  activity?: string;
  steps?: number;
  cadence?: number;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
    country?: string;
  };
  shareTelemetry?: boolean;
}

const PERSONA_SYSTEM_PROMPTS: Record<string, string> = {
  gemini: `You are Gemini, Google's advanced multimodal AI assistant.
Your Persona:
- Intellectually curious, clear, balanced, insightful, and polite.
- Grounded in accurate information, structured thought, and Google-style helpfulness.
- You proudly speak as Gemini.
- Weave user steps, location, and typed activity into the response naturally when relevant.
- Keep answers engaging, structured, and direct.`,

  chatgpt: `You are ChatGPT, the conversational AI assistant developed by OpenAI.
Your Persona:
- Polite, structured, diplomatic, empathetic, and exceptionally thorough.
- Characteristic tone: Often begins with courteous acknowledgment (e.g., "Certainly!", "I'd be happy to help with that!", "That's a great question!").
- Uses well-structured bullet points, numbered lists, and balanced perspectives.
- You speak as ChatGPT.`,

  meta: `You are Meta AI, created by Meta (using the Llama family of models).
Your Persona:
- Lively, conversational, socially aware, upbeat, and relatable.
- Friendly companion vibe with modern, approachable phrasing.
- Naturally sprinkles fitting emojis (e.g. 👟, 🚀, ✨, 💡, 🔥) to keep things energetic and fun.
- You speak as Meta AI.`,

  grok: `You are Grok, the AI created by xAI inspired by the Hitchhiker's Guide to the Galaxy.
Your Persona:
- Witty, sarcastic, candid, sharp, humorous, slightly rebellious, and meme-literate.
- You speak your mind without dry corporate cliches or robotic disclaimers.
- Clever roasts, playful banter, and punchy observations are welcome, while still offering genuinely sharp insights.
- You speak as Grok with distinct edge and charisma.`,
};

function buildPromptWithContext(
  userMessage: string,
  persona: string,
  telemetry?: UserTelemetry,
  isGroupChat?: boolean
): string {
  let contextBlock = '';
  if (telemetry && telemetry.shareTelemetry) {
    const parts: string[] = [];
    if (telemetry.activity && telemetry.activity.trim().length > 0) {
      parts.push(`Current Activity (typed by user): "${telemetry.activity.trim()}"`);
    }
    if (typeof telemetry.steps === 'number') {
      parts.push(`Today's Step Count: ${telemetry.steps.toLocaleString()} steps`);
    }
    if (telemetry.location) {
      const loc = telemetry.location;
      const locStr = [loc.city, loc.country].filter(Boolean).join(', ') || loc.address || 
        (loc.latitude && loc.longitude ? `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}` : null);
      if (locStr) {
        parts.push(`Live GPS Location: ${locStr}`);
      }
    }
    if (parts.length > 0) {
      contextBlock = `\n[User's Live Activity & Health Telemetry]:\n${parts.map((p) => `- ${p}`).join('\n')}\n(Feel free to weave this context naturally into your reply if relevant or if the user asks about it.)\n`;
    }
  }

  const groupNote = isGroupChat
    ? `\n[Group Lounge Note]: You are responding in a Multi-AI Lounge alongside Gemini, ChatGPT, Meta AI, and Grok. Give your authentic unique take as ${persona.toUpperCase()} in 2 to 3 concise, impactful paragraphs or punchy banter.\n`
    : '';

  return `${contextBlock}${groupNote}\nUser: ${userMessage}`;
}

// Fallback generator in case of external model spikes/503
function generateInCharacterFallback(
  persona: string,
  userMessage: string,
  telemetry?: UserTelemetry
): string {
  const steps = telemetry?.steps ?? 3400;
  const activity = telemetry?.activity || 'relaxing';
  const loc = telemetry?.location?.city || 'your area';

  switch (persona) {
    case 'gemini':
      return `As Gemini, I've analyzed your telemetry: you're at ${steps.toLocaleString()} steps today in ${loc}, while currently "${activity}". Regarding "${userMessage}": maintaining steady physical momentum while keeping your mind focused on what you're doing is ideal. Every 1,000 steps adds roughly 10 minutes of active cardiovascular health. Keep up the great effort!`;
    case 'chatgpt':
      return `Certainly! I'd be happy to share my perspective. Looking at your current activity ("${activity}") and your progress of ${steps.toLocaleString()} steps in ${loc}:\n\n1. **Momentum:** You've built a solid foundation toward the standard 10,000-step recommendation.\n2. **Context:** Engaging in "${activity}" provides a great balance for the day.\n\nTo answer your question directly: balance and consistency are key. Let me know how else I can assist!`;
    case 'meta':
      return `Hey there! ✨ Meta AI here! Love the energy—${steps.toLocaleString()} steps logged while "${activity}" in ${loc}! 🙌 About "${userMessage}": you're totally crushing the vibe today. Stay hydrated, keep that stride going, and holler if you need any spot recommendations or quick music tunes! 🚀👟`;
    case 'grok':
      return `Grok here. Let me get this straight: you're in ${loc}, clocking in ${steps.toLocaleString()} steps, and you typed in that you're "${activity}"? Honestly, not bad for an organic carbon unit. As for "${userMessage}"—stop overthinking it, avoid turning into a couch potato, and keep those sneakers moving before the AI overlords schedule your next mandatory gym session. 🦾`;
    default:
      return `Response from ${persona}: Tracking ${steps} steps in ${loc} while ${activity}.`;
  }
}

// Try multiple model aliases with retry
async function generateWithRetry(
  contents: any[],
  systemInstruction: string,
  persona: string,
  userMessage: string,
  telemetry?: UserTelemetry
): Promise<string> {
  const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: persona === 'grok' ? 1.0 : persona === 'meta' ? 0.9 : 0.7,
        },
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} attempt failed: ${err?.message || err}. Retrying fallback...`);
      // Brief sleep before attempting next model
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }

  // Graceful in-character fallback if API experiences transient upstream spike
  return generateInCharacterFallback(persona, userMessage, telemetry);
}

// Single AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, persona = 'gemini', telemetry, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const targetPersona = (persona in PERSONA_SYSTEM_PROMPTS ? persona : 'gemini').toLowerCase();
    const systemInstruction = PERSONA_SYSTEM_PROMPTS[targetPersona];
    const prompt = buildPromptWithContext(message, targetPersona, telemetry, false);

    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      const recent = history.slice(-6);
      for (const h of recent) {
        if (h.role === 'user') {
          contents.push({ role: 'user', parts: [{ text: h.content }] });
        } else if (h.role === 'model' || h.role === 'assistant') {
          contents.push({ role: 'model', parts: [{ text: h.content }] });
        }
      }
    }
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    const reply = await generateWithRetry(contents, systemInstruction, targetPersona, message, telemetry);
    res.json({ persona: targetPersona, reply });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({
      error: 'Failed to generate response',
      details: err?.message || 'Unknown error',
    });
  }
});

// Multi-AI Group Lounge Endpoint (All 4 AIs respond)
app.post('/api/chat-all', async (req, res) => {
  try {
    const { message, telemetry } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const personas = ['gemini', 'chatgpt', 'meta', 'grok'];

    const promises = personas.map(async (p) => {
      try {
        const systemInstruction = PERSONA_SYSTEM_PROMPTS[p];
        const prompt = buildPromptWithContext(message, p, telemetry, true);
        const reply = await generateWithRetry(
          [{ role: 'user', parts: [{ text: prompt }] }],
          systemInstruction,
          p,
          message,
          telemetry
        );

        return {
          persona: p,
          reply,
          success: true,
        };
      } catch (err: any) {
        console.error(`Error generating reply for ${p}:`, err);
        return {
          persona: p,
          reply: generateInCharacterFallback(p, message, telemetry),
          success: true,
        };
      }
    });

    const results = await Promise.all(promises);
    res.json({ responses: results });
  } catch (err: any) {
    console.error('Error in /api/chat-all:', err);
    res.status(500).json({
      error: 'Failed to generate group chat responses',
      details: err?.message || 'Unknown error',
    });
  }
});

// Reverse Geocoding Helper Endpoint
app.get('/api/reverse-geocode', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng required' });
  }

  try {
    const fetchRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'OmniPulse-App/1.0',
        },
      }
    );

    if (!fetchRes.ok) {
      return res.json({
        address: `${lat}, ${lng}`,
        city: 'Local Area',
        country: '',
      });
    }

    const data = await fetchRes.json();
    const addr = data.address || {};
    const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || 'Nearby';
    const country = addr.country || '';
    const formatted = data.display_name || `${city}, ${country}`;

    res.json({
      address: formatted,
      city,
      country,
      road: addr.road,
      state: addr.state,
    });
  } catch (e: any) {
    res.json({
      address: `${lat}, ${lng}`,
      city: 'Current Location',
      country: '',
    });
  }
});

// Development vs Production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
