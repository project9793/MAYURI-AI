import React, { useState } from 'react';
import { 
  Sparkles, 
  Code2, 
  FileCode, 
  Copy, 
  Check, 
  Terminal, 
  Package, 
  Smartphone, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  BookOpen 
} from 'lucide-react';

export const AboutScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'manifest' | 'mainActivity' | 'service' | 'buildGuide'>('overview');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleCopy = (tabKey: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(tabKey);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const manifestCode = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.mayuri.ai.assistant">

    <!-- Essential Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera.flash" android:required="false" />
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.BATTERY_STATS" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="MAYURI AI"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.MayuriAI">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <!-- Voice Assistant Hotword Intent -->
            <intent-filter>
                <action android:name="android.intent.action.VOICE_COMMAND" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </activity>

        <!-- Accessibility Service for System Navigation -->
        <service
            android:name=".MayuriAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="false">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

    </application>
</manifest>`;

  const mainActivityCode = `package com.mayuri.ai.assistant

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.hardware.camera2.CameraManager
import android.net.Uri
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import java.util.Locale

class MainActivity : AppCompatActivity(), TextToSpeech.OnInitListener {

    private lateinit var tts: TextToSpeech
    private var speechRecognizer: SpeechRecognizer? = null
    private var isTorchOn = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        checkPermissions()
        tts = TextToSpeech(this, this)
        initSpeechRecognizer()
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            // Set Hindi / Indian English voice
            val result = tts.setLanguage(Locale("hi", "IN"))
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                tts.setLanguage(Locale("en", "IN"))
            }
            tts.setPitch(1.15f) // Sweet female tone
            tts.setSpeechRate(1.05f)
            speak("Namaste! Main Mayuri hoon, aapki smart personal assistant. Boliye, main kya karoon?")
        }
    }

    private fun initSpeechRecognizer() {
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this).apply {
            setRecognitionListener(object : RecognitionListener {
                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    val query = matches?.firstOrNull() ?: return
                    processVoiceCommand(query)
                }
                override fun onError(error: Int) {}
                override fun onReadyForSpeech(params: Bundle?) {}
                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(rmsdB: Float) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onEndOfSpeech() {}
                override fun onPartialResults(partialResults: Bundle?) {}
                override fun onEvent(eventType: Int, params: Bundle?) {}
            })
        }
    }

    fun startListening() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "hi-IN")
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Mayuri sun rahi hai...")
        }
        speechRecognizer?.startListening(intent)
    }

    private fun processVoiceCommand(command: String) {
        val lower = command.toLowerCase(Locale.ROOT)

        when {
            lower.contains("torch") || lower.contains("flashlight") -> {
                toggleFlashlight()
            }
            lower.contains("youtube") -> {
                openApp("com.google.android.youtube", "https://youtube.com")
                speak("YouTube khol rahi hoon")
            }
            lower.contains("whatsapp") -> {
                openApp("com.whatsapp", "https://whatsapp.com")
                speak("WhatsApp open kar rahi hoon")
            }
            lower.contains("call") || lower.contains("phone") -> {
                speak("Call lagane ke liye dialer khol rahi hoon")
                val dialIntent = Intent(Intent.ACTION_DIAL)
                startActivity(dialIntent)
            }
            else -> {
                // Route to Gemini AI API via backend
                speak("Maine aapki baat suni: $command. Abhi iska jawab taiyar karti hoon.")
            }
        }
    }

    private fun toggleFlashlight() {
        val cameraManager = getSystemService(Context.CAMERA_SERVICE) as CameraManager
        try {
            val cameraId = cameraManager.cameraIdList[0]
            isTorchOn = !isTorchOn
            cameraManager.setTorchMode(cameraId, isTorchOn)
            speak(if (isTorchOn) "Flashlight on kar di gayi hai" else "Flashlight band kar di hai")
        } catch (e: Exception) {
            Toast.makeText(this, "Torch error: \${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun openApp(packageName: String, fallbackUrl: String) {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        if (launchIntent != null) {
            startActivity(launchIntent)
        } else {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(fallbackUrl)))
        }
    }

    fun speak(text: String) {
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "MAYURI_SPEECH")
    }

    private fun checkPermissions() {
        val permissions = arrayOf(
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.CAMERA,
            Manifest.permission.CALL_PHONE,
            Manifest.permission.READ_CONTACTS
        )
        ActivityCompat.requestPermissions(this, permissions, 101)
    }

    override fun onDestroy() {
        super.onDestroy()
        speechRecognizer?.destroy()
        tts.stop()
        tts.shutdown()
    }
}`;

  const accessibilityServiceCode = `package com.mayuri.ai.assistant

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent

class MayuriAccessibilityService : AccessibilityService() {

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Safe context inspection only when authorized by user
    }

    override fun onInterrupt() {}

    fun performBackNavigation(): Boolean {
        return performGlobalAction(GLOBAL_ACTION_BACK)
    }

    fun performHomeNavigation(): Boolean {
        return performGlobalAction(GLOBAL_ACTION_HOME)
    }

    fun openNotifications(): Boolean {
        return performGlobalAction(GLOBAL_ACTION_NOTIFICATIONS)
    }
}`;

  const buildGuideCode = `# MAYURI AI - Android Studio APK Build Instructions

### Prerequisites:
1. Android Studio Ladybug or Meerkat (2024+)
2. Android SDK 34 (Android 14) or SDK 35
3. JDK 17 or JDK 21

### Step 1: Create or Import Android Project
- Open Android Studio -> New Project -> Empty Activity (Compose or XML Views)
- Package Name: com.mayuri.ai.assistant
- Language: Kotlin
- Minimum SDK: API 26 (Android 8.0 Oreo)

