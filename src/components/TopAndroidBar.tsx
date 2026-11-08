import React, { useState, useEffect } from 'react';
import { Wifi, Battery, BatteryCharging, Volume2, VolumeX, Smartphone, Monitor, Sparkles, Settings } from 'lucide-react';
import { ScreenType } from '../types';

interface TopAndroidBarProps {
  batteryLevel: number;
  isCharging: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const TopAndroidBar: React.FC<TopAndroidBarProps> = ({
  batteryLevel,
  isCharging,
  isMuted,
  onToggleMute,
  isPhoneFrame,
  onTogglePhoneFrame,
  currentScreen,
  onNavigate,
}) => {
  const [timeStr, setTimeStr] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full shrink-0 select-none z-30">
      {/* Android System Status Bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1 text-xs text-slate-300 font-medium tracking-tight">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-100">{timeStr}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500/80" />
          <span className="text-[10px] text-purple-300 font-medium">MAYURI OS</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-semibold tracking-wider text-slate-400">5G</span>
          <Wifi className="w-3.5 h-3.5 text-slate-300" />
          <div className="flex items-center gap-1">
            <span className="text-[11px] tabular-nums font-semibold">{batteryLevel}%</span>
            {isCharging ? (
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
            ) : (
              <Battery className="w-4 h-4 text-slate-300" />
            )}
          </div>
        </div>
      </div>

      {/* App Bar / Navigation Header */}
      <header className="flex items-center justify-between px-5 py-2.5 border-b border-purple-900/20 backdrop-blur-md bg-[#07070e]/80">
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-sm shadow-purple-500/20">
            <div className="w-full h-full rounded-full bg-[#0d0b1a] flex items-center justify-center overflow-hidden">
              <Sparkles className="w-4 h-4 text-purple-300 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1">
                MAYURI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300 font-extrabold text-[11px] tracking-wider">AI</span>
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-normal">Personal Voice Companion</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Mute/Unmute */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Mayuri' : 'Mute Mayuri Voice'}
            className={`p-2 rounded-xl border transition-all text-xs flex items-center justify-center min-h-[36px] min-w-[36px] ${
              isMuted
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-purple-950/30 border-purple-500/20 text-purple-300 hover:bg-purple-900/30'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Desktop / Mobile Frame view switch for great usability */}
          <button
            onClick={onTogglePhoneFrame}
            title={isPhoneFrame ? 'Expand to Fullscreen View' : 'Switch to Android Phone View'}
            className="p-2 rounded-xl border border-purple-500/20 bg-purple-950/30 text-purple-300 hover:bg-purple-900/30 transition-all min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            {isPhoneFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          {/* Settings shortcut */}
          <button
            onClick={() => onNavigate(currentScreen === 'api-settings' ? 'home' : 'api-settings')}
            title="Settings"
            className="p-2 rounded-xl border border-purple-500/20 bg-purple-950/30 text-purple-300 hover:bg-purple-900/30 transition-all min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>
    </div>
  );
};
