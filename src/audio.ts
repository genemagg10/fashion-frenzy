type Mode = 'shop' | 'runway' | 'off';

const SHOP_MELODY = [4, 7, 4, 2, 4, 9, 7, 4, 2, 4, 0, 2, 4, 7, 4, 2];
const RUNWAY_MELODY = [7, 4, 7, 9, 11, 9, 7, 4, 2, 4, 7, 9, 7, 4, 2, 0];

function midi(degree: number, root = 72): number {
  const scale = [0, 2, 4, 7, 9];
  const wrapped = ((degree % 5) + 5) % 5;
  const oct = Math.floor(degree / 5);
  return root + scale[wrapped] + oct * 12;
}

function freq(m: number): number {
  return 440 * 2 ** ((m - 69) / 12);
}

class BoutiqueAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private sfx: GainNode | null = null;
  private timer = 0;
  private step = 0;
  private mode: Mode = 'off';
  private muted = false;
  private started = false;

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (!this.master || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(muted ? 0 : 0.9, now + 0.08);
  }

  unlock(): void {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!this.ctx) {
      try {
        this.ctx = new Ctx();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 0.9;
        this.master.connect(this.ctx.destination);
        this.music = this.ctx.createGain();
        this.music.gain.value = 0.22;
        this.music.connect(this.master);
        this.sfx = this.ctx.createGain();
        this.sfx.gain.value = 0.8;
        this.sfx.connect(this.master);
      } catch {
        this.ctx = null;
        return;
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    this.started = true;
    if (this.mode === 'off') this.setMode('shop');
  }

  setMode(mode: Mode): void {
    if (this.mode === mode && (mode === 'off' || this.timer)) return;
    this.mode = mode;
    if (!this.started || !this.ctx) return;
    if (this.timer) window.clearInterval(this.timer);
    this.timer = 0;
    this.step = 0;
    if (mode === 'off') return;
    const bpm = mode === 'runway' ? 108 : 86;
    const interval = (60 / bpm) * 500;
    this.timer = window.setInterval(() => this.tick(), interval);
  }

  private tick(): void {
    if (!this.ctx || !this.music || this.mode === 'off') return;
    const melody = this.mode === 'runway' ? RUNWAY_MELODY : SHOP_MELODY;
    const degree = melody[this.step % melody.length];
    const root = this.mode === 'runway' ? 74 : 76;
    this.playNote(freq(midi(degree, root)), this.mode === 'runway' ? 0.22 : 0.28, 'triangle', 0.07, this.music);
    if (this.step % 4 === 0) {
      this.playNote(freq(midi(0, this.mode === 'runway' ? 50 : 53)), 0.5, 'sine', 0.05, this.music);
      this.playNote(freq(midi(2, this.mode === 'runway' ? 57 : 60)), 0.5, 'sine', 0.03, this.music);
    }
    if (this.mode === 'runway' && this.step % 2 === 0) {
      this.noise(0.04, 0.03, 1800, 'highpass');
    }
    this.step += 1;
  }

  private playNote(
    frequency: number,
    dur: number,
    type: OscillatorType,
    gain: number,
    dest?: AudioNode,
  ): void {
    if (!this.ctx || !this.sfx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(dest ?? this.sfx);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private noise(dur: number, gain: number, cutoff: number, kind: BiquadFilterType): void {
    if (!this.ctx || !this.sfx) return;
    const t = this.ctx.currentTime;
    const frames = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buffer = this.ctx.createBuffer(1, frames, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = kind;
    filter.frequency.value = cutoff;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.sfx);
    src.start(t);
  }

  tap(): void {
    this.playNote(740, 0.07, 'sine', 0.05);
  }

  page(): void {
    this.noise(0.12, 0.05, 900, 'bandpass');
  }

  pin(): void {
    this.noise(0.05, 0.08, 400, 'lowpass');
    this.playNote(220, 0.06, 'triangle', 0.04);
  }

  snip(): void {
    this.noise(0.08, 0.07, 2500, 'highpass');
  }

  sew(): void {
    this.playNote(520, 0.04, 'square', 0.015);
  }

  chime(): void {
    this.playNote(660, 0.18, 'sine', 0.06);
    window.setTimeout(() => this.playNote(990, 0.22, 'sine', 0.05), 90);
  }

  coin(): void {
    this.playNote(1180, 0.1, 'sine', 0.05);
    window.setTimeout(() => this.playNote(1560, 0.14, 'sine', 0.04), 70);
  }

  sparkle(): void {
    [1240, 1560, 1980].forEach((f, i) => {
      window.setTimeout(() => this.playNote(f, 0.16, 'sine', 0.04), i * 60);
    });
  }

  door(): void {
    this.playNote(784, 0.18, 'sine', 0.05);
    window.setTimeout(() => this.playNote(587, 0.28, 'sine', 0.04), 140);
  }

  cheer(): void {
    this.noise(0.45, 0.06, 800, 'lowpass');
    this.playNote(523, 0.2, 'triangle', 0.04);
  }

  purr(): void {
    if (!this.ctx || !this.sfx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(180, t + 0.15);
    osc.frequency.linearRampToValueAtTime(130, t + 0.35);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    osc.connect(g);
    g.connect(this.sfx);
    osc.start(t);
    osc.stop(t + 0.42);
  }

  flash(): void {
    this.noise(0.05, 0.05, 5000, 'highpass');
  }
}

export const audio = new BoutiqueAudio();
