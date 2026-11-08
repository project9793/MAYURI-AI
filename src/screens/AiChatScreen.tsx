import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  Volume2, 
  RotateCcw, 
  Paperclip, 
  Trash2, 
  Bot, 
  User, 
  Image as ImageIcon 
} from 'lucide-react';
import { ChatMessage, UserPreferences } from '../types';
import { speechService } from '../services/speechService';

interface AiChatScreenProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  isLoading: boolean;
  userPreferences: UserPreferences;
}

export const AiChatScreen: React.FC<AiChatScreenProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  isLoading,
  userPreferences,
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (speakingId === id) {
      speechService.stopSpeaking();
      setSpeakingId(null);
      return;
    }

    setSpeakingId(id);
    speechService.speak(text, {
      lang: userPreferences.language === 'English' ? 'en-IN' : 'hi-IN',
      rate: userPreferences.voiceRate,
      pitch: userPreferences.voicePitch,
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  const prompts = [
    'Ek achhi Hindi kavita sunao',
    'Explain how Black Holes work simply',
    'Mujhe motivated feel karao, aaj thak gaya hoon',
    'Tips to prepare for Android developer interview',
  ];

  return (
    <div className="w-full flex-1 flex flex-col justify-between overflow-hidden bg-[#070512]">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-purple-900/20 bg-[#0a081a]/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 p-[1px]">
            <div className="w-full h-full rounded-full bg-[#120e26] flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-purple-300" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Mayuri AI Chat</h3>
            <p className="text-[10px] text-slate-400">Gemini 3.8 Flash Powered</p>
          </div>
        </div>

        <button
          onClick={onClearChat}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-purple-900/20 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
              <Sparkles className="w-7 h-7 text-cyan-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Mayuri se baat karein</h4>
              <p className="text-xs text-slate-400 mt-1">
                Kuch bhi poochein — padhai, coding, jokes, ya personal salah. Mayuri Hindi aur English dono mein jawab degi.
              </p>
            </div>

            <div className="w-full space-y-2 pt-2">
              {prompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(p)}
                  className="w-full text-left p-2.5 text-xs text-slate-300 hover:text-white rounded-xl bg-purple-950/25 hover:bg-purple-900/35 border border-purple-800/20 transition-all"
                >
                  &quot;{p}&quot;
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[90%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                    isUser
                      ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white'
                      : 'bg-gradient-to-tr from-purple-600 to-pink-600 text-white'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div className="space-y-1">
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-purple-600 text-white rounded-tr-sm shadow-md'
                        : 'bg-[#120e26] border border-purple-500/20 text-slate-100 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {!isUser && (
                    <div className="flex items-center gap-2 pl-1 pt-0.5 text-[10px] text-slate-400">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-white flex items-center gap-1 transition-colors"
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
                        onClick={() => handleSpeak(msg.id, msg.text)}
                        className={`hover:text-white flex items-center gap-1 transition-colors ${
                          speakingId === msg.id ? 'text-pink-400 font-semibold' : ''
                        }`}
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{speakingId === msg.id ? 'Stop' : 'Listen'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-2.5 mr-auto max-w-[80%]">
            <div className="w-7 h-7 rounded-full bg-purple-700/50 flex items-center justify-center text-white">
              <Bot className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="p-3 rounded-2xl bg-[#120e26] border border-purple-500/20 text-xs text-purple-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>Mayuri likh rahi hai...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-purple-900/20 bg-[#0a081a]/80 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-xl mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or request explanations..."
              className="w-full bg-[#110e24] border border-purple-500/25 rounded-2xl pl-4 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40"
            />
            <button
              type="button"
              title="Attach File/Image"
              onClick={() => alert('Attachments supported: You can pass screenshots or logs to Mayuri')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-300 transition-colors"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center disabled:opacity-40 hover:scale-105 active:scale-95 transition-all shadow-md shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
