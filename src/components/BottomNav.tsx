import React from 'react';
import { Home, Mic, MessageSquare, Code2, Grid } from 'lucide-react';
import { ScreenType } from '../types';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const tabs = [
    { id: 'home' as ScreenType, label: 'Home', icon: Home },
    { id: 'voice-chat' as ScreenType, label: 'Voice', icon: Mic, isVoice: true },
    { id: 'ai-chat' as ScreenType, label: 'Chat', icon: MessageSquare },
    { id: 'code-studio' as ScreenType, label: 'Code', icon: Code2 },
    { id: 'app-control' as ScreenType, label: 'Controls', icon: Grid },
  ];

  return (
    <nav className="w-full shrink-0 border-t border-purple-900/25 bg-[#090715]/95 backdrop-blur-xl px-2 py-1 select-none z-30">
      <div className="grid grid-cols-5 items-center max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;

          if (tab.isVoice) {
            return (
              <div key={tab.id} className="flex flex-col items-center justify-center">
                <button
                  onClick={() => onNavigate(tab.id)}
                  aria-label="Open Voice Chat"
                  className={`-mt-5 relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    isActive
                      ? 'bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 text-white shadow-purple-500/40 scale-105'
                      : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-purple-100 hover:scale-105 shadow-purple-950/60'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="absolute inset-0 rounded-full border border-white/20" />
                </button>
                <span className={`text-[10px] font-medium tracking-tight mt-1 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                  {tab.label}
                </span>
              </div>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 min-h-[48px] rounded-xl transition-colors ${
                isActive ? 'text-purple-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-purple-400' : ''}`} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400" />
                )}
              </div>
              <span className={`text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap ${isActive ? 'font-semibold text-purple-300' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
