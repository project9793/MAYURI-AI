import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Download, 
  MessageSquare, 
  Mic, 
  Calendar, 
  Check, 
  Copy,
  ShieldCheck
} from 'lucide-react';
import { ChatMessage, UserPreferences } from '../types';

interface ChatHistoryScreenProps {
  history: ChatMessage[];
  onClearHistory: () => void;
  onDeleteMessage: (id: string) => void;
  userPreferences: UserPreferences;
  onUpdatePreferences: (pref: Partial<UserPreferences>) => void;
}

export const ChatHistoryScreen: React.FC<ChatHistoryScreenProps> = ({
  history,
  onClearHistory,
  onDeleteMessage,
  userPreferences,
  onUpdatePreferences,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'user' | 'mayuri'>('all');
  const [copied, setCopied] = useState(false);

  const filtered = history.filter((msg) => {
    const matchesSearch = msg.text.toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchesSearch;
    return matchesSearch && msg.sender === filter;
  });

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mayuri_chat_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full flex-1 overflow-y-auto p-4 space-y-4 bg-[#070512]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Conversation Memory & History</h2>
          <p className="text-xs text-slate-400">
            {history.length} interactions logged locally on your device
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExport}
            disabled={history.length === 0}
            className="p-2 rounded-xl bg-purple-950/40 text-purple-300 hover:text-white border border-purple-500/20 disabled:opacity-40 transition-all"
            title="Export JSON"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClearHistory}
            disabled={history.length === 0}
            className="p-2 rounded-xl bg-red-950/30 text-red-400 hover:text-red-300 border border-red-500/20 disabled:opacity-40 transition-all"
            title="Clear All History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Memory Toggle */}
      <div className="p-3.5 rounded-2xl glass-card flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-xs font-bold text-white block">Persistent Context Memory</span>
            <span className="text-[10px] text-slate-400">Mayuri remembers context across voice sessions</span>
          </div>
        </div>
        <input
          type="checkbox"
          checked={userPreferences.saveHistory}
          onChange={(e) => onUpdatePreferences({ saveHistory: e.target.checked })}
          className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
        />
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transcripts or replies..."
            className="w-full bg-[#100d24] border border-purple-500/20 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-[#100d24] p-1 rounded-xl border border-purple-900/20">
          {(['all', 'user', 'mayuri'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 text-[10px] font-semibold rounded-lg capitalize transition-all ${
                filter === f ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f === 'mayuri' ? 'Mayuri' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 space-y-2">
            <History className="w-8 h-8 mx-auto text-purple-900/60" />
            <p className="text-xs">No conversations logged yet.</p>
            <p className="text-[10px] text-slate-600">Start talking to Mayuri to build your history log.</p>
          </div>
        ) : (
          filtered.map((msg) => (
            <div
              key={msg.id}
              className="p-3 rounded-2xl glass-card flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${
                    msg.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-purple-600 text-white'
                  }`}
                >
                  {msg.sender === 'user' ? 'U' : 'M'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-white">
                      {msg.sender === 'user' ? 'You' : 'Mayuri'}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {formatTime(msg.timestamp)}
                    </span>
                    {msg.intent && (
                      <span className="text-[9px] text-cyan-300 bg-cyan-950/40 px-1.5 py-0.2 rounded font-mono">
                        {msg.intent}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed break-words">{msg.text}</p>
                </div>
              </div>

              <button
                onClick={() => onDeleteMessage(msg.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 transition-opacity"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
