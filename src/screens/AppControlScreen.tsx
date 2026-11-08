import React, { useState, useEffect } from 'react';
import { 
  Flashlight, 
  BatteryCharging, 
  Battery, 
  Volume2, 
  Sun, 
  Wifi, 
  Bluetooth, 
  Clock, 
  Camera, 
  Phone, 
  Search, 
  Play, 
  Pause, 
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  BellRing
} from 'lucide-react';
import { Contact, DeviceState, ActiveTimer } from '../types';
import { deviceService } from '../services/deviceService';
import { speechService } from '../services/speechService';
import { CallModal } from '../components/CallModal';

interface AppControlScreenProps {
  deviceState: DeviceState;
  onUpdateDeviceState: (update: Partial<DeviceState>) => void;
  onToggleTorch: () => void;
  onInitiateCall: (contact: Contact) => void;
}

export const AppControlScreen: React.FC<AppControlScreenProps> = ({
  deviceState,
  onUpdateDeviceState,
  onToggleTorch,
  onInitiateCall,
}) => {
  const [contacts, setContacts] = useState<Contact[]>(deviceService.contacts);
  const [searchContact, setSearchContact] = useState('');
  const [selectedCallContact, setSelectedCallContact] = useState<Contact | null>(null);

  // Timers state
  const [timers, setTimers] = useState<ActiveTimer[]>([
    { id: '1', label: 'Tea Break', totalSeconds: 300, remainingSeconds: 300, isRunning: false },
    { id: '2', label: 'Workout Timer', totalSeconds: 60, remainingSeconds: 60, isRunning: false },
  ]);

  // Tick timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) =>
        prev.map((t) => {
          if (t.isRunning && t.remainingSeconds > 0) {
            const next = t.remainingSeconds - 1;
            if (next === 0) {
              speechService.playChime('timer');
              speechService.speak(`Aapka ${t.label} ka timer poora ho gaya hai!`, { lang: 'hi-IN' });
            }
            return { ...t, remainingSeconds: next };
          }
          return t;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTimer = (id: string) => {
    deviceService.vibrate(40);
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isRunning: !t.isRunning } : t))
    );
  };

  const resetTimer = (id: string) => {
    deviceService.vibrate(30);
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, remainingSeconds: t.totalSeconds, isRunning: false } : t))
    );
  };

  const addCustomTimer = (seconds: number, label: string) => {
    deviceService.vibrate(40);
    const newTimer: ActiveTimer = {
      id: Date.now().toString(),
      label,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      isRunning: true,
    };
    setTimers((prev) => [newTimer, ...prev]);
    speechService.speak(`${label} ka ${Math.round(seconds / 60)} minute ka timer start kar diya hai`, { lang: 'hi-IN' });
  };

  const installedApps = [
    { name: 'YouTube', iconBg: 'bg-red-600', url: 'https://youtube.com', query: 'Mayuri YouTube kholo' },
    { name: 'WhatsApp', iconBg: 'bg-emerald-600', url: 'https://web.whatsapp.com', query: 'WhatsApp kholo' },
    { name: 'Instagram', iconBg: 'bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-700', url: 'https://instagram.com', query: 'Instagram open karo' },
    { name: 'Telegram', iconBg: 'bg-sky-500', url: 'https://web.telegram.org', query: 'Telegram open karo' },
    { name: 'Google Maps', iconBg: 'bg-green-600', url: 'https://maps.google.com', query: 'Maps kholo' },
    { name: 'Spotify', iconBg: 'bg-emerald-500', url: 'https://open.spotify.com', query: 'Music bajao' },
    { name: 'Camera', iconBg: 'bg-slate-700', url: '#camera', query: 'Camera kholo' },
    { name: 'Calculator', iconBg: 'bg-indigo-600', url: 'https://www.google.com/search?q=calculator', query: 'Calculator kholo' },
  ];

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
      c.relation.toLowerCase().includes(searchContact.toLowerCase()) ||
      c.phone.includes(searchContact)
  );

  return (
    <div className="w-full flex-1 overflow-y-auto p-4 space-y-5 bg-[#070512]">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">Android Phone Control Center</h2>
        <p className="text-xs text-slate-400">
          Hardware controls, system intents, timer engine & contact dialer
        </p>
      </div>

      {/* Quick Hardware Toggles */}
      <div className="grid grid-cols-2 gap-3">
        {/* Flashlight */}
        <div
          onClick={onToggleTorch}
          role="button"
          tabIndex={0}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-md active:scale-98 ${
            deviceState.torchOn
              ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-amber-500/10'
              : 'glass-card text-slate-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                deviceState.torchOn ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Flashlight className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold block text-white">Flashlight</span>
              <span className="text-[10px] text-slate-400">
                {deviceState.torchOn ? 'Active (ON)' : 'Turned OFF'}
              </span>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${deviceState.torchOn ? 'bg-amber-400 shadow-md shadow-amber-400' : 'bg-slate-700'}`} />
        </div>

        {/* Battery Monitor */}
        <div className="p-4 rounded-2xl glass-card flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              {deviceState.isCharging ? (
                <BatteryCharging className="w-5 h-5" />
              ) : (
                <Battery className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="text-xs font-bold block text-white">Battery Status</span>
              <span className="text-[10px] text-emerald-400 font-semibold tabular-nums">
                {deviceState.batteryLevel}% {deviceState.isCharging ? '· Charging' : '· On Battery'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sliders: Volume & Brightness */}
      <div className="p-4 rounded-2xl glass-card space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-purple-400" />
            <span>Media Volume ({deviceState.volume}%)</span>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={deviceState.volume}
            onChange={(e) => onUpdateDeviceState({ volume: parseInt(e.target.value, 10) })}
            className="w-36 accent-purple-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Screen Brightness ({deviceState.brightness}%)</span>
          </span>
          <input
            type="range"
            min="10"
            max="100"
            value={deviceState.brightness}
            onChange={(e) => onUpdateDeviceState({ brightness: parseInt(e.target.value, 10) })}
            className="w-36 accent-amber-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Network & Radios */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onUpdateDeviceState({ wifiEnabled: !deviceState.wifiEnabled })}
          className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
            deviceState.wifiEnabled
              ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
              : 'glass-card text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Wifi className="w-4 h-4" />
            <div>
              <span className="text-xs font-bold block text-white">Wi-Fi</span>
              <span className="text-[10px]">{deviceState.wifiEnabled ? 'Connected (5GHz)' : 'Disconnected'}</span>
            </div>
          </div>
          <div className={`w-2.5 h-2.5 rounded-full ${deviceState.wifiEnabled ? 'bg-blue-400' : 'bg-slate-700'}`} />
        </button>

        <button
          onClick={() => onUpdateDeviceState({ bluetoothEnabled: !deviceState.bluetoothEnabled })}
          className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
            deviceState.bluetoothEnabled
              ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
              : 'glass-card text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Bluetooth className="w-4 h-4" />
            <div>
              <span className="text-xs font-bold block text-white">Bluetooth</span>
              <span className="text-[10px]">{deviceState.bluetoothEnabled ? 'Ready (Paired)' : 'Disabled'}</span>
            </div>
          </div>
          <div className={`w-2.5 h-2.5 rounded-full ${deviceState.bluetoothEnabled ? 'bg-indigo-400' : 'bg-slate-700'}`} />
        </button>
      </div>

      {/* Alarms and Timers Engine */}
      <div className="p-4 rounded-2xl glass-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Alarms & Countdown Timers</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => addCustomTimer(60, '1 Min Quick Timer')}
              className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-purple-950/40 border border-purple-500/20 text-purple-300 hover:text-white"
            >
              +1 min
            </button>
            <button
              onClick={() => addCustomTimer(300, '5 Min Timer')}
              className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-purple-950/40 border border-purple-500/20 text-purple-300 hover:text-white"
            >
              +5 min
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {timers.map((t) => {
            const mins = Math.floor(t.remainingSeconds / 60);
            const secs = t.remainingSeconds % 60;
            return (
              <div
                key={t.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#0e0b20] border border-purple-500/15"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">{t.label}</span>
                  <span className="text-sm font-mono font-bold text-cyan-300 tabular-nums">
                    {mins}:{secs < 10 ? '0' : ''}{secs}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleTimer(t.id)}
                    className={`p-2 rounded-xl text-white transition-all ${
                      t.isRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
                    }`}
                  >
                    {t.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => resetTimer(t.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Installed Applications Launcher */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <ExternalLink className="w-4 h-4 text-purple-400" />
            <span>Open Installed Applications</span>
          </span>
          <span className="text-[10px] text-slate-500">Android Intent Bridge</span>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {installedApps.map((app, i) => (
            <button
              key={i}
              onClick={() => deviceService.openApp(app.name)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl glass-card hover:border-purple-500/40 transition-all group active:scale-95"
            >
              <div
                className={`w-10 h-10 rounded-2xl ${app.iconBg} flex items-center justify-center text-white mb-1.5 shadow-md group-hover:scale-105 transition-transform`}
              >
                <span className="text-xs font-bold">{app.name.charAt(0)}</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-200 line-clamp-1">{app.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Phone Calling & Contact Search */}
      <div className="p-4 rounded-2xl glass-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Voice Calling & Contacts</span>
          </span>
          <span className="text-[10px] text-purple-400 font-mono">tel: intent ready</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchContact}
            onChange={(e) => setSearchContact(e.target.value)}
            placeholder="Search contact by name or number..."
            className="w-full bg-[#100d24] border border-purple-500/20 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Contact list */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#0f0c22] border border-purple-900/20 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div
                  style={{ backgroundColor: contact.avatarColor }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                >
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{contact.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {contact.phone} · {contact.relation}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCallContact(contact)}
                className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 transition-all"
                title={`Call ${contact.name}`}
              >
                <Phone className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Call Confirmation Dialog */}
      {selectedCallContact && (
        <CallModal
          contact={selectedCallContact}
          onClose={() => setSelectedCallContact(null)}
          onCallInitiated={() => {
            onInitiateCall(selectedCallContact);
            setSelectedCallContact(null);
          }}
        />
      )}
    </div>
  );
};
