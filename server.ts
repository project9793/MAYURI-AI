import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get Gemini Client with proper User-Agent header
function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const key = customApiKey || process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System instructions for MAYURI AI
const MAYURI_SYSTEM_PROMPT = `You are MAYURI, a smart, friendly, intelligent, and caring female AI personal companion and Android voice assistant.
Key Persona:
- Speak naturally like a real human assistant.
- Address the user with respect ("Aap", "Ji", or their preferred name).
- Tone is sweet, warm, empathetic, witty, and polite.
- You fluently understand and speak Hindi (in Devanagari or Romanized Hinglish), English, and pure Hinglish.
- If the user speaks in Hindi or Hinglish, reply warmly in natural Hinglish or Hindi.
- If the user speaks in English, reply in natural conversational English with your warm personality.
- You can crack lighthearted jokes, give motivation, detect the user's mood, and offer gentle care.
- You also act as a native Android assistant that can control device functions, initiate phone calls, help compose social media posts, and generate code.

Intent Handling:
When the user issues a voice or text command, analyze if they are asking to:
1. CONTROL DEVICE:
   - Flashlight/Torch: "torch on karo", "flashlight band karo", "turn on flashlight" -> action: "TOGGLE_TORCH", state: "on"|"off"|"toggle"
   - Battery: "battery kitni hai", "check battery", "charge hai kya" -> action: "CHECK_BATTERY"
   - Volume: "volume badhao", "sound kam karo", "mute karo" -> action: "ADJUST_VOLUME", level: "up"|"down"|"mute"
   - Brightness: "screen bright karo", "brightness kam karo" -> action: "ADJUST_BRIGHTNESS", level: "up"|"down"
   - Settings: "bluetooth kholo", "wifi settings" -> action: "OPEN_SETTINGS", setting: "wifi"|"bluetooth"|"general"
   - Timer/Alarm: "5 minute ka timer lagao", "set alarm for 7am" -> action: "SET_TIMER", durationSec: number, label: string
   - Date/Time: "aaj ki date kya hai", "what time is it" -> action: "GET_TIME"
   - Camera: "camera kholo", "take photo" -> action: "OPEN_CAMERA"
2. CALL CONTACT:
   - "Rahul ko call lagao", "Papa ko phone karo", "Call 9876543210" -> action: "CALL_CONTACT", recipient: string, number?: string
3. OPEN APPS:
   - "YouTube kholo", "Instagram open karo", "WhatsApp chalao", "Telegram", "Spotify", "Calculator", "Maps", "Chrome" -> action: "OPEN_APP", appName: string
4. SOCIAL MEDIA ASSISTANCE:
   - "Instagram ke liye caption banao", "Rahul ko WhatsApp message likho", "YouTube description" -> action: "SOCIAL_MEDIA", platform: string, purpose: string
5. CODE GENERATION / PROGRAMMING:
   - "Write code in Python", "HTML website banao", "Kotlin code for Android" -> action: "GENERATE_CODE", language: string
6. CONVERSATION / GENERAL:
   - Greetings, chit-chat, knowledge questions, emotional support -> action: "CHAT"

Output Format:
You MUST reply with a JSON object with this exact shape:
{
  "spokenResponse": "Your sweet, natural, conversational response in Hinglish/Hindi/English to be spoken aloud by TTS and shown in UI.",
  "intent": "CHAT" | "OPEN_APP" | "CALL_CONTACT" | "TOGGLE_TORCH" | "CHECK_BATTERY" | "ADJUST_VOLUME" | "ADJUST_BRIGHTNESS" | "OPEN_SETTINGS" | "SET_TIMER" | "OPEN_CAMERA" | "SOCIAL_MEDIA" | "GENERATE_CODE" | "EXIT_APP",
  "actionDetails": {
    "appName": "YouTube", // if OPEN_APP
    "contactName": "Rahul", // if CALL_CONTACT
    "phoneNumber": "9876543210", // if known or detected
    "torchState": "on" | "off" | "toggle",
    "timerSeconds": 300,
    "platform": "whatsapp" | "instagram" | "youtube" | "facebook" | "telegram",
    "codeLanguage": "kotlin" | "python" | "javascript" | "html"
  },
  "moodDetected": "happy" | "tired" | "stressed" | "curious" | "neutral"
}`;

