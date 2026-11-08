import React, { useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { speechService } from '../services/speechService';

interface SplashScreenProps {
  onEnter: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  useEffect(() => {
    // Play subtle entry chime
    speechService.playChime('listen');
  }, []);

  const handleStart = () => {
    speechService.speak('Namaste! Main Mayuri hoon, aapki smart personal voice assistant. Main aapki kya madad kar sakti hoon?', {
      lang: 'hi-IN',
      rate: 1.05,
    });
    onEnter();
  };

  return (
    <div className="relative w-full h-full min-h-[640px] flex flex-col justify-between items-center p-6 text-center select-none overflow-hidden bg-gradient-to-b from-[#0c091f] via-[#070512] to-[#04030a]">
      {/* Ambient background glow & grid */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-tr from-purple-600/30 via-indigo-600/20 to-cyan-500/20 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1a3a10_1px,transparent_1px),linear-gradient(to_bottom,#1f1a3a10_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      {/* Top branding tag */}
      <div className="pt-6 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/20 text-purple-300 text-xs font-medium">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Gemini 3.8 Intelligence · Android OS</span>
        </div>
      </div>

      {/* Center Hero Avatar & Visual */}
      <div className="flex flex-col items-center z-10 my-auto">
        <div className="relative group cursor-pointer mb-6" onClick={handleStart}>
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-400 opacity-75 blur-md group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
          <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-purple-400/40 p-1 bg-[#0f0c24]">
            <img
              src="/src/assets/images/mayuri_avatar_1794160580067.jpg"
              alt="MAYURI AI Avatar"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="absolute -bottom-2 -right-1 bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-full border-2 border-[#070512] shadow-md">
            <Sparkles className="w-4 h-4 text-cyan-300" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          MAYURI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">AI</span>
        </h1>
        <p className="text-sm text-purple-200 font-medium max-w-xs mb-3">
          Smart Personal Voice Assistant & Android Companion
        </p>

        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          &quot;Namaste! Main Hindi, English aur Hinglish bolti hoon, phone controls chala sakti hoon, aur coding mein madad karti hoon.&quot;
        </p>

        <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local Storage · Zero-Data Leak · Privacy Protected</span>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="w-full max-w-xs pb-4 z-10 space-y-3">
        <button
          onClick={handleStart}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-950/60 active:scale-98 transition-all"
        >
          <span>Start Talking with Mayuri</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[10px] text-slate-500">
          Tap to launch voice assistant · v2.5.0
        </p>
      </div>
    </div>
  );
};
