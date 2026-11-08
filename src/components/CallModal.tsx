import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, Volume2, User, CheckCircle2 } from 'lucide-react';
import { Contact } from '../types';
import { deviceService } from '../services/deviceService';

interface CallModalProps {
  contact: Contact | { name: string; phone: string; relation?: string };
  onClose: () => void;
  onCallInitiated?: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  contact,
  onClose,
  onCallInitiated,
}) => {
  const [callState, setCallState] = useState<'confirming' | 'dialing' | 'connected' | 'ended'>('confirming');
  const [duration, setDuration] = useState<number>(0);
  const [isSpeaker, setIsSpeaker] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    let timer: any;
    if (callState === 'connected') {
      timer = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const handleNativeCall = () => {
    deviceService.initiateCall(contact.phone);
    onCallInitiated?.();
    onClose();
  };

  const handleSimulateCall = () => {
    deviceService.vibrate([100, 100, 100]);
    setCallState('dialing');
    setTimeout(() => {
      setCallState('connected');
    }, 2500);
  };

  const handleEndCall = () => {
    deviceService.vibrate(80);
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-[#0f0c22] border border-purple-500/20 p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

        {/* Contact Avatar */}
        <div className="relative mb-4 mt-2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-700 via-indigo-600 to-pink-500 p-1 flex items-center justify-center shadow-lg shadow-purple-900/40">
            <div className="w-full h-full rounded-full bg-[#16122d] flex items-center justify-center text-2xl font-bold text-white">
              {contact.name.charAt(0).toUpperCase()}
            </div>
          </div>
          {callState === 'connected' && (
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0f0c22] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Contact Info */}
        <h3 className="text-xl font-bold text-white tracking-tight">{contact.name}</h3>
        <p className="text-sm text-purple-300 font-mono mt-0.5">{contact.phone}</p>
        {contact.relation && (
          <span className="text-xs text-slate-400 mt-1">{contact.relation}</span>
        )}

        {/* Call State Info */}
        <div className="my-6">
          {callState === 'confirming' && (
            <div className="text-xs text-slate-300 bg-purple-950/40 border border-purple-800/30 rounded-xl px-4 py-2.5">
              Mayuri: &quot;Kya aap <span className="text-purple-300 font-semibold">{contact.name}</span> ko call lagana chahte hain?&quot;
            </div>
          )}
          {callState === 'dialing' && (
            <div className="flex items-center gap-2 text-sm text-cyan-300 font-medium">
              <span className="animate-ping w-2 h-2 rounded-full bg-cyan-400" />
              Calling {contact.name}...
            </div>
          )}
          {callState === 'connected' && (
            <div className="text-sm font-mono text-emerald-400 font-semibold tracking-wider">
              {formatDuration(duration)} · In Call
            </div>
          )}
          {callState === 'ended' && (
            <div className="text-sm text-red-400 font-medium">Call Ended</div>
          )}
        </div>

        {/* Action Controls */}
        {callState === 'confirming' && (
          <div className="w-full space-y-2.5">
            <button
              onClick={handleNativeCall}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 active:scale-98 transition-all"
            >
              <Phone className="w-4 h-4" /> Open Native Phone Dialer
            </button>
            <button
              onClick={handleSimulateCall}
              className="w-full py-2.5 px-4 rounded-2xl bg-purple-950/40 hover:bg-purple-900/40 text-purple-200 border border-purple-600/30 font-medium text-xs flex items-center justify-center gap-2 transition-all"
            >
              Test In-App Call Simulation
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {callState === 'connected' && (
          <div className="w-full">
            <div className="flex items-center justify-center gap-6 mb-6">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full border transition-all ${
                  isMuted ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsSpeaker(!isSpeaker)}
                className={`p-3 rounded-full border transition-all ${
                  isSpeaker ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handleEndCall}
              className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-950/50"
            >
              <PhoneOff className="w-4 h-4" /> End Call
            </button>
          </div>
        )}

        {callState === 'dialing' && (
          <button
            onClick={handleEndCall}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};
