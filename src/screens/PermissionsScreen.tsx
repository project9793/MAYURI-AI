import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Mic, 
  Camera, 
  Phone, 
  Users, 
  Bell, 
  Accessibility, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { AppPermissions } from '../types';
import { deviceService } from '../services/deviceService';

interface PermissionsScreenProps {
  permissions: AppPermissions;
  onUpdatePermissions: (perm: Partial<AppPermissions>) => void;
}

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({
  permissions,
  onUpdatePermissions,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const requestRealMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      onUpdatePermissions({ microphone: true });
      deviceService.vibrate(50);
      setFeedback('Microphone permission granted successfully!');
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      alert('Microphone permission denied or blocked in browser settings.');
    }
  };

  const requestRealCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      onUpdatePermissions({ cameraTorch: true });
      deviceService.vibrate(50);
      setFeedback('Camera & Flashlight permission granted!');
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      alert('Camera permission denied.');
    }
  };

  const requestNotification = async () => {
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      if (res === 'granted') {
        onUpdatePermissions({ notifications: true });
        deviceService.vibrate(50);
        setFeedback('Notifications enabled!');
        setTimeout(() => setFeedback(null), 3000);
      }
    } else {
      onUpdatePermissions({ notifications: true });
    }
  };

  const permissionItems = [
    {
      id: 'microphone' as keyof AppPermissions,
      title: 'Microphone (RECORD_AUDIO)',
      desc: 'Used for speech-to-text and hands-free voice commands in Hindi and English.',
      icon: Mic,
      granted: permissions.microphone,
      onRequest: requestRealMic,
    },
    {
      id: 'cameraTorch' as keyof AppPermissions,
      title: 'Camera & Flashlight (CAMERA)',
      desc: 'Used for torch flashlight control and future visual recognition features.',
      icon: Camera,
      granted: permissions.cameraTorch,
      onRequest: requestRealCamera,
    },
    {
      id: 'phoneCall' as keyof AppPermissions,
      title: 'Phone Calls (CALL_PHONE)',
      desc: 'Used to initiate calls to contacts with your explicit voice confirmation.',
      icon: Phone,
      granted: permissions.phoneCall,
      onRequest: () => onUpdatePermissions({ phoneCall: !permissions.phoneCall }),
    },
    {
      id: 'contacts' as keyof AppPermissions,
      title: 'Contacts (READ_CONTACTS)',
      desc: 'Used to look up contacts when you ask "Papa ko call lagao" or search numbers.',
      icon: Users,
      granted: permissions.contacts,
      onRequest: () => onUpdatePermissions({ contacts: !permissions.contacts }),
    },
    {
      id: 'notifications' as keyof AppPermissions,
      title: 'Notifications (POST_NOTIFICATIONS)',
      desc: 'Used to alert you when alarms, timers, or reminder tasks finish.',
      icon: Bell,
      granted: permissions.notifications,
      onRequest: requestNotification,
    },
    {
      id: 'accessibility' as keyof AppPermissions,
      title: 'Accessibility Service (BIND_ACCESSIBILITY)',
      desc: 'Permits navigating back, home, and interacting with supported apps smoothly.',
      icon: Accessibility,
      granted: permissions.accessibility,
      onRequest: () => onUpdatePermissions({ accessibility: !permissions.accessibility }),
    },
  ];

  return (
    <div className="w-full flex-1 overflow-y-auto p-4 space-y-4 bg-[#070512]">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">Android Permissions & Privacy</h2>
        <p className="text-xs text-slate-400">
          Manage system permissions with zero background surveillance
        </p>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Privacy Guarantee */}
      <div className="p-3.5 rounded-2xl glass-card flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-white block">Strict Privacy Guarantee:</span>
          Mayuri AI respects Android security policies. It will never secretly monitor background audio, read unauthorized SMS, or execute unconfirmed phone calls.
        </div>
      </div>

      {/* Permissions List */}
      <div className="space-y-2.5">
        {permissionItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl glass-card flex items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.granted ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{item.title}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">{item.desc}</p>
                </div>
              </div>

              <button
                onClick={item.onRequest}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  item.granted
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-purple-600 text-white hover:bg-purple-500 shadow-md'
                }`}
              >
                {item.granted ? 'Granted' : 'Grant'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