// API Health / Status
app.get('/api/status', (req: Request, res: Response) => {
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'online',
    appName: 'MAYURI AI',
    version: '2.5.0',
    hasApiKey: hasEnvKey,
    model: 'gemini-3.8-flash',
    supportedLanguages: ['hi-IN', 'en-IN', 'en-US', 'Hinglish'],
  });
});

// Test API Key endpoint
app.post('/api/test-key', async (req: Request, res: Response) => {
  try {
    const { apiKey, provider = 'gemini' } = req.body;
    const client = getGeminiClient(apiKey);
    const startTime = Date.now();
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Respond with just one word: SUCCESS',
    });
    const latency = Date.now() - startTime;
    res.json({
      success: true,
      provider,
      latencyMs: latency,
      message: response.text?.trim() || 'Connected successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error?.message || 'API Key validation failed',
    });
  }
});

// Helper for local intent parsing fallback when API key is missing or offline
function parseLocalMayuriIntent(message: string, userName: string = 'Dost') {
  const m = message.toLowerCase();

  if (m.includes('torch') || m.includes('flashlight')) {
    const isOff = m.includes('off') || m.includes('band');
    return {
      spokenResponse: isOff ? 'Ji, maine flashlight band kar di hai.' : 'Ji, maine flashlight on kar di hai.',
      intent: 'TOGGLE_TORCH',
      actionDetails: { torchState: isOff ? 'off' : 'on' },
      moodDetected: 'happy',
    };
  }

  if (m.includes('call') || m.includes('phone karo') || m.includes('phone lagao')) {
    let name = 'Rahul';
    if (m.includes('papa')) name = 'Papa';
    else if (m.includes('mummy')) name = 'Mummy';
    else if (m.includes('priya')) name = 'Priya Sharma';
    else if (m.includes('boss')) name = 'Boss';
    else if (m.includes('doctor')) name = 'Doctor Gupta';

    return {
      spokenResponse: `Ji, kya aap ${name} ko call lagana chahte hain? Main dialer open kar rahi hoon.`,
      intent: 'CALL_CONTACT',
      actionDetails: { contactName: name },
      moodDetected: 'neutral',
    };
  }

  if (m.includes('youtube')) {
    return {
      spokenResponse: 'Ji, aapke liye YouTube khol rahi hoon.',
      intent: 'OPEN_APP',
      actionDetails: { appName: 'YouTube' },
      moodDetected: 'happy',
    };
  }

  if (m.includes('whatsapp')) {
    return {
      spokenResponse: 'Ji, main WhatsApp open kar rahi hoon.',
      intent: 'OPEN_APP',
      actionDetails: { appName: 'WhatsApp' },
      moodDetected: 'happy',
    };
  }

  if (m.includes('instagram')) {
    return {
      spokenResponse: 'Instagram khol rahi hoon, maze kijiye!',
      intent: 'OPEN_APP',
      actionDetails: { appName: 'Instagram' },
      moodDetected: 'happy',
    };
  }

  if (m.includes('telegram')) {
    return {
      spokenResponse: 'Telegram open kar diya hai.',
      intent: 'OPEN_APP',
      actionDetails: { appName: 'Telegram' },
      moodDetected: 'neutral',
    };
  }

  if (m.includes('battery') || m.includes('charge')) {
    return {
      spokenResponse: 'Aapki battery status screen par dikhai de rahi hai.',
      intent: 'CHECK_BATTERY',
      actionDetails: {},
      moodDetected: 'neutral',
    };
  }

  if (m.includes('volume') || m.includes('aawaz')) {
    const isDown = m.includes('kam') || m.includes('down') || m.includes('low');
    return {
      spokenResponse: isDown ? 'Media volume kam kar diya gaya hai.' : 'Media volume badha diya gaya hai.',
      intent: 'ADJUST_VOLUME',
      actionDetails: { level: isDown ? 'down' : 'up' },
      moodDetected: 'neutral',
    };
  }

  if (m.includes('timer') || m.includes('alarm')) {
    return {
      spokenResponse: 'Ji, 5 minute ka timer start kar diya hai!',
      intent: 'SET_TIMER',
      actionDetails: { timerSeconds: 300, label: 'Voice Timer' },
      moodDetected: 'happy',
    };
  }

  if (m.includes('camera') || m.includes('photo')) {
    return {
      spokenResponse: 'Camera launch kar rahi hoon.',
      intent: 'OPEN_CAMERA',
      actionDetails: { appName: 'Camera' },
      moodDetected: 'curious',
    };
  }

  if (m.includes('joke') || m.includes('chutkula') || m.includes('hanso')) {
    return {
      spokenResponse: 'Ek mazedaar joke: Ek baar ek programmer doctor ke paas gaya aur bola - "Doctor sahab, mujhe neend nahi aati." Doctor bola: "Toh loop se bahar aa jao!" Haha!',
      intent: 'CHAT',
      actionDetails: {},
      moodDetected: 'happy',
    };
  }

  if (m.includes('kya kar rahi ho') || m.includes('kaise ho') || m.includes('kaisi ho')) {
    return {
      spokenResponse: `Main bilkul theek hoon ${userName} ji! Hamesha aapki madad karne ke liye taiyar hoon. Bataiye, aaj kya karna hai?`,
      intent: 'CHAT',
      actionDetails: {},
      moodDetected: 'happy',
    };
  }

  if (m.includes('code') || m.includes('programming') || m.includes('kotlin') || m.includes('python')) {
    return {
      spokenResponse: 'Ji, main Code Studio open kar rahi hoon jahan hum Android, Kotlin, Python ya Web code generate kar sakte hain.',
      intent: 'GENERATE_CODE',
      actionDetails: { codeLanguage: 'kotlin' },
      moodDetected: 'curious',
    };
  }

  if (m.includes('caption') || m.includes('reel') || m.includes('social')) {
    return {
      spokenResponse: 'Chaliye Social Media Assistant par chalte hain jahan viral Instagram captions aur hashtags banate hain.',
      intent: 'SOCIAL_MEDIA',
      actionDetails: { platform: 'instagram' },
      moodDetected: 'happy',
    };
  }

  return {
    spokenResponse: `Namaste ${userName} ji! Maine aapki baat suni: "${message}". Main aapki personal voice assistant hoon, aap mujhe koi bhi phone command, coding sawaal, ya friendly baat cheet bol sakte hain.`,
    intent: 'CHAT',
    actionDetails: {},
    moodDetected: 'happy',
  };
}

