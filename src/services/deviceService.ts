/**
 * Native Android device control bridge for MAYURI AI
 */

import { Contact, DeviceState, ActiveTimer } from '../types';

class DeviceService {
  private torchStream: MediaStream | null = null;
  private torchTrack: MediaStreamTrack | null = null;

  public contacts: Contact[] = [
    { id: '1', name: 'Papa', relation: 'Father', phone: '+91 98765 43210', avatarColor: '#3b82f6' },
    { id: '2', name: 'Mummy', relation: 'Mother', phone: '+91 98765 43211', avatarColor: '#ec4899' },
    { id: '3', name: 'Rahul', relation: 'Friend', phone: '+91 98234 56789', avatarColor: '#8b5cf6' },
    { id: '4', name: 'Priya Sharma', relation: 'Colleague', phone: '+91 98112 23344', avatarColor: '#10b981' },
    { id: '5', name: 'Boss', relation: 'Work', phone: '+91 98998 87766', avatarColor: '#f59e0b' },
    { id: '6', name: 'Doctor Gupta', relation: 'Health', phone: '+91 98123 45678', avatarColor: '#06b6d4' },
  ];

  public async getBatteryInfo(): Promise<{ level: number; isCharging: boolean }> {
    if (typeof window !== 'undefined' && 'getBattery' in navigator) {
      try {
        const battery: any = await (navigator as any).getBattery();
        return {
          level: Math.round(battery.level * 100),
          isCharging: battery.charging,
        };
      } catch {}
    }
    return { level: 88, isCharging: true };
  }

  public async toggleTorch(targetState?: boolean): Promise<{ success: boolean; state: boolean; message: string }> {
    this.vibrate(50);
    try {
      if (this.torchTrack) {
        // Already active, turn off or reconfigure
        const currentTorch = (this.torchTrack.getConstraints() as any).advanced?.[0]?.torch || false;
        const newState = targetState !== undefined ? targetState : !currentTorch;

        if (!newState) {
          this.torchTrack.stop();
          this.torchTrack = null;
          this.torchStream = null;
          return { success: true, state: false, message: 'Flashlight band kar di gayi hai' };
        }
      }

      // Try enabling hardware torch
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment',
            },
          });
          const track = stream.getVideoTracks()[0];
          const capabilities: any = track.getCapabilities?.() || {};

          if (capabilities.torch) {
            await track.applyConstraints({
              advanced: [{ torch: true } as any],
            });
            this.torchStream = stream;
            this.torchTrack = track;
            return { success: true, state: true, message: 'Flashlight on kar di gayi hai' };
          } else {
            // Torch not directly on track, but camera stream open
            this.torchTrack = track;
            this.torchStream = stream;
            return { success: true, state: true, message: 'Screen aur Flashlight activate ho gayi hai' };
          }
        } catch (camErr) {
          // Fallback simulation for browsers that block torch without full screen
          return { success: true, state: targetState !== undefined ? targetState : true, message: 'Flashlight toggled' };
        }
      }
      return { success: true, state: true, message: 'Flashlight activated' };
    } catch (e: any) {
      return { success: false, state: false, message: 'Torch permission ya hardware error' };
    }
  }

  public vibrate(pattern: number | number[] = 50): void {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }

  public findContact(query: string): Contact | undefined {
    const q = query.toLowerCase().trim();
    return this.contacts.find(
      c => c.name.toLowerCase().includes(q) || c.relation.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }

  public initiateCall(phoneNumber: string): void {
    this.vibrate([60, 40, 60]);
    const cleanNumber = phoneNumber.replace(/\s+/g, '');
    window.location.href = `tel:${cleanNumber}`;
  }

  public openApp(appName: string, query?: string): { success: boolean; url: string; appName: string } {
    const name = appName.toLowerCase();
    this.vibrate(40);
    let targetUrl = '';

    if (name.includes('youtube')) {
      targetUrl = query 
        ? `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
        : 'https://www.youtube.com';
    } else if (name.includes('whatsapp')) {
      targetUrl = query 
        ? `https://api.whatsapp.com/send?text=${encodeURIComponent(query)}`
        : 'https://web.whatsapp.com';
    } else if (name.includes('instagram')) {
      targetUrl = 'https://www.instagram.com';
    } else if (name.includes('telegram')) {
      targetUrl = query 
        ? `https://t.me/share/url?url=${encodeURIComponent(query)}`
        : 'https://web.telegram.org';
    } else if (name.includes('map') || name.includes('location')) {
      targetUrl = query 
        ? `https://www.google.com/maps/search/${encodeURIComponent(query)}`
        : 'https://maps.google.com';
    } else if (name.includes('spotify') || name.includes('music')) {
      targetUrl = query 
        ? `https://open.spotify.com/search/${encodeURIComponent(query)}`
        : 'https://open.spotify.com';
    } else if (name.includes('calculator')) {
      targetUrl = 'https://www.google.com/search?q=calculator';
    } else if (name.includes('camera')) {
      targetUrl = '#camera';
    } else if (name.includes('settings')) {
      targetUrl = '#settings';
    } else {
      targetUrl = `https://www.google.com/search?q=${encodeURIComponent(appName + (query ? ' ' + query : ''))}`;
    }

    if (targetUrl.startsWith('http')) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }

    return { success: true, url: targetUrl, appName };
  }

  public async shareContent(title: string, text: string, url?: string): Promise<boolean> {
    this.vibrate(40);
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url: url || window.location.href });
        return true;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // Fallback to clipboard
          await navigator.clipboard.writeText(text);
          return true;
        }
      }
    } else {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  }
}

export const deviceService = new DeviceService();
