export type ScreenType =
  | 'splash'
  | 'home'
  | 'voice-chat'
  | 'ai-chat'
  | 'code-studio'
  | 'app-control'
  | 'social-assistant'
  | 'api-settings'
  | 'voice-settings'
  | 'chat-history'
  | 'permissions'
  | 'about';

export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mayuri';
  text: string;
  timestamp: number;
  intent?: string;
  actionDetails?: any;
  mood?: string;
}

export interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  avatarColor: string;
}

export interface DeviceState {
  torchOn: boolean;
  batteryLevel: number;
  isCharging: boolean;
  volume: number;
  brightness: number;
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
}

export interface ActiveTimer {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
}

export interface UserPreferences {
  userName: string;
  language: 'Hinglish' | 'Hindi' | 'English';
  autoListen: boolean;
  wakePhraseEnabled: boolean;
  voicePitch: number;
  voiceRate: number;
  selectedVoiceURI: string;
  saveHistory: boolean;
}

export interface AppPermissions {
  microphone: boolean;
  cameraTorch: boolean;
  contacts: boolean;
  phoneCall: boolean;
  notifications: boolean;
  accessibility: boolean;
}