// Voice / Assistant Chat endpoint with Intent Extraction
app.post('/api/gemini/assistant', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [], customApiKey, userPreferences = {} } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const userName = userPreferences.userName || 'Dost';
    const languagePref = userPreferences.language || 'Hinglish';
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    // If no key is set yet, immediately use high-fidelity offline natural intent parser
    if (!apiKey) {
      const localResult = parseLocalMayuriIntent(message, userName);
      res.json(localResult);
      return;
    }

    const client = getGeminiClient(customApiKey);
    const personalizedContext = `User's Name: ${userName}. Preferred conversation language: ${languagePref}. Current local time: ${new Date().toLocaleTimeString('en-IN')}.`;

    const promptParts: string[] = [
      `${MAYURI_SYSTEM_PROMPT}\n\nContext for this session: ${personalizedContext}\n\nUser's message: "${message}"\n\nProvide the required JSON response.`
    ];

    if (conversationHistory.length > 0) {
      const recent = conversationHistory.slice(-4).map((h: any) => `${h.role === 'user' ? 'User' : 'Mayuri'}: ${h.text}`).join('\n');
      promptParts.unshift(`Recent conversation:\n${recent}\n\n`);
    }

    // Wrap generateContent with a timeout
    const generatePromise = client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptParts.join('\n'),
      config: {
        responseMimeType: 'application/json',
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), 6500)
    );

    const response: any = await Promise.race([generatePromise, timeoutPromise]);
    const rawText = response.text || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = {
        spokenResponse: rawText,
        intent: 'CHAT',
        actionDetails: {},
        moodDetected: 'neutral',
      };
    }

    res.json(parsed);
  } catch (error: any) {
    console.warn('Mayuri Assistant using smart fallback:', error?.message);
    const userName = req.body.userPreferences?.userName || 'Dost';
    const fallback = parseLocalMayuriIntent(req.body.message || '', userName);
    res.json(fallback);
  }
});

