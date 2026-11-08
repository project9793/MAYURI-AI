import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  StopCircle, 
  Globe, 
  RotateCcw,
  Sparkles,
  Sliders
} from 'lucide-react';
import { AiOrb } from '../components/AiOrb';
import { WaveformVisualizer } from '../components/WaveformVisualizer';
import { AssistantState, ChatMessage, UserPreferences } from '../types';

interface VoiceChatScreenProps {
  state: AssistantState;
  transcript: string;
  lastSpokenText: string;
  conversationHistory: ChatMessage[];
  onMicClick: () => void;
  onStopSpeaking: () => void;
  onBack: () => void;
  userPreferences: UserPreferences;
  onUpdatePreferences: (pref: Partial<UserPreferences>) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const VoiceChatScreen: React.FC<VoiceChatScreenProps> = ({
  state,
  transcript,
  lastSpokenText,
  conversationHistory,
  onMicClick,
  onStopSpeaking,
  onBack,
  userPreferences,
  onUpdatePreferences,
  isMuted,
  onToggleMute,
}) => {
  const [showVoiceSliders, setShowVoiceSliders] = useState(false);

  const voiceMessages = conversationHistory.slice(-6);

  const languages: ('Hinglish' | 'Hindi' | 'English')[] = ['Hinglish', 'Hindi', 'English'];

  return (
    <div className="w-full flex-1 flex flex-col justify-between p-4 overflow-hidden relative bg-gradient-to-b from-[#0a0718] via-[#06040f] to-[#030208]">
      {/* Glow backdrop */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/20 text-purple-300 hover:text-white transition-all flex items-center gap-1.5 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Language selector buttons */}
        <div className="flex items-center gap-1 bg-[#120e26] border border-purple-500/20 p-1 rounded-xl">
          <Globe className="w-3.5 h-3.5 text-purple-400 ml-1.5" />
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => onUpdatePreferences({ language: lang })}
              className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all ${
                userPreferences.language === lang
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Controls: Mute & Voice Sliders */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowVoiceSliders(!showVoiceSliders)}
            className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/20 text-purple-300 hover:text-white transition-all"
            title="Voice Speed & Pitch"
          >
            <Sliders className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl border transition-all ${
              isMuted ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-purple-950/40 border-purple-500/20 text-purple-300'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick Sliders Dropdown if toggled */}
      {showVoiceSliders && (
        <div className="z-20 mt-2 p-3 rounded-2xl glass-panel space-y-3 animate-fade-in border border-purple-500/30">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Speaking Speed ({userPreferences.voiceRate}x)</span>
            <input
              type="range"
              min="0.7"
              max="1.5"
              step="0.05"
              value={userPreferences.voiceRate}
              onChange={(e) => onUpdatePreferences({ voiceRate: parseFloat(e.target.value) })}
              className="w-32 accent-purple-500"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Sweet Voice Pitch ({userPreferences.voicePitch})</span>
            <input
              type="range"
              min="0.9"
              max="1.4"
              step="0.05"
              value={userPreferences.voicePitch}
              onChange={(e) => onUpdatePreferences({ voicePitch: parseFloat(e.target.value) })}
              className="w-32 accent-pink-500"
            />
          </div>
        </div>
      )}

      {/* Center Interactive Orb with high presence */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto z-10">
        <AiOrb
          state={state}
          size={230}
          onClick={state === 'speaking' ? onStopSpeaking : onMicClick}
        />

        <div className="mt-3">
          <WaveformVisualizer state={state} barCount={32} />
        </div>

        {/* Live Status Tag */}
        <div className="mt-2 text-center">
          {state === 'listening' && (
            <p className="text-sm font-semibold text-cyan-300 animate-pulse">
              Sun rahi hoon... &quot;{transcript || 'Aapki aawaz sunne ke liye taiyar'}&quot;
            </p>
          )}
          {state === 'thinking' && (
            <p className="text-sm font-semibold text-purple-300 animate-pulse">
              Mayuri soch rahi hai...
            </p>
          )}
          {state === 'speaking' && (
            <p className="text-sm font-semibold text-pink-300">
              Mayuri bol rahi hai... (Interrupt karne ke liye tap karein)
            </p>
          )}
          {state === 'idle' && (
            <p className="text-xs text-slate-400">
              Mic button daba kar boliye: &quot;Rahul ko call lagao&quot; ya &quot;Flashlight on karo&quot;
            </p>
          )}
        </div>
      </div>

      {/* Floating Transcript / Recent Dialogue Stream */}
      <div className="w-full max-w-md mx-auto my-2 z-10 max-h-36 overflow-y-auto space-y-1.5 px-2">
        {voiceMessages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2.5 rounded-2xl text-xs backdrop-blur-md ${
              msg.sender === 'user'
                ? 'bg-purple-950/40 text-purple-200 ml-auto max-w-[85%] border border-purple-800/30'
                : 'bg-[#141029]/80 text-slate-200 mr-auto max-w-[90%] border border-purple-500/20'
            }`}
          >
            <span className="font-semibold text-[10px] block opacity-70 mb-0.5">
              {msg.sender === 'user' ? 'Aap' : 'Mayuri'}
            </span>
            <p className="leading-relaxed">{msg.text}</p>
          </div>
        ))}
      </div>

      {/* Bottom Voice Controls */}
      <div className="pt-2 z-10">
        <div className="flex items-center justify-center gap-6 max-w-xs mx-auto">
          {/* Auto-listen toggle */}
          <button
            onClick={() => onUpdatePreferences({ autoListen: !userPreferences.autoListen })}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              userPreferences.autoListen ? 'text-cyan-400' : 'text-slate-500'
            }`}
          >
            <div className={`p-2.5 rounded-full border ${userPreferences.autoListen ? 'bg-cyan-500/20 border-cyan-500/40' : 'bg-slate-900 border-slate-800'}`}>
              <RotateCcw className="w-4 h-4" />
            </div>
            <span>Auto-Listen {userPreferences.autoListen ? 'ON' : 'OFF'}</span>
          </button>

          {/* Large Hero Mic / Stop Button */}
          <button
            onClick={state === 'speaking' ? onStopSpeaking : onMicClick}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-2xl active:scale-95 ${
              state === 'listening'
                ? 'bg-gradient-to-tr from-cyan-500 to-teal-400 shadow-cyan-500/50 ring-4 ring-cyan-500/30 animate-pulse'
                : state === 'speaking'
                ? 'bg-gradient-to-tr from-pink-600 to-rose-500 shadow-pink-500/50 ring-4 ring-pink-500/30'
                : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 shadow-purple-950/80 hover:scale-105'
            }`}
          >
            {state === 'speaking' ? (
              <StopCircle className="w-7 h-7" />
            ) : state === 'listening' ? (
              <Mic className="w-7 h-7 animate-bounce" />
            ) : (
              <Mic className="w-7 h-7" />
            )}
          </button>

          {/* Interrupt / Stop */}
          <button
            onClick={onStopSpeaking}
            disabled={state !== 'speaking'}
            className="flex flex-col items-center gap-1 text-[10px] font-medium text-slate-500 disabled:opacity-40 hover:text-pink-400 transition-colors"
          >
            <div className="p-2.5 rounded-full bg-slate-900 border border-slate-800">
              <StopCircle className="w-4 h-4" />
            </div>
            <span>Interrupt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
