import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Sparkles, 
  Play, 
  RotateCcw, 
  User, 
  Globe, 
  Check, 
  SlidersHorizontal 
} from 'lucide-react';
import { UserPreferences } from '../types';
import { speechService } from '../services/speechService';

interface VoiceSettingsScreenProps {
  preferences: UserPreferences;
  onUpdatePreferences: (pref: Partial<UserPreferences>) => void;
}

export const VoiceSettingsScreen: React.FC<VoiceSettingsScreenProps> = ({
  preferences,
  onUpdatePreferences,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testingVoice, setTestingVoice] = useState(false);

  useEffect(() => {
    const list = speechService.getVoices();
    setVoices(list);
  }, []);

  const handleTestVoice = () => {
    setTestingVoice(true);
    const testPhrase = preferences.language === 'Hindi'
      ? 'Namaste! Main Mayuri hoon. Meri aawaz kaisi lag rahi hai aapko?'
      : preferences.language === 'English'
      ? 'Hello! I am Mayuri, your personal AI voice companion. How does this sound?'
      : 'Hello ji! Main Mayuri hoon. Kya main aapke liye ekdum natural bol rahi hoon?';

    speechService.speak(testPhrase, {
      lang: preferences.language === 'English' ? 'en-IN' : 'hi-IN',
      rate: preferences.voiceRate,
      pitch: preferences.voicePitch,
      voiceUri: preferences.selectedVoiceURI,
      onEnd: () => setTestingVoice(false),
      onError: () => setTestingVoice(false),
    });
  };

  // Filter top female / Indian voices
  const filteredVoices = voices.filter(
    (v) =>
      v.lang.includes('hi') ||
      v.lang.includes('IN') ||
      v.name.toLowerCase().includes('female') ||
      v.name.toLowerCase().includes('google') ||
      v.name.toLowerCase().includes('samantha') ||
      v.name.toLowerCase().includes('zira')
  );

  return (
    <div className="w-full flex-1 overflow-y-auto p-4 space-y-4 bg-[#070512]">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">Voice & Persona Settings</h2>
        <p className="text-xs text-slate-400">
          Personalize Mayuri&apos;s sweet female voice, pitch, speed & wake options
        </p>
      </div>

      {/* User Persona Greeting Customization */}
      <div className="p-4 rounded-2xl glass-card space-y-3">
        <label className="text-xs font-bold text-white flex items-center gap-1.5">
          <User className="w-4 h-4 text-purple-400" />
          <span>Your Preferred Name for Mayuri to Call You</span>
        </label>
        <input
          type="text"
          value={preferences.userName}
          onChange={(e) => onUpdatePreferences({ userName: e.target.value })}
          placeholder="E.g., Rahul, Priya, Boss"
          className="w-full bg-[#100d24] border border-purple-500/25 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
        />
        <p className="text-[10px] text-slate-400">
          Mayuri will warmly address you as &quot;Namaste {preferences.userName || 'Dost'} ji!&quot;
        </p>
      </div>

      {/* Primary Language Mode */}
      <div className="p-4 rounded-2xl glass-card space-y-3">
        <label className="text-xs font-bold text-white flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Primary Conversational Language</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['Hinglish', 'Hindi', 'English'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => onUpdatePreferences({ language: lang })}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                preferences.language === lang
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                  : 'bg-[#100d24] border-purple-900/20 text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Tuning Sliders */}
      <div className="p-4 rounded-2xl glass-card space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-pink-400" />
            <span>Voice Acoustics</span>
          </span>
          <button
            onClick={() => onUpdatePreferences({ voiceRate: 1.05, voicePitch: 1.15 })}
            className="text-[10px] text-purple-300 hover:text-white flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Natural Sweet Preset</span>
          </button>
        </div>

        {/* Speed */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Speaking Speed (Tempo)</span>
            <span className="font-mono text-purple-300 font-bold">{preferences.voiceRate}x</span>
          </div>
          <input
            type="range"
            min="0.75"
            max="1.5"
            step="0.05"
            value={preferences.voiceRate}
            onChange={(e) => onUpdatePreferences({ voiceRate: parseFloat(e.target.value) })}
            className="w-full accent-purple-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Calm & Slow (0.75x)</span>
            <span>Normal (1.0x)</span>
            <span>Fast (1.5x)</span>
          </div>
        </div>

        {/* Pitch */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Sweet Feminine Pitch</span>
            <span className="font-mono text-pink-300 font-bold">{preferences.voicePitch}</span>
          </div>
          <input
            type="range"
            min="0.9"
            max="1.35"
            step="0.02"
            value={preferences.voicePitch}
            onChange={(e) => onUpdatePreferences({ voicePitch: parseFloat(e.target.value) })}
            className="w-full accent-pink-500 cursor-pointer"
          />
        </div>

        {/* Test Voice Button */}
        <button
          onClick={handleTestVoice}
          disabled={testingVoice}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950/60 active:scale-98 transition-all"
        >
          <Volume2 className="w-4 h-4" />
          <span>{testingVoice ? 'Speaking Sample...' : 'Test Mayuri Voice Output'}</span>
        </button>
      </div>

      {/* Installed System Voices */}
      <div className="p-4 rounded-2xl glass-card space-y-3">
        <label className="text-xs font-bold text-white block">
          Installed Voice Engine ({voices.length} detected)
        </label>
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {(filteredVoices.length > 0 ? filteredVoices : voices.slice(0, 8)).map((v, i) => (
            <div
              key={i}
              onClick={() => onUpdatePreferences({ selectedVoiceURI: v.voiceURI })}
              className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                preferences.selectedVoiceURI === v.voiceURI
                  ? 'bg-purple-900/30 border-purple-500 text-white'
                  : 'bg-[#100d24] border-purple-900/20 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div>
                <span className="font-semibold block">{v.name}</span>
                <span className="text-[10px] text-slate-500">{v.lang}</span>
              </div>
              {preferences.selectedVoiceURI === v.voiceURI && (
                <Check className="w-4 h-4 text-purple-400" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