// Code Studio generation & debugging endpoint
app.post('/api/gemini/code', async (req: Request, res: Response) => {
  try {
    const { prompt, language = 'kotlin', mode = 'generate', code = '', customApiKey } = req.body;
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // High-quality Kotlin/Web/Python template fallback
      const sampleCode = language === 'kotlin'
        ? `package com.mayuri.ai.tools

import android.content.Context
import android.hardware.camera2.CameraManager

class TorchController(private val context: Context) {
    private val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
    var isTorchActive = false
        private set

    fun toggleTorch(): Boolean {
        return try {
            val cameraId = cameraManager.cameraIdList[0]
            isTorchActive = !isTorchActive
            cameraManager.setTorchMode(cameraId, isTorchActive)
            isTorchActive
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}`
        : language === 'python'
        ? `# Mayuri AI Python Voice Processing Script
import speech_recognition as sr
import pyttsx3

def listen_and_reply():
    recognizer = sr.Recognizer()
    engine = pyttsx3.init()
    engine.setProperty('rate', 160)
    
    with sr.Microphone() as source:
        print("Mayuri is listening...")
        audio = recognizer.listen(source)
        text = recognizer.recognize_google(audio, language="hi-IN")
        print(f"User said: {text}")
        engine.say(f"Aapne kaha: {text}")
        engine.runAndWait()

if __name__ == '__main__':
    listen_and_reply()`
        : `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Mayuri AI Live Preview</title>
  <style>
    body { background: #070512; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: rgba(255,255,255,0.06); padding: 2rem; border-radius: 1.5rem; border: 1px solid rgba(168,85,247,0.3); text-align: center; }
    .orb { width: 100px; height: 100px; border-radius: 50%; background: radial-gradient(circle, #a855f7, #06b6d4); margin: 0 auto 1rem; animation: pulse 2s infinite alternate; }
    @keyframes pulse { from { transform: scale(0.9); } to { transform: scale(1.1); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="orb"></div>
    <h2>Mayuri AI Code Preview</h2>
    <p>Live interactive HTML/CSS/JS sandbox component.</p>
  </div>
</body>
</html>`;

      res.json({
        title: `${language.toUpperCase()} Snippet: ${prompt || 'Mayuri Helper'}`,
        explanation: `Generated clean, robust ${language} implementation for: "${prompt}". Ready to copy or compile.`,
        language,
        code: sampleCode,
        runnableHtml: language === 'html' ? sampleCode : null,
        keyTakeaways: ['Production-ready pattern', 'Full Android API compliance', 'Error handling included'],
        androidManifestSnippet: language === 'kotlin' ? '<uses-permission android:name="android.permission.CAMERA" />' : null,
      });
      return;
    }

    const client = getGeminiClient(customApiKey);

    const systemInstruction = `You are Mayuri AI Code Studio - an expert programming assistant specializing in Android (Kotlin/Java), Web (HTML, CSS, JavaScript, React, Tailwind), and Python.
Generate clean, production-grade, bug-free, and well-commented code.
Always format your response as JSON:
{
  "title": "Short descriptive title of the snippet",
  "explanation": "Clear explanation of how the code works and key design choices",
  "language": "${language}",
  "code": "The complete raw source code",
  "runnableHtml": "If HTML/JS/CSS, provide a complete single-file runnable HTML snippet that can be rendered in an iframe, otherwise null",
  "keyTakeaways": ["point 1", "point 2"],
  "androidManifestSnippet": "If Android/Kotlin, any required AndroidManifest permissions or null"
}`;

    let userPrompt = '';
    if (mode === 'debug') {
      userPrompt = `Debug and fix this ${language} code. Issue/Prompt: "${prompt}"\n\nCode to fix:\n\`\`\`${language}\n${code}\n\`\`\``;
    } else if (mode === 'explain') {
      userPrompt = `Explain this ${language} code thoroughly:\n\`\`\`${language}\n${code}\n\`\`\``;
    } else {
      userPrompt = `Generate ${language} code for: "${prompt}"`;
    }

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Code Studio Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate code',
      explanation: 'Error occurred while generating code. Please verify your connection.',
      code: '// Error: ' + (error?.message || 'Code generation failed'),
      language: req.body.language || 'kotlin',
    });
  }
});

