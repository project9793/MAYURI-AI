import React, { useState } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Trash2, 
  Cpu, 
  Sliders, 
  ExternalLink,
  Lock
} from 'lucide-react';

interface ApiSettingsScreenProps {
  customApiKey: string;
  onSaveApiKey: (key: string) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export const ApiSettingsScreen: React.FC<ApiSettingsScreenProps> = ({
  customApiKey,
  onSaveApiKey,
  selectedModel,
  onSelectModel,
}) => {
  const [keyInput, setKeyInput] = useState(customApiKey);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    latencyMs?: number;
    message?: string;
    error?: string;
  } | null>(null);

  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);

  const handleTestKey = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: keyInput || undefined,
          provider,
        }),
      });

      const data = await res.json();
      setTestResult(data);
      if (data.success && keyInput) {
        onSaveApiKey(keyInput);
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        error: e?.message || 'Connection failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSaveApiKey(keyInput.trim());
    handleTestKey();
  };

  const handleClear = () => {
    setKeyInput('');
    onSaveApiKey('');
    setTestResult(null);
  };

  return (
    <div className="w-full flex-1 overflow-y-auto p-4 space-y-4 bg-[#070512]">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">AI API & Model Settings</h2>
        <p className="text-xs text-slate-400">
          Configure API credentials, choose AI intelligence models & test ping latency
        </p>
      </div>

      {/* Security Banner */}
      <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
        <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-200">
          <span className="font-bold text-white block">Secure Keystore Encryption</span>
          Keys are stored using Android EncryptedSharedPreferences standards. System automatically provides backend proxy integration via Google Cloud AI Studio.
        </div>
      </div>

      {/* Provider Selector */}
      <div className="p-4 rounded-2xl glass-card space-y-3">
        <label className="text-xs font-bold text-white block">AI Provider</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setProvider('gemini')}
            className={`p-3 rounded-xl border text-left transition-all ${
              provider === 'gemini'
                ? 'bg-purple-900/40 border-purple-500 text-white'
                : 'glass-card text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-xs font-bold block">Google Gemini API</span>
            <span className="text-[10px] text-purple-300">Fast Native Multimodal (Default)</span>
          </button>

          <button
            onClick={() => setProvider('openai')}
            className={`p-3 rounded-xl border text-left transition-all ${
              provider === 'openai'
                ? 'bg-purple-900/40 border-purple-500 text-white'
                : 'glass-card text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-xs font-bold block">OpenAI Compatible</span>
            <span className="text-[10px] text-slate-400">GPT-4o / Compatible API</span>
          </button>
        </div>
      </div>

      {/* Model Selection */}
      <div className="p-4 rounded-2xl glass-card space-y-3">
        <label className="text-xs font-bold text-white flex items-center justify-between">
          <span>Active AI Model</span>
          <span className="text-[10px] text-purple-400 font-mono">gemini-3.8-flash</span>
        </label>

        <div className="space-y-2">
          {[
            { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Recommended)', desc: 'High speed, real-time voice & coding' },
            { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', desc: 'Ultra-low latency mobile inference' },
            { id: 'gemini-4-argon', name: 'Gemini 4 Argon', desc: 'Complex reasoning & deep logic' },
          ].map((m) => (
            <div
              key={m.id}
              onClick={() => onSelectModel(m.id)}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                selectedModel === m.id
                  ? 'bg-purple-900/30 border-purple-500 text-white'
                  : 'bg-[#100d24] border-purple-900/20 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div>
                <span className="text-xs font-bold block text-white">{m.name}</span>
                <span className="text-[10px] text-slate-400">{m.desc}</span>
              </div>
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedModel === m.id ? 'border-purple-400 bg-purple-500' : 'border-slate-600'}`}>
                {selectedModel === m.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Key Management */}
      <div className="p-4 rounded-2xl glass-card space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-purple-400" />
            <span>Custom API Key (Optional Override)</span>
          </label>
          <span className="text-[10px] text-slate-400">Defaults to System Key</span>
        </div>

        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="AIzaSy... (leave blank to use preconfigured server key)"
            className="w-full bg-[#100d24] border border-purple-500/25 rounded-xl pl-3 pr-20 py-2.5 text-xs font-mono text-purple-200 placeholder-slate-600 focus:outline-none focus:border-purple-400"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="p-1 text-slate-400 hover:text-white"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            {keyInput && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-red-400 hover:text-red-300"
                title="Delete Key"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleTestKey}
            disabled={testing}
            className="flex-1 py-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 text-purple-200 border border-purple-600/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>Test Connection</span>
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-md"
          >
            Save Key
          </button>
        </div>

        {/* Test Result Display */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              testResult.success
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/30 border-red-500/40 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              <span>{testResult.success ? 'Connected & Verified' : testResult.error}</span>
            </div>
            {testResult.latencyMs && (
              <span className="font-mono text-[10px] text-emerald-400 font-bold">
                {testResult.latencyMs} ms
              </span>
            )}
          </div>
        )}
      </div>

      {/* Advanced Parameters */}
      <div className="p-4 rounded-2xl glass-card space-y-3">
        <span className="text-xs font-bold text-white block">Inference Hyperparameters</span>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Creativity Temperature ({temperature})</span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-32 accent-purple-500"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Max Response Tokens ({maxTokens})</span>
            <input
              type="range"
              min="512"
              max="4096"
              step="256"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
              className="w-32 accent-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