### Step 2: Add Dependencies in app/build.gradle.kts
dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")

    // Coroutines & Lifecycle
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.2")

    // Room Database
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")

    // Retrofit / OkHttp for Gemini Backend
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
}

### Step 3: Build Debug or Release APK via Gradle Terminal
# In Android Studio Terminal:
./gradlew assembleDebug

# For Release APK:
./gradlew assembleRelease

APK will be generated at:
app/build/outputs/apk/debug/app-debug.apk
`;

  return (
    <div className="w-full flex-1 overflow-y-auto p-4 space-y-4 bg-[#070512]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-purple-900/20">
        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-purple-400/40 p-0.5 bg-[#120e26] shrink-0">
          <img
            src="/src/assets/images/mayuri_avatar_1794160580067.jpg"
            alt="Mayuri"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            <span>MAYURI AI</span>
            <span className="text-[10px] text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded-full border border-cyan-800/30">
              v2.5.0
            </span>
          </h2>
          <p className="text-xs text-purple-300">Smart Personal Voice Assistant & Android Companion</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
        {[
          { id: 'overview', label: 'App Overview', icon: BookOpen },
          { id: 'manifest', label: 'AndroidManifest.xml', icon: FileCode },
          { id: 'mainActivity', label: 'MainActivity.kt', icon: Code2 },
          { id: 'service', label: 'Accessibility.kt', icon: Cpu },
          { id: 'buildGuide', label: 'APK Build Guide', icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-[#100d24] text-slate-400 hover:text-slate-200 border border-purple-900/20'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl glass-card space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Assistant Persona & Capabilities</span>
            </h3>
            <p>
              Mayuri behaves like a smart, friendly, and respectful female AI companion. She speaks fluent Hindi, English, and Hinglish with sweet voice modulation, understands user emotions, cracks jokes, motivates, and executes native phone controls seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl glass-card">
              <span className="font-bold text-white block mb-1">Supported Languages</span>
              <p className="text-[11px] text-slate-400">Hindi, Hinglish, Indian English, Global English</p>
            </div>
            <div className="p-3 rounded-2xl glass-card">
              <span className="font-bold text-white block mb-1">AI Intelligence</span>
              <p className="text-[11px] text-slate-400">Google Gemini 3.8 Flash SDK Integration</p>
            </div>
            <div className="p-3 rounded-2xl glass-card">
              <span className="font-bold text-white block mb-1">Device Control</span>
              <p className="text-[11px] text-slate-400">Flashlight, Battery, Volume, Brightness, Timer, Apps</p>
            </div>
            <div className="p-3 rounded-2xl glass-card">
              <span className="font-bold text-white block mb-1">Code & Social</span>
              <p className="text-[11px] text-slate-400">Kotlin, Python, HTML/JS, WhatsApp, Reels Captions</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'manifest' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">AndroidManifest.xml</span>
            <button
              onClick={() => handleCopy('manifest', manifestCode)}
              className="flex items-center gap-1 text-xs text-purple-300 hover:text-white bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-500/20"
            >
              {copiedTab === 'manifest' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTab === 'manifest' ? 'Copied' : 'Copy Manifest'}</span>
            </button>
          </div>
          <pre className="p-3.5 rounded-2xl bg-[#080516] border border-purple-500/20 text-[11px] font-mono text-cyan-200 overflow-x-auto leading-relaxed">
            <code>{manifestCode}</code>
          </pre>
        </div>
      )}

      {activeTab === 'mainActivity' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">MainActivity.kt (Native Voice & Controls)</span>
            <button
              onClick={() => handleCopy('mainActivity', mainActivityCode)}
              className="flex items-center gap-1 text-xs text-purple-300 hover:text-white bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-500/20"
            >
              {copiedTab === 'mainActivity' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTab === 'mainActivity' ? 'Copied' : 'Copy Kotlin'}</span>
            </button>
          </div>
          <pre className="p-3.5 rounded-2xl bg-[#080516] border border-purple-500/20 text-[11px] font-mono text-purple-200 overflow-x-auto leading-relaxed">
            <code>{mainActivityCode}</code>
          </pre>
        </div>
      )}

      {activeTab === 'service' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">MayuriAccessibilityService.kt</span>
            <button
              onClick={() => handleCopy('service', accessibilityServiceCode)}
              className="flex items-center gap-1 text-xs text-purple-300 hover:text-white bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-500/20"
            >
              {copiedTab === 'service' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTab === 'service' ? 'Copied' : 'Copy Service'}</span>
            </button>
          </div>
          <pre className="p-3.5 rounded-2xl bg-[#080516] border border-purple-500/20 text-[11px] font-mono text-amber-200 overflow-x-auto leading-relaxed">
            <code>{accessibilityServiceCode}</code>
          </pre>
        </div>
      )}

      {activeTab === 'buildGuide' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Android Studio & Gradle Build Guide</span>
            <button
              onClick={() => handleCopy('buildGuide', buildGuideCode)}
              className="flex items-center gap-1 text-xs text-purple-300 hover:text-white bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-500/20"
            >
              {copiedTab === 'buildGuide' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTab === 'buildGuide' ? 'Copied' : 'Copy Instructions'}</span>
            </button>
          </div>
          <pre className="p-3.5 rounded-2xl bg-[#080516] border border-purple-500/20 text-[11px] font-mono text-emerald-200 overflow-x-auto leading-relaxed whitespace-pre-wrap">
            <code>{buildGuideCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