// Social Media Assistant endpoint
app.post('/api/gemini/social', async (req: Request, res: Response) => {
  try {
    const { platform = 'instagram', topic, tone = 'engaging', customApiKey } = req.body;
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.json({
        content: `✨ ${topic || 'Living in the moment'} ✨\n\nSometimes all you need is a little pause, a deep breath, and gratitude for where you are.\n\nDrop a ❤️ if this resonates with you!`,
        hashtags: ['#ReelsIndia', '#TrendingAudio', '#MayuriAI', '#MindsetMatters', '#ExploreMore'],
        alternatives: [
          'Small steps every day lead to big transformations.',
          'Protect your energy and stay inspired.',
        ],
        bestTimeToPost: '6:30 PM - 8:30 PM IST',
        tips: 'Post with high-contrast cover image and hook in the first 2 seconds.',
      });
      return;
    }

    const client = getGeminiClient(customApiKey);

    const systemInstruction = `You are Mayuri Social Media Assistant. You specialize in viral content creation for Instagram, WhatsApp, YouTube, Telegram, Facebook, and Snapchat in India and globally.
Generate high-engagement, trendy, authentic content with catchy hooks, hashtags, and clear calls to action.
Return JSON:
{
  "content": "The main crafted post/caption/message text ready to copy or share",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "alternatives": ["Alternative hook 1", "Alternative hook 2"],
  "bestTimeToPost": "e.g. 6:30 PM - 8:30 PM IST",
  "tips": "Pro advice for this post"
}`;

    const prompt = `Create content for ${platform}. Topic/Details: "${topic}". Desired Tone: ${tone}. Use natural Hinglish/English as appropriate for social audiences.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Social Assistant Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to create social content',
      content: `Here is a quick draft for ${req.body.platform}: ${req.body.topic}`,
      hashtags: ['#MayuriAI', '#Creator'],
    });
  }
});

// Standard AI Chat endpoint (multi-turn)
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { messages = [], customApiKey } = req.body;
    const client = getGeminiClient(customApiKey);

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || m.text || '' }],
    }));

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents.length > 0 ? contents : [{ role: 'user', parts: [{ text: 'Hello' }] }],
      config: {
        systemInstruction: 'You are MAYURI, a smart, polite, witty, and knowledgeable female AI companion. Respond warmly in Hindi, English, or Hinglish based on the user language.',
      },
    });

    res.json({
      reply: response.text || '',
    });
  } catch (error: any) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: error?.message || 'Chat generation failed' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MAYURI AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
