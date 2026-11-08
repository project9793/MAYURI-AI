import React, { useState, useEffect, useCallback } from 'react';
import { 
  ScreenType, 
  AssistantState, 
  ChatMessage, 
  DeviceState, 
  UserPreferences, 
  AppPermissions, 
  Contact 
} from './types';
import { speechService } from './services/speechService';
import { deviceService } from './services/deviceService';
import { TopAndroidBar } from './components/TopAndroidBar';
import { BottomNav } from './components/BottomNav';
import { CallModal } from './components/CallModal';

// Screens
import { SplashScreen } from './screens/SplashScreen';
import { HomeScreen } from './screens/HomeScreen';
import { VoiceChatScreen } from './screens/VoiceChatScreen';
import { AiChatScreen } from './screens/AiChatScreen';
import { CodeStudioScreen } from './screens/CodeStudioScreen';
import { AppControlScreen } from './screens/AppControlScreen';
import { SocialAssistantScreen } from './screens/SocialAssistantScreen';
import { ApiSettingsScreen } from './screens/ApiSettingsScreen';
import { VoiceSettingsScreen } from './screens/VoiceSettingsScreen';
import { ChatHistoryScreen } from './screens/ChatHistoryScreen';
import { PermissionsScreen } from './screens/PermissionsScreen';
import { AboutScreen } from './screens/AboutScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [lastSpokenText, setLastSpokenText] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeCallContact, setActiveCallContact] = useState<Contact | null>(null);

  // Device hardware state
  const [deviceState, setDeviceState] = useState<DeviceState>({
    torchOn: false,
    batteryLevel: 92,
    isCharging: false,
    volume: 75,
    brightness: 85,
    wifiEnabled: true,
    bluetoothEnabled: true,
  });

  // User preferences
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('mayuri_preferences');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      userName: 'Rahul',
      language: 'Hinglish',
      autoListen: true,
      wakePhraseEnabled: true,
      voicePitch: 1.15,
      voiceRate: 1.05,
      selectedVoiceURI: '',
      saveHistory: true,
    };
  });

  // Custom API key & Model
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('mayuri_custom_api_key') || '';
    } catch {
      return '';
    }
  });

  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');

  // Permissions state
  const [appPermissions, setAppPermissions] = useState<AppPermissions>({
    microphone: true,
    cameraTorch: true,
    contacts: true,
    phoneCall: true,
    notifications: true,
    accessibility: true,
  });

  // Conversation history
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('mayuri_chat_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'init-1',
        sender: 'mayuri',
        text: 'Namaste! Main Mayuri hoon, aapki smart personal AI voice assistant. Boliye, aaj main aapki kya madad karoon?',
        timestamp: Date.now() - 60000,
        mood: 'happy',
      },
    ];
  });

  // Save history on change
  useEffect(() => {
    if (userPreferences.saveHistory) {
      try {
        localStorage.setItem('mayuri_chat_history', JSON.stringify(conversationHistory));
      } catch {}
    }
  }, [conversationHistory, userPreferences.saveHistory]);

  // Save preferences on change
  useEffect(() => {
    try {
      localStorage.setItem('mayuri_preferences', JSON.stringify(userPreferences));
    } catch {}
  }, [userPreferences]);

  // Battery status sync
  useEffect(() => {
    deviceService.getBatteryInfo().then((info) => {
      setDeviceState((prev) => ({
        ...prev,
        batteryLevel: info.level,
        isCharging: info.isCharging,
      }));
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Speak with Mayuri's persona
  const speakText = useCallback(
    (text: string, onDone?: () => void) => {
      setLastSpokenText(text);

      if (isMuted) {
        onDone?.();
        return;
      }

      setAssistantState('speaking');
      speechService.speak(text, {
        lang: userPreferences.language === 'English' ? 'en-IN' : 'hi-IN',
        rate: userPreferences.voiceRate,
        pitch: userPreferences.voicePitch,
        voiceUri: userPreferences.selectedVoiceURI,
        onEnd: () => {
          setAssistantState('idle');
          onDone?.();
          // Auto-listen loop if enabled and in voice-chat screen
          if (userPreferences.autoListen && (currentScreen === 'voice-chat' || currentScreen === 'home')) {
            setTimeout(() => {
              startListeningProcess();
            }, 500);
          }
        },
        onError: () => {
          setAssistantState('idle');
          onDone?.();
        },
      });
    },
    [isMuted, userPreferences, currentScreen]
  );

  const stopSpeaking = () => {
    speechService.stopSpeaking();
    setAssistantState('idle');
  };

  // Execute Assistant intent actions
  const executeIntentAction = (intent: string, details: any = {}) => {
    switch (intent) {
      case 'TOGGLE_TORCH': {
        const targetState = details.torchState === 'on' ? true : details.torchState === 'off' ? false : undefined;
        deviceService.toggleTorch(targetState).then((res) => {
          setDeviceState((prev) => ({ ...prev, torchOn: res.state }));
          showToast(res.message);
        });
        break;
      }
      case 'OPEN_APP': {
        const appName = details.appName || 'App';
        deviceService.openApp(appName);
        showToast(`Opening ${appName}...`);
        break;
      }
      case 'CALL_CONTACT': {
        const contactName = details.contactName || details.phoneNumber || 'Contact';
        const found = deviceService.findContact(contactName);
        if (found) {
          setActiveCallContact(found);
        } else {
          setActiveCallContact({
            id: 'temp',
            name: contactName,
            relation: 'Call Request',
            phone: details.phoneNumber || '+91 98765 00000',
            avatarColor: '#3b82f6',
          });
        }
        break;
      }
      case 'CHECK_BATTERY': {
        deviceService.getBatteryInfo().then((info) => {
          setDeviceState((prev) => ({
            ...prev,
            batteryLevel: info.level,
            isCharging: info.isCharging,
          }));
          showToast(`Battery: ${info.level}% (${info.isCharging ? 'Charging' : 'On Battery'})`);
        });
        break;
      }
      case 'ADJUST_VOLUME': {
        const newVol = details.level === 'up' ? Math.min(100, deviceState.volume + 20) : details.level === 'down' ? Math.max(0, deviceState.volume - 20) : 0;
        setDeviceState((prev) => ({ ...prev, volume: newVol }));
        showToast(`Volume set to ${newVol}%`);
        break;
      }
      case 'ADJUST_BRIGHTNESS': {
        const newBr = details.level === 'up' ? Math.min(100, deviceState.brightness + 20) : Math.max(20, deviceState.brightness - 20);
        setDeviceState((prev) => ({ ...prev, brightness: newBr }));
        showToast(`Brightness set to ${newBr}%`);
        break;
      }
      case 'OPEN_CAMERA': {
        deviceService.openApp('Camera');
        showToast('Camera active');
        break;
      }
      case 'SOCIAL_MEDIA': {
        setCurrentScreen('social-assistant');
        break;
      }
      case 'GENERATE_CODE': {
        setCurrentScreen('code-studio');
        break;
      }
      default:
        break;
    }
  };

  // Main interaction pipeline: user command -> Gemini AI Assistant -> Spoken audio + intent execution
  const processUserMessage = async (userText: string) => {
    if (!userText.trim()) return;

    deviceService.vibrate(30);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: Date.now(),
    };

    setConversationHistory((prev) => [...prev, userMsg]);
    setAssistantState('thinking');

    try {
      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          conversationHistory: conversationHistory.slice(-5),
          customApiKey: customApiKey || undefined,
          userPreferences,
        }),
      });

      const data = await response.json();
      const replyText = data.spokenResponse || 'Maine aapka command process kar liya hai.';
      const intent = data.intent || 'CHAT';
      const actionDetails = data.actionDetails || {};

      const mayuriMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'mayuri',
        text: replyText,
        timestamp: Date.now(),
        intent,
        actionDetails,
        mood: data.moodDetected || 'happy',
      };

      setConversationHistory((prev) => [...prev, mayuriMsg]);

      // Speak response aloud
      speakText(replyText, () => {
        executeIntentAction(intent, actionDetails);
      });
    } catch (err: any) {
      console.error(err);
      const fallback = 'Maaf kijiye, abhi server se connect nahi ho pa rahi hoon. Kripya apna internet connection check karein.';
      speakText(fallback);
    }
  };

  // Start microphone speech recognition
  const startListeningProcess = () => {
    if (assistantState === 'speaking') {
      stopSpeaking();
      return;
    }

    setTranscript('');
    setAssistantState('listening');

    const success = speechService.startListening({
      lang: userPreferences.language === 'English' ? 'en-IN' : 'hi-IN',
      onResult: (text, isFinal) => {
        setTranscript(text);
        if (isFinal && text.trim()) {
          speechService.stopListening();
          processUserMessage(text.trim());
        }
      },
      onError: (err) => {
        console.warn('Speech Recognition:', err);
        setAssistantState('idle');
      },
      onEnd: () => {
        if (assistantState === 'listening') {
          setAssistantState('idle');
        }
      },
    });

    if (!success) {
      setAssistantState('idle');
      alert('Speech recognition is not supported on this browser or permission was denied. You can type in the text box below.');
    }
  };

  const handleToggleTorch = () => {
    deviceService.toggleTorch().then((res) => {
      setDeviceState((prev) => ({ ...prev, torchOn: res.state }));
      showToast(res.message);
    });
  };

  const handleInitiateCall = (contact: Contact) => {
    deviceService.initiateCall(contact.phone);
    showToast(`Calling ${contact.name}...`);
  };

  return (
    <div className="min-h-screen w-full bg-[#04030a] text-slate-100 flex items-center justify-center p-0 md:p-4 select-none relative overflow-x-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-700/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />

      {/* Main Container: Android Mobile Bezel Frame or Wide Viewport */}
      <div
        className={`w-full transition-all duration-300 flex flex-col overflow-hidden relative shadow-2xl ${
          isPhoneFrame
            ? 'max-w-[430px] h-[100dvh] md:h-[880px] md:max-h-[95vh] md:rounded-[44px] md:border-[8px] md:border-[#1c1833] bg-[#070512]'
            : 'max-w-6xl h-[100dvh] md:h-[900px] md:rounded-3xl border border-purple-900/30 bg-[#070512]'
        }`}
      >
        {/* Android Punch-hole Camera on Phone Frame */}
        {isPhoneFrame && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black border border-purple-950 z-40 hidden md:block" />
        )}

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-purple-950/90 border border-purple-400/40 text-purple-200 text-xs font-semibold shadow-xl backdrop-blur-md animate-fade-in flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Status & App Bar (visible on all screens except splash) */}
        {currentScreen !== 'splash' && (
          <TopAndroidBar
            batteryLevel={deviceState.batteryLevel}
            isCharging={deviceState.isCharging}
            isMuted={isMuted}
            onToggleMute={() => {
              if (!isMuted) stopSpeaking();
              setIsMuted(!isMuted);
              showToast(isMuted ? 'Voice Unmuted' : 'Voice Muted');
            }}
            isPhoneFrame={isPhoneFrame}
            onTogglePhoneFrame={() => setIsPhoneFrame(!isPhoneFrame)}
            currentScreen={currentScreen}
            onNavigate={(s) => setCurrentScreen(s)}
          />
        )}

        {/* Dynamic Screen Routing */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {currentScreen === 'splash' && (
            <SplashScreen onEnter={() => setCurrentScreen('home')} />
          )}

          {currentScreen === 'home' && (
            <HomeScreen
              state={assistantState}
              onMicClick={startListeningProcess}
              onSendText={processUserMessage}
              onNavigate={(s) => setCurrentScreen(s)}
              lastSpokenText={lastSpokenText}
              transcript={transcript}
              userPreferences={userPreferences}
              onStopSpeaking={stopSpeaking}
            />
          )}

          {currentScreen === 'voice-chat' && (
            <VoiceChatScreen
              state={assistantState}
              transcript={transcript}
              lastSpokenText={lastSpokenText}
              conversationHistory={conversationHistory}
              onMicClick={startListeningProcess}
              onStopSpeaking={stopSpeaking}
              onBack={() => setCurrentScreen('home')}
              userPreferences={userPreferences}
              onUpdatePreferences={(p) => setUserPreferences((prev) => ({ ...prev, ...p }))}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
            />
          )}

          {currentScreen === 'ai-chat' && (
            <AiChatScreen
              messages={conversationHistory}
              onSendMessage={processUserMessage}
              onClearChat={() => setConversationHistory([])}
              isLoading={assistantState === 'thinking'}
              userPreferences={userPreferences}
            />
          )}

          {currentScreen === 'code-studio' && <CodeStudioScreen />}

          {currentScreen === 'app-control' && (
            <AppControlScreen
              deviceState={deviceState}
              onUpdateDeviceState={(up) => setDeviceState((prev) => ({ ...prev, ...up }))}
              onToggleTorch={handleToggleTorch}
              onInitiateCall={handleInitiateCall}
            />
          )}

          {currentScreen === 'social-assistant' && <SocialAssistantScreen />}

          {currentScreen === 'api-settings' && (
            <ApiSettingsScreen
              customApiKey={customApiKey}
              onSaveApiKey={(key) => {
                setCustomApiKey(key);
                localStorage.setItem('mayuri_custom_api_key', key);
                showToast('API Key Saved');
              }}
              selectedModel={selectedModel}
              onSelectModel={(m) => setSelectedModel(m)}
            />
          )}

          {currentScreen === 'voice-settings' && (
            <VoiceSettingsScreen
              preferences={userPreferences}
              onUpdatePreferences={(p) => setUserPreferences((prev) => ({ ...prev, ...p }))}
            />
          )}

          {currentScreen === 'chat-history' && (
            <ChatHistoryScreen
              history={conversationHistory}
              onClearHistory={() => setConversationHistory([])}
              onDeleteMessage={(id) =>
                setConversationHistory((prev) => prev.filter((m) => m.id !== id))
              }
              userPreferences={userPreferences}
              onUpdatePreferences={(p) => setUserPreferences((prev) => ({ ...prev, ...p }))}
            />
          )}

          {currentScreen === 'permissions' && (
            <PermissionsScreen
              permissions={appPermissions}
              onUpdatePermissions={(p) => setAppPermissions((prev) => ({ ...prev, ...p }))}
            />
          )}

          {currentScreen === 'about' && <AboutScreen />}
        </main>

        {/* Bottom Material 3 Navigation Bar */}
        {currentScreen !== 'splash' && (
          <BottomNav
            currentScreen={currentScreen}
            onNavigate={(s) => setCurrentScreen(s)}
          />
        )}

        {/* Global Outgoing Call Modal */}
        {activeCallContact && (
          <CallModal
            contact={activeCallContact}
            onClose={() => setActiveCallContact(null)}
            onCallInitiated={() => handleInitiateCall(activeCallContact)}
          />
        )}
      </div>
    </div>
  );
}
