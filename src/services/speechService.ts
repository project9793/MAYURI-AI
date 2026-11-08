/**
 * Speech Recognition and Synthesis Service for MAYURI AI
 */

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export class SpeechService {
  private recognition: any = null;
  private isListening = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private audioContext: AudioContext | null = null;

  constructor() {
    this.initVoices();
  }

  private initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const load = () => {
        this.availableVoices = window.speechSynthesis.getVoices();
      };
      load();
      window.speechSynthesis.onvoiceschanged = load;
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (this.availableVoices.length === 0) {
        this.availableVoices = window.speechSynthesis.getVoices();
      }
    }
    return this.availableVoices;
  }

  /**
   * Find preferred female voice for Hindi or Indian English
   */
  public getBestFemaleVoice(lang: string = 'hi-IN', preferredUri?: string): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (voices.length === 0) return null;

    if (preferredUri) {
      const match = voices.find(v => v.voiceURI === preferredUri);
      if (match) return match;
    }

    // Look for female Hindi or Indian voices
    const hindiFemale = voices.find(
      v => (v.lang.includes('hi') || v.lang.includes('IN')) && 
           (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('lekha') || v.name.toLowerCase().includes('aditi') || v.name.toLowerCase().includes('veena'))
    );
    if (hindiFemale) return hindiFemale;

    // Look for any Hindi voice
    const hindiVoice = voices.find(v => v.lang.includes('hi'));
    if (hindiVoice) return hindiVoice;

    // Look for Indian English female voice
    const enInFemale = voices.find(
      v => v.lang.includes('en-IN') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('google'))
    );
    if (enInFemale) return enInFemale;

    // Look for general English female voice (Zira, Samantha, Karen, Google UK/US Female)
    const enFemale = voices.find(
      v => v.lang.startsWith('en') && 
           (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('karen') || v.name.toLowerCase().includes('victoria'))
    );
    if (enFemale) return enFemale;

    return voices[0] || null;
  }

  /**
   * Speak text with Mayuri's sweet female tone
   */
  public speak(
    text: string,
    options: {
      lang?: string;
      rate?: number;
      pitch?: number;
      voiceUri?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    } = {}
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      options.onError?.('Speech synthesis not supported');
      return;
    }

    this.stopSpeaking();

    // Clean text of markdown or emojis for smoother TTS pronunciation
    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .trim();

    if (!cleanText) {
      options.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const chosenVoice = this.getBestFemaleVoice(options.lang || 'hi-IN', options.voiceUri);

    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang;
    } else {
      utterance.lang = options.lang || 'hi-IN';
    }

    // Mayuri has a sweet, slightly high-pitched, warm voice
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.15; // sweet feminine resonance

    utterance.onstart = () => {
      this.currentUtterance = utterance;
      options.onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      options.onError?.(e);
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Interrupt assistant speaking immediately
   */
  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking;
  }

  /**
   * Start speech recognition
   */
  public startListening(options: {
    lang?: string;
    continuous?: boolean;
    onResult: (transcript: string, isFinal: boolean) => void;
    onError: (error: string) => void;
    onEnd: () => void;
  }): boolean {
    if (typeof window === 'undefined') return false;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      options.onError('Speech recognition not supported in this browser. Please use Chrome/Edge.');
      return false;
    }

    this.stopListening();
    this.stopSpeaking();

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = options.lang || 'hi-IN';
      this.recognition.continuous = options.continuous ?? false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.playChime('listen');
      };

      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        options.onResult(text, Boolean(finalTranscript));
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        options.onError(event.error || 'Speech recognition error');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        options.onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      this.isListening = false;
      options.onError(err?.message || 'Failed to start recognition');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
    this.isListening = false;
  }

  /**
   * Sound effect generator for feedback
   */
  public playChime(type: 'listen' | 'success' | 'alert' | 'timer'): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      const ctx = this.audioContext;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'listen') {
        // High soft blip
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.2); // C6
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'timer' || type === 'alert') {
        // Double pulse beep
        osc.frequency.setValueAtTime(987.77, now); // B5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {}
  }
}

export const speechService = new SpeechService();
