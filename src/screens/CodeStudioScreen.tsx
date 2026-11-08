import React, { useState } from 'react';
import { 
  Code2, 
  Play, 
  Copy, 
  Check, 
  Bug, 
  BookOpen, 
  Sparkles, 
  ExternalLink, 
  RefreshCw,
  Terminal,
  FileCode
} from 'lucide-react';

export const CodeStudioScreen: React.FC = () => {
  const [language, setLanguage] = useState<'kotlin' | 'java' | 'python' | 'javascript' | 'html'>('kotlin');
  const [prompt, setPrompt] = useState('');
  const [existingCode, setExistingCode] = useState('');
  const [mode, setMode] = useState<'generate' | 'debug' | 'explain'>('generate');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');

  const [result, setResult] = useState<{
    title?: string;
    explanation?: string;
    code?: string;
    runnableHtml?: string | null;
    androidManifestSnippet?: string | null;
  }>({
    title: 'Android Voice Assistant SpeechRecognizer Service',
    explanation: 'Kotlin implementation showing native SpeechRecognizer setup with continuous recognition and TTS integration for Mayuri AI.',
    code: `package com.mayuri.ai.voice

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import java.util.Locale

class MayuriVoiceEngine(private val context: Context, private val onResult: (String) -> Unit) {
    private var speechRecognizer: SpeechRecognizer? = null
    private var isListening = false

    fun startListening() {
        if (!SpeechRecognizer.isRecognitionAvailable(context)) return
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context).apply {
            setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) { isListening = true }
                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    matches?.firstOrNull()?.let { transcript ->
                        onResult(transcript)
                    }
                    isListening = false
                }
                override fun onError(error: Int) { isListening = false }
                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(rmsdB: Float) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onEndOfSpeech() { isListening = false }
                override fun onPartialResults(partialResults: Bundle?) {}
                override fun onEvent(eventType: Int, params: Bundle?) {}
            })
        }

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "hi-IN")
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Mayuri sun rahi hai...")
        }
        speechRecognizer?.startListening(intent)
    }

    fun stopListening() {
        speechRecognizer?.stopListening()
        speechRecognizer?.destroy()
        speechRecognizer = null
        isListening = false
    }
}`,
    androidManifestSnippet: `<uses-permission android:name="android.permission.RECORD_AUDIO" />\n<uses-permission android:name="android.permission.INTERNET" />`,
  });

  const handleGenerate = async () => {
    if (!prompt.trim() && mode === 'generate') return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt || (mode === 'debug' ? 'Fix potential issues and improve performance' : 'Explain this code in detail'),
          language,
          mode,
          code: existingCode,
        }),
      });

      const data = await response.json();
      setResult(data);
      if (data.runnableHtml) {
        setActiveTab('preview');
      } else {
        setActiveTab('code');
      }
    } catch (err: any) {
      alert('Failed to generate code: ' + (err?.message || 'Network error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result.code) {
      navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const samplePrompts = [
    { lang: 'kotlin', text: 'Android Torch / Flashlight controller in Kotlin with CameraManager' },
    { lang: 'kotlin', text: 'Android Room Database for saving Voice Chat history' },
    { lang: 'python', text: 'FastAPI backend for Gemini Voice Assistant streaming' },
    { lang: 'html', text: 'Futuristic glowing AI voice assistant dashboard with audio waves' },
  ];

  return (
    <div className="w-full flex-1 flex flex-col justify-between overflow-y-auto p-4 bg-[#070512]">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-purple-900/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Mayuri AI Code Studio</h2>
            <p className="text-[10px] text-slate-400">Android, Kotlin, Web & Python Specialist</p>
          </div>
        </div>

        {/* Language selector */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          className="bg-[#130f28] border border-purple-500/25 rounded-xl px-2.5 py-1.5 text-xs text-purple-200 focus:outline-none focus:border-purple-400"
        >
          <option value="kotlin">Kotlin (Android)</option>
          <option value="java">Java</option>
          <option value="python">Python</option>
          <option value="javascript">JavaScript / React</option>
          <option value="html">HTML / CSS / JS</option>
        </select>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 my-2.5">
        <button
          onClick={() => setMode('generate')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mode === 'generate'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-[#120e26] text-slate-400 hover:text-slate-200 border border-purple-900/20'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate</span>
        </button>
        <button
          onClick={() => setMode('debug')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mode === 'debug'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-[#120e26] text-slate-400 hover:text-slate-200 border border-purple-900/20'
          }`}
        >
          <Bug className="w-3.5 h-3.5" />
          <span>Debug / Fix</span>
        </button>
        <button
          onClick={() => setMode('explain')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mode === 'explain'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-[#120e26] text-slate-400 hover:text-slate-200 border border-purple-900/20'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Explain</span>
        </button>
      </div>

      {/* Input area */}
      <div className="space-y-2 mb-3">
        {mode !== 'generate' && (
          <div>
            <label className="text-[10px] font-semibold text-slate-400 block mb-1">
              Paste Code to {mode === 'debug' ? 'Fix' : 'Explain'}:
            </label>
            <textarea
              value={existingCode}
              onChange={(e) => setExistingCode(e.target.value)}
              placeholder={`Paste your ${language} code here...`}
              rows={4}
              className="w-full bg-[#0c091d] border border-purple-500/20 rounded-xl p-3 text-xs font-mono text-purple-200 placeholder-slate-600 focus:outline-none focus:border-purple-400"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              mode === 'generate'
                ? `E.g., "Build an Android Battery Monitor in ${language}"`
                : 'Describe what needs to be fixed or explained...'
            }
            className="flex-1 bg-[#110e24] border border-purple-500/25 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || (!prompt.trim() && mode === 'generate')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center gap-1.5 disabled:opacity-40 transition-all shadow-md shrink-0"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            <span>{mode === 'generate' ? 'Generate' : 'Process'}</span>
          </button>
        </div>

        {/* Quick prompt suggestions */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          {samplePrompts.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => {
                setLanguage(sp.lang as any);
                setPrompt(sp.text);
              }}
              className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-purple-950/20 hover:bg-purple-900/30 text-purple-300 border border-purple-800/20 transition-colors"
            >
              {sp.text}
            </button>
          ))}
        </div>
      </div>

      {/* Code Editor Output Display */}
      <div className="flex-1 rounded-2xl border border-purple-500/25 bg-[#0a0718] overflow-hidden flex flex-col shadow-xl min-h-[360px]">
        {/* Editor Tab Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#100d24] border-b border-purple-900/30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'code' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{result.title || 'Source Code'}</span>
            </button>

            {result.runnableHtml && (
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'preview' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Live Sandbox Preview</span>
              </button>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-purple-300 hover:text-white bg-purple-950/40 border border-purple-500/20 rounded-lg transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Content View: Code vs Preview */}
        {activeTab === 'code' ? (
          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 leading-relaxed bg-[#060410]">
            {result.explanation && (
              <div className="mb-4 p-3 rounded-xl bg-purple-950/30 border border-purple-800/30 font-sans text-xs text-purple-200 leading-relaxed">
                <span className="font-bold text-white block mb-1">Architecture & Explanation:</span>
                {result.explanation}
              </div>
            )}

            {result.androidManifestSnippet && (
              <div className="mb-4 p-2.5 rounded-xl bg-amber-950/20 border border-amber-600/30 text-amber-200 text-[11px]">
                <span className="font-bold block mb-1">AndroidManifest.xml Permissions:</span>
                <pre>{result.androidManifestSnippet}</pre>
              </div>
            )}

            <pre className="whitespace-pre overflow-x-auto text-cyan-200">
              <code>{result.code || '// Generated code will appear here'}</code>
            </pre>
          </div>
        ) : (
          <div className="flex-1 bg-white overflow-hidden">
            <iframe
              srcDoc={result.runnableHtml || ''}
              title="Live Sandbox Preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-modals"
            />
          </div>
        )}
      </div>
    </div>
  );
};
