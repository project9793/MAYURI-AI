import React, { useState } from 'react';
import { 
  Mic, 
  Send, 
  Sparkles, 
  Phone, 
  Code2, 
  MessageSquare, 
  Grid, 
  Share2, 
  Sliders, 
  History, 
  Flame,
  Volume2,
  StopCircle,
  Play
} from 'lucide-react';
import { AiOrb } from '../components/AiOrb';
import { WaveformVisualizer } from '../components/WaveformVisualizer';
import { AssistantState, ScreenType, UserPreferences } from '../types';

interface HomeScreenProps {
  state: AssistantState;
  onMicClick: () => void;
  onSendText: (text: string) => void;
  onNavigate: (screen: ScreenType) => void;
  lastSpokenText: string;
  transcript: string;
  userPreferences: UserPreferences;
  onStopSpeaking: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  state,
  onMicClick,
  onSendText,
  onNavigate,
  lastSpokenText,
  transcript,
  userPreferences,
  onStopSpeaking,
}) => {
  const [inputText, setInputText] = useState('');

  const quickActions = [
    { id: 'voice-chat' as ScreenType, label: 'Voice Assistant', desc: 'Realtime Talk', icon: Mic, color: 'from-pink-500 to-rose-500' },
    { id: 'ai-chat' as ScreenType, label: 'AI Chat', desc: 'Q&A & Brainstorm', icon: MessageSquare, color: 'from-purple-500 to-indigo-500' },
    { id: 'code-studio' as ScreenType, label: 'Generate Code', desc: 'Kotlin, Python, Web', icon: Code2, color: 'from-blue-500 to-cyan-500' },
    { id: 'app-control' as ScreenType, label: 'Open Apps & Phone', desc: 'Flash, Battery, Tools', icon: Grid, color: 'from-emerald-500 to-teal-500' },
    { id: 'app-control' as ScreenType, label: 'Make a Call', desc: 'Voice Dialer', icon: Phone, color: 'from-amber-500 to-orange-500' },
    { id: 'social-assistant' as ScreenType, label: 'Social Media', desc: 'Reels, YouTube, WA', icon: Share2, color: 'from-fuchsia-500 to-pink-500' },
    { id: 'api-settings' as ScreenType, label: 'API Settings', desc: 'Keys & Gemini Model', icon: Sliders, color: 'from-indigo-500 to-purple-600' },
    { id: 'chat-history' as ScreenType, label: 'History', desc: 'Past Conversations', icon: History, color: 'from-slate-600 to-slate-800' },
  ];

  const suggestionPrompts = [
    'Mayuri YouTube kholo',
    'Rahul ko call lagao',
    'Flashlight on karo',
    'Ek mazedaar joke sunao',
    'Battery kitni bachi hai?',
    'Instagram Reel ke liye viral caption banao',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendText(inputText.trim());
      setInputText('');
    }
  };

  const getStatusText = () => {
    switch (state) {
      case 'listening':
        return 'Sun rahi hoon... Boliye';
      case 'thinking':
        return 'Soch rahi hoon...';
      case 'speaking':
        return 'Mayuri bol rahi hai...';
      default:
        return 'Aapke aadesh ka intezar hai';
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between p-4 overflow-y-auto">
      {/* Top Greeting */}
      <div className="text-center pt-2 pb-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/20 text-purple-300 text-xs font-medium mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Namaste {userPreferences.userName || 'Dost'} ji!</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">
          Hello! Main Mayuri hoon.
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {getStatusText()}
        </p>
      </div>

      {/* Center AI Orb & Visualizer */}
      <div className="flex flex-col items-center justify-center my-auto py-2">
        <AiOrb
          state={state}
          size={190}
          onClick={state === 'speaking' ? onStopSpeaking : onMicClick}
        />

        {/* Waveform */}
        <div className="mt-1">
          <WaveformVisualizer state={state} />
        </div>

        {/* Live Subtitle Transcript / Response */}
        <div className="w-full max-w-md px-3 mt-1 min-h-[50px] flex items-center justify-center text-center">
          {state === 'listening' && (
            <p className="text-xs text-cyan-300 font-medium italic animate-pulse">
              &quot;{transcript || 'Boliye... sun rahi hoon'}&quot;
            </p>
          )}

          {state === 'thinking' && (
            <p className="text-xs text-purple-300 font-medium animate-pulse">
              Processing command with Gemini AI...
            </p>
          )}

          {state !== 'listening' && state !== 'thinking' && lastSpokenText && (
            <div className="relative group bg-[#110e26]/80 border border-purple-500/20 rounded-2xl px-4 py-2 text-xs text-slate-200 shadow-md">
              <span className="text-purple-300 font-semibold">Mayuri: </span>
              <span>{lastSpokenText}</span>
              {state === 'speaking' && (
                <button
                  onClick={onStopSpeaking}
                  className="ml-2 inline-flex items-center gap-1 text-[10px] text-pink-400 hover:text-pink-300 bg-pink-950/50 px-2 py-0.5 rounded-full"
                >
                  <StopCircle className="w-3 h-3" /> Stop
                </button>
              )}
            </div>
          )}

          {state === 'idle' && !lastSpokenText && (
            <p className="text-[11px] text-slate-500">
              Tap the orb or mic button below to talk naturally without typing
            </p>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto w-full max-w-md py-2 px-1 no-scrollbar">
          {suggestionPrompts.slice(0, 4).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSendText(prompt)}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 text-purple-200 border border-purple-800/25 transition-all shrink-0 active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Grid (8 Cards) */}
      <div className="my-2">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-pink-400" /> Quick Actions
          </span>
          <span className="text-[10px] text-purple-400 font-medium">8 Modules</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={() => onNavigate(action.id)}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl glass-card hover:border-purple-500/40 transition-all text-center group active:scale-95"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${action.color} flex items-center justify-center text-white mb-1.5 shadow-md group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-slate-200 line-clamp-1">
                  {action.label}
                </span>
                <span className="text-[9px] text-slate-400 line-clamp-1">
                  {action.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Microphone & Text Input Bar */}
      <div className="pt-2">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-lg mx-auto">
          {/* Main Voice Activation Button */}
          <button
            type="button"
            onClick={state === 'speaking' ? onStopSpeaking : onMicClick}
            aria-label="Voice Activation"
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all shadow-lg shrink-0 ${
              state === 'listening'
                ? 'bg-gradient-to-tr from-cyan-500 to-teal-400 shadow-cyan-500/40 ring-4 ring-cyan-500/30 animate-pulse'
                : state === 'speaking'
                ? 'bg-gradient-to-tr from-pink-600 to-rose-500 shadow-pink-500/40 ring-2 ring-pink-500/30'
                : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 hover:scale-105 shadow-purple-950/60'
            }`}
          >
            {state === 'speaking' ? (
              <StopCircle className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Text Input Field */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Mayuri se kuch bhi poochein ya command dein..."
              className="w-full bg-[#110e24] border border-purple-500/25 rounded-2xl pl-4 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-xl text-purple-400 hover:text-white disabled:opacity-40 disabled:hover:text-purple-400 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
