import { BgMusicType, SoundEffectType } from '../types/cartoon';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private currentBgmType: BgMusicType = 'none';
  private bgmIntervalId: any = null;
  private isBgmPlaying: boolean = false;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;

  constructor() {
    // Lazy init on first user interaction
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Create stream destination for video recorder
      if (this.ctx.createMediaStreamDestination) {
        this.destinationNode = this.ctx.createMediaStreamDestination();
        this.masterGain.connect(this.destinationNode);
      }
    } catch (e) {
      console.warn('AudioContext not supported or blocked:', e);
    }
  }

  public getAudioStream(): MediaStream | null {
    return this.destinationNode ? this.destinationNode.stream : null;
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // --- SOUND EFFECTS ---
  public playSoundEffect(type: SoundEffectType) {
    if (this.isMuted || type === 'none') return;
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    switch (type) {
      case 'boing': {
        // Classic cartoon spring boing
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(540, t + 0.15);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.35);
        osc.frequency.exponentialRampToValueAtTime(450, t + 0.5);

        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.55);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.6);
        break;
      }
      case 'whoosh': {
        // Cartoon wind swoosh
        const bufferSize = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, t);
        filter.frequency.exponentialRampToValueAtTime(2400, t + 0.2);
        filter.frequency.exponentialRampToValueAtTime(400, t + 0.4);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.7, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start(t);
        break;
      }
      case 'pop': {
        // High bubble pop
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(1400, t + 0.08);

        gain.gain.setValueAtTime(0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.12);
        break;
      }
      case 'magic': {
        // Sparkly arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
        notes.forEach((freq, index) => {
          if (!this.ctx || !this.sfxGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t + index * 0.06);

          gain.gain.setValueAtTime(0.4, t + index * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, t + index * 0.06 + 0.3);

          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t + index * 0.06);
          osc.stop(t + index * 0.06 + 0.35);
        });
        break;
      }
      case 'tada': {
        // Triumphant cartoon brass fan-fare
        const chords = [
          [261.63, 329.63, 392.00], // C
          [293.66, 369.99, 440.00], // D
          [392.00, 493.88, 587.33, 783.99] // G major high
        ];
        const times = [0, 0.16, 0.35];
        const durs = [0.14, 0.16, 0.6];

        chords.forEach((chord, i) => {
          chord.forEach(freq => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + times[i]);

            gain.gain.setValueAtTime(0.4, t + times[i]);
            gain.gain.exponentialRampToValueAtTime(0.01, t + times[i] + durs[i]);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + times[i]);
            osc.stop(t + times[i] + durs[i] + 0.05);
          });
        });
        break;
      }
      case 'punch': {
        // Cartoon comic thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.18);

        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.22);
        break;
      }
      case 'laugh': {
        // Chuckling sound
        const freqs = [350, 420, 360, 430, 340, 410];
        freqs.forEach((freq, idx) => {
          if (!this.ctx || !this.sfxGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t + idx * 0.1);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.8, t + idx * 0.1 + 0.08);

          gain.gain.setValueAtTime(0.5, t + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.1 + 0.09);

          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t + idx * 0.1);
          osc.stop(t + idx * 0.1 + 0.1);
        });
        break;
      }
      case 'cheer': {
        // Happy cartoon chorus bell
        [440, 554.37, 659.25, 880].forEach((freq) => {
          if (!this.ctx || !this.sfxGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.65);
        });
        break;
      }
    }
  }

  // --- BACKGROUND MUSIC SYNTHESIZER ---
  public playBGM(type: BgMusicType) {
    if (this.isMuted || type === 'none') {
      this.stopBGM();
      return;
    }
    this.init();
    this.resume();
    if (!this.ctx || !this.bgmGain) return;

    if (this.isBgmPlaying && this.currentBgmType === type) return;
    this.stopBGM();

    this.currentBgmType = type;
    this.isBgmPlaying = true;

    // Pattern sequencer
    let step = 0;
    const tempo = type === 'bouncy_playful' ? 140 : type === 'adventure_epic' ? 120 : type === 'desi_dholak_beat' ? 130 : 110;
    const stepDuration = (60 / tempo) / 2; // 16th notes approx

    const notesBouncy = [261.63, 0, 329.63, 392.00, 523.25, 392.00, 329.63, 0, 293.66, 0, 369.99, 440.00, 587.33, 440.00, 369.99, 0];
    const notesAdventure = [220, 220, 293.66, 329.63, 392.00, 329.63, 293.66, 220, 246.94, 246.94, 329.63, 369.99, 440.00, 369.99, 329.63, 246.94];
    const notesCute = [523.25, 0, 659.25, 0, 783.99, 0, 659.25, 0, 880, 0, 783.99, 0, 659.25, 0, 523.25, 0];
    const notesDesi = [220, 330, 220, 0, 330, 220, 440, 330, 220, 0, 330, 220, 392, 330, 220, 0];

    this.bgmIntervalId = setInterval(() => {
      if (!this.ctx || !this.bgmGain || !this.isBgmPlaying) return;
      const t = this.ctx.currentTime;
      let notes = notesBouncy;
      if (type === 'adventure_epic') notes = notesAdventure;
      if (type === 'cute_xylophone') notes = notesCute;
      if (type === 'desi_dholak_beat') notes = notesDesi;

      const freq = notes[step % notes.length];
      if (freq > 0) {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        osc.type = type === 'cute_xylophone' ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        noteGain.gain.setValueAtTime(0.2, t);
        noteGain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 0.9);

        osc.connect(noteGain);
        noteGain.connect(this.bgmGain);
        osc.start(t);
        osc.stop(t + stepDuration);
      }

      // Add gentle percussion beat
      if (step % 4 === 0) {
        // Kick
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.frequency.setValueAtTime(100, t);
        kickOsc.frequency.exponentialRampToValueAtTime(30, t + 0.08);
        kickGain.gain.setValueAtTime(0.25, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        kickOsc.connect(kickGain);
        kickGain.connect(this.bgmGain);
        kickOsc.start(t);
        kickOsc.stop(t + 0.1);
      } else if (step % 4 === 2) {
        // Snare / woodblock
        const snareOsc = this.ctx.createOscillator();
        const snareGain = this.ctx.createGain();
        snareOsc.type = 'triangle';
        snareOsc.frequency.setValueAtTime(type === 'desi_dholak_beat' ? 320 : 600, t);
        snareGain.gain.setValueAtTime(0.12, t);
        snareGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        snareOsc.connect(snareGain);
        snareGain.connect(this.bgmGain);
        snareOsc.start(t);
        snareOsc.stop(t + 0.06);
      }

      step++;
    }, stepDuration * 1000);
  }

  public stopBGM() {
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    this.isBgmPlaying = false;
  }

  // --- TEXT TO SPEECH (VOICEOVER) ---
  public speakText(text: string, options?: { pitch?: number; rate?: number; lang?: string; onEnd?: () => void }) {
    if (!('speechSynthesis' in window) || !text || this.isMuted) {
      options?.onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // cancel any previous utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = options?.pitch ?? 1.1; // slightly higher cartoon pitch
      utterance.rate = options?.rate ?? 1.05;
      utterance.lang = options?.lang ?? 'hi-IN';

      // Pick best voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const matchingVoice = voices.find(v => v.lang.startsWith(utterance.lang) || v.lang.includes('hi') || v.lang.includes('en'));
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      if (options?.onEnd) {
        utterance.onend = () => options.onEnd?.();
        utterance.onerror = () => options.onEnd?.();
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
      options?.onEnd?.();
    }
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioEngine = new AudioEngine();
