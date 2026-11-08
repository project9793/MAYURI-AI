import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  Instagram, 
  Youtube, 
  MessageCircle, 
  SendHorizontal, 
  Hash, 
  RefreshCw 
} from 'lucide-react';
import { deviceService } from '../services/deviceService';

export const SocialAssistantScreen: React.FC = () => {
  const [platform, setPlatform] = useState<'instagram' | 'whatsapp' | 'youtube' | 'telegram' | 'facebook'>('instagram');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<'friendly' | 'viral' | 'formal' | 'poetic' | 'motivational'>('viral');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [generated, setGenerated] = useState<{
    content: string;
    hashtags?: string[];
    alternatives?: string[];
    bestTimeToPost?: string;
  }>({
    content: 'Chasing sunsets and quiet dreams ✨ In a world that is always rushing, find your calm.\n\nSave this for days when you need a gentle reminder to pause. 💫',
    hashtags: ['#ReelsIndia', '#AestheticVibes', '#MayuriAI', '#Mindfulness', '#DailyInspiration', '#ExplorePage'],
    bestTimeToPost: '7:00 PM – 9:00 PM IST',
    alternatives: [
      'Stop scrolling, take a deep breath. You are doing amazing.',
      'Peace over chaos, every single day.',
    ],
  });

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          topic,
          tone,
        }),
      });

      const data = await response.json();
      setGenerated(data);
    } catch (e: any) {
      alert('Generation error: ' + (e?.message || 'Network error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    const fullText = `${generated.content}\n\n${(generated.hashtags || []).join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const fullText = `${generated.content}\n\n${(generated.hashtags || []).join(' ')}`;
    await deviceService.shareContent(`Mayuri ${platform} draft`, fullText);
  };

  const handleOpenApp = () => {
    deviceService.openApp(platform, generated.content);
  };

  const platforms = [
    { id: 'instagram' as const, label: 'Instagram Reels', icon: Instagram, color: 'text-pink-400 border-pink-500/30' },
    { id: 'whatsapp' as const, label: 'WhatsApp Message', icon: MessageCircle, color: 'text-emerald-400 border-emerald-500/30' },
    { id: 'youtube' as const, label: 'YouTube Title/SEO', icon: Youtube, color: 'text-red-400 border-red-500/30' },
    { id: 'telegram' as const, label: 'Telegram Post', icon: SendHorizontal, color: 'text-sky-400 border-sky-500/30' },
  ];

  const presetTopics = [
    'Birthday wish for best friend in heartfelt Hinglish',
    'Morning coffee aesthetic reel with soft vibes',
    'Tech explainer: What is Artificial Intelligence?',
    'Apology message to boss for being late politely',
  ];

  return (
    <div className="w-full flex-1 overflow-y-auto p-4 space-y-4 bg-[#070512]">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">Social Media AI Assistant</h2>
        <p className="text-xs text-slate-400">
          Craft captions, WhatsApp messages, YouTube SEO & share directly
        </p>
      </div>

      {/* Platform Tabs */}
      <div className="grid grid-cols-4 gap-2">
        {platforms.map((p) => {
          const Icon = p.icon;
          const isActive = platform === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                isActive
                  ? 'bg-purple-900/40 border-purple-500 text-white shadow-md'
                  : 'glass-card text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? p.color : ''}`} />
              <span className="text-[10px] font-semibold line-clamp-1">{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Form */}
      <div className="p-4 rounded-2xl glass-card space-y-3">
        <label className="text-xs font-semibold text-slate-300 block">
          What content do you want to create?
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={`E.g., "A relaxing sunset caption with inspiring thoughts for ${platform}"`}
          rows={3}
          className="w-full bg-[#100d24] border border-purple-500/20 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
        />

        {/* Tone Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          {(['viral', 'friendly', 'formal', 'poetic', 'motivational'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                tone === t
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-950/20 text-slate-400 hover:text-slate-200 border border-purple-900/20'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          {presetTopics.map((pt, i) => (
            <button
              key={i}
              onClick={() => setTopic(pt)}
              className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-purple-950/30 text-purple-300 border border-purple-800/20 hover:text-white transition-colors"
            >
              {pt}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !topic.trim()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-40 shadow-lg shadow-purple-950/50 transition-all"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>Generate with Mayuri AI</span>
        </button>
      </div>

      {/* Generated Content Card */}
      <div className="p-4 rounded-2xl glass-card space-y-3">
        <div className="flex items-center justify-between border-b border-purple-900/20 pb-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Draft Ready for {platform.toUpperCase()}</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="p-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-purple-950/40 text-purple-200 hover:text-white border border-purple-500/20 flex items-center gap-1 transition-all"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white flex items-center gap-1 shadow-sm transition-all"
            >
              <Share2 className="w-3 h-3" />
              <span>ShareSheet</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-100 whitespace-pre-wrap leading-relaxed">
          {generated.content}
        </p>

        {generated.hashtags && generated.hashtags.length > 0 && (
          <div className="pt-2 border-t border-purple-900/20">
            <div className="flex flex-wrap gap-1.5">
              {generated.hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] text-cyan-300 bg-cyan-950/30 px-2 py-0.5 rounded-md border border-cyan-800/20 font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {generated.bestTimeToPost && (
          <p className="text-[10px] text-slate-400">
            Optimal Posting Window: <span className="text-purple-300 font-semibold">{generated.bestTimeToPost}</span>
          </p>
        )}

        <button
          onClick={handleOpenApp}
          className="w-full py-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 text-purple-200 border border-purple-600/30 font-medium text-xs flex items-center justify-center gap-2 transition-all"
        >
          <span>Open in {platform} App</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
