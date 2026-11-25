import type { Mood } from './types';

type Mode = 'shop' | 'runway' | 'off';
type Quality = 'maj' | 'min' | '7' | 'maj7' | 'min7';
type Drum = 'pop' | 'lofi' | 'bossa' | 'waltz' | 'house' | 'ambient' | 'fanfare' | 'funk';
type Lead = 'bell' | 'rhodes' | 'flute' | 'box' | 'stab' | 'air' | 'brass' | 'clav';

interface Song {
  title: string;
  liveTitle: string;
  bpm: number;
  beats: 3 | 4;
  swing: number;
  root: number;
  scale: number[];
  bars: { semi: number; q: Quality }[];
  melody: (number | null)[];
  drum: Drum;
  lead: Lead;
  energy: number;
  crackle?: boolean;
}

const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const MINOR = [0, 2, 3, 5, 7, 8, 10];
const MIXO = [0, 2, 4, 5, 7, 9, 10];

const TONES: Record<Quality, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
};

const SONGS: Record<Mood, Song> = {
  sparkly: {
    title: 'Glitter Hour',
    liveTitle: 'Glitter Hour Live',
    bpm: 126,
    beats: 4,
    swing: 0,
    root: 69,
    scale: MAJOR,
    bars: [
      { semi: 0, q: 'maj' },
      { semi: 9, q: 'min' },
      { semi: 5, q: 'maj' },
      { semi: 7, q: 'maj' },
    ],
    melody: [4, 4, 7, null, 4, 2, 4, 5, 7, 4, 2, 0, null, 2, 4, null, 4, 6, 7, 4, 2, null, 0, 2, 4, 7, 9, 7, null, 5, 4, null, 7, 9, 11, 9, 7, 5, 4, 2, 4, 5, 7, 4, 2, 0, null, 4],
    drum: 'pop',
    lead: 'bell',
    energy: 1,
  },
  cozy: {
    title: 'Café Crush',
    liveTitle: 'Café After Dark',
    bpm: 78,
    beats: 4,
    swing: 0.22,
    root: 62,
    scale: MAJOR,
    bars: [
      { semi: 2, q: 'min7' },
      { semi: 7, q: '7' },
      { semi: 0, q: 'maj7' },
      { semi: 0, q: 'maj7' },
    ],
    melody: [2, null, 4, 2, 0, null, null, 4, 7, null, 4, 2, 0, null, -1, 0, 2, null, 4, 5, 4, null, 2, 0, 4, null, 2, 0, null, null, 2, 4],
    drum: 'lofi',
    lead: 'rhodes',
    energy: 0.8,
    crackle: true,
  },
  floral: {
    title: 'Jardin Noon',
    liveTitle: 'Garden Lights',
    bpm: 108,
    beats: 4,
    swing: 0.06,
    root: 67,
    scale: MAJOR,
    bars: [
      { semi: 0, q: 'maj7' },
      { semi: 9, q: 'min7' },
      { semi: 2, q: 'min7' },
      { semi: 7, q: '7' },
    ],
    melody: [0, null, 4, null, 7, 4, null, 2, 0, null, 4, 7, null, 9, 7, 4, 2, null, 4, null, 5, 4, 2, 0, 4, null, 7, null, 4, 2, 0, null],
    drum: 'bossa',
    lead: 'flute',
    energy: 0.85,
  },
  twirl: {
    title: 'Music-Box Waltz',
    liveTitle: 'Waltz, Faster',
    bpm: 96,
    beats: 3,
    swing: 0,
    root: 65,
    scale: MAJOR,
    bars: [
      { semi: 0, q: 'maj' },
      { semi: 7, q: 'maj' },
      { semi: 9, q: 'min' },
      { semi: 5, q: 'maj' },
    ],
    melody: [4, null, 7, 4, null, 2, 0, null, 4, 7, null, 4, 9, null, 7, 5, null, 4, 2, null, 4, 5, null, 7, 4, null, 2, 0, null, 4],
    drum: 'waltz',
    lead: 'box',
    energy: 0.75,
  },
  bold: {
    title: 'Runway Glow',
    liveTitle: 'Runway Glow',
    bpm: 122,
    beats: 4,
    swing: 0,
    root: 64,
    scale: MINOR,
    bars: [
      { semi: 0, q: 'min' },
      { semi: 8, q: 'maj' },
      { semi: 3, q: 'maj' },
      { semi: 10, q: 'maj' },
    ],
    melody: [0, 0, 3, 0, 7, null, 3, 5, 7, 3, 0, null, 7, 8, 7, 5, 0, 3, 5, 7, 8, 7, 5, 3, 7, 10, 8, 7, 5, 3, 0, null],
    drum: 'house',
    lead: 'stab',
    energy: 1.05,
  },
  soft: {
    title: 'Cloud Silk',
    liveTitle: 'Silk Spotlight',
    bpm: 80,
    beats: 4,
    swing: 0,
    root: 60,
    scale: MAJOR,
    bars: [
      { semi: 9, q: 'min7' },
      { semi: 5, q: 'maj7' },
      { semi: 0, q: 'maj7' },
      { semi: 7, q: 'maj' },
    ],
    melody: [2, null, null, 4, null, 7, null, null, 4, null, 2, null, 0, null, null, 4, 7, null, null, 4, null, 2, 0, null, 4, null, null, 2, null, 0, null, null],
    drum: 'ambient',
    lead: 'air',
    energy: 0.7,
  },
  cape: {
    title: 'Little Fanfare',
    liveTitle: 'Fanfare Lights',
    bpm: 104,
    beats: 4,
    swing: 0,
    root: 58,
    scale: MAJOR,
    bars: [
      { semi: 0, q: 'maj' },
      { semi: 7, q: 'maj' },
      { semi: 9, q: 'min' },
      { semi: 5, q: 'maj' },
    ],
    melody: [0, 4, 7, null, 7, 4, 0, 4, 7, 11, 7, null, 4, 7, 9, 7, 5, 4, 2, 0, 4, 7, 4, 0, 7, 4, 0, null, 4, 7, 12, null],
    drum: 'fanfare',
    lead: 'brass',
    energy: 0.95,
  },
  party: {
    title: 'Party Zip',
    liveTitle: 'Party Peak',
    bpm: 114,
    beats: 4,
    swing: 0.16,
    root: 65,
    scale: MIXO,
    bars: [
      { semi: 0, q: '7' },
      { semi: 0, q: '7' },
      { semi: 5, q: '7' },
      { semi: 0, q: '7' },
    ],
    melody: [0, null, 4, 7, null, 4, 0, 3, 4, null, 7, 4, 0, null, 7, 10, 7, 4, 3, 0, null, 4, 7, 4, 0, 3, 4, 7, null, 4, 0, null],
    drum: 'funk',
    lead: 'clav',
    energy: 1,
  },
};

/** Game-show beds: a lobby theme plus one flavor per stage theme. */
const SHOW_SONGS: Record<string, Song> = {
  lobby: {
    title: 'Spotlight Fanfare',
    liveTitle: 'Spotlight Fanfare Live',
    bpm: 118,
    beats: 4,
    swing: 0,
    root: 67,
    scale: MAJOR,
    bars: [
      { semi: 0, q: 'maj' },
      { semi: 9, q: 'min' },
      { semi: 5, q: 'maj' },
      { semi: 7, q: '7' },
    ],
    melody: [4, null, 4, 5, 7, null, 4, null, 9, null, 7, 5, 4, null, 2, null, 5, null, 5, 7, 9, null, 5, null, 7, 9, 11, 9, 7, null, null, null],
    drum: 'fanfare',
    lead: 'brass',
    energy: 1,
  },
  fairy: {
    title: 'Petal Waltz',
    liveTitle: 'Petal Waltz Live',
    bpm: 132,
    beats: 3,
    swing: 0,
    root: 72,
    scale: MAJOR,
    bars: [
      { semi: 0, q: 'maj7' },
      { semi: 5, q: 'maj7' },
      { semi: 9, q: 'min7' },
      { semi: 7, q: 'maj' },
    ],
    melody: [4, 7, 9, 7, 4, null, 5, 9, 11, 9, 5, null, 2, 4, 7, 4, 2, 0, 4, null, 2, null, null, null],
    drum: 'waltz',
    lead: 'flute',
    energy: 0.85,
  },
  mermaid: {
    title: 'Lagoon Shimmer',
    liveTitle: 'Lagoon Shimmer Live',
    bpm: 100,
    beats: 4,
    swing: 0.1,
    root: 65,
    scale: MAJOR,
    bars: [
      { semi: 0, q: 'maj7' },
      { semi: 2, q: 'min7' },
      { semi: 4, q: 'min7' },
      { semi: 2, q: 'min7' },
    ],
    melody: [7, null, 6, 4, null, 2, 4, null, 7, null, 9, 7, null, 4, null, null, 6, null, 4, 2, null, 1, 2, null, 4, null, 2, 0, null, null, null, null],
    drum: 'bossa',
    lead: 'bell',
    energy: 0.85,
  },
  space: {
    title: 'Starlight Pop',
    liveTitle: 'Starlight Pop Live',
    bpm: 124,
    beats: 4,
    swing: 0,
    root: 69,
    scale: MINOR,
    bars: [
      { semi: 0, q: 'min' },
      { semi: 8, q: 'maj' },
      { semi: 3, q: 'maj' },
      { semi: 10, q: 'maj' },
    ],
    melody: [7, 7, null, 9, 7, null, 4, null, 7, 7, null, 11, 9, null, 7, null, 4, 4, null, 6, 4, null, 2, null, 4, 7, 9, 7, 4, null, 2, null],
    drum: 'house',
    lead: 'stab',
    energy: 1.1,
  },
  royal: {
    title: 'Grand Entrance',
    liveTitle: 'Grand Entrance Live',
    bpm: 104,
    beats: 4,
    swing: 0,
    root: 67,
    scale: MAJOR,
    bars: [
      { semi: 0, q: 'maj' },
      { semi: 5, q: 'maj' },
      { semi: 7, q: 'maj' },
      { semi: 0, q: 'maj' },
    ],
    melody: [0, null, 4, null, 7, null, null, 7, 9, 7, 5, 4, 2, null, null, null, 5, null, 9, null, 11, null, null, 9, 7, 9, 7, 5, 4, null, null, null],
    drum: 'fanfare',
    lead: 'brass',
    energy: 1,
  },
  rock: {
    title: 'Neon Stage',
    liveTitle: 'Neon Stage Live',
    bpm: 112,
    beats: 4,
    swing: 0.06,
    root: 64,
    scale: MIXO,
    bars: [
      { semi: 0, q: '7' },
      { semi: 10, q: 'maj' },
      { semi: 5, q: 'maj' },
      { semi: 0, q: '7' },
    ],
    melody: [0, null, 0, 2, 4, null, 6, 4, 7, null, 6, 4, 2, null, 0, null, 0, null, 3, 4, null, 4, 6, 7, 9, 7, 6, 4, null, 2, 0, null],
    drum: 'funk',
    lead: 'clav',
    energy: 1.1,
  },
  candy: {
    title: 'Sugar Skip',
    liveTitle: 'Sugar Skip Live',
    bpm: 116,
    beats: 4,
    swing: 0.2,
    root: 72,
    scale: MAJOR,
    bars: [
      { semi: 0, q: 'maj' },
      { semi: 4, q: 'min' },
      { semi: 5, q: 'maj' },
      { semi: 7, q: '7' },
    ],
    melody: [4, 2, 0, 2, 4, 4, 4, null, 2, 2, 2, null, 4, 7, 7, null, 4, 2, 0, 2, 4, 4, 4, 4, 2, 2, 4, 2, 0, null, null, null],
    drum: 'pop',
    lead: 'box',
    energy: 0.95,
  },
};

function midi(m: number): number {
  return 440 * 2 ** ((m - 69) / 12);
}

function degreeMidi(root: number, scale: number[], degree: number): number {
  const n = scale.length;
  const oct = Math.floor(degree / n);
  const idx = ((degree % n) + n) % n;
  return root + scale[idx] + oct * 12;
}

class BoutiqueAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private sfx: GainNode | null = null;
  private busA: GainNode | null = null;
  private busB: GainNode | null = null;
  private bus: GainNode | null = null;
  private duck: GainNode | null = null;
  private wet: GainNode | null = null;
  private lowpass: BiquadFilterNode | null = null;
  private crackle: AudioBufferSourceNode | null = null;
  private crackleGain: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private timer = 0;
  private step = 0;
  private nextTime = 0;
  private song: Song | null = null;
  private songKey = '';
  private show: { key: string; live: boolean } | null = null;
  private mood: Mood = 'soft';
  private mode: Mode = 'off';
  private muted = false;
  private started = false;
  private voices = 0;
  private light = false;
  private generation = 0;
  onTrack: ((title: string) => void) | null = null;

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
        this.light = window.matchMedia('(pointer: coarse)').matches && Math.min(window.innerWidth, window.innerHeight) < 520;
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 0.9;
        this.master.connect(this.ctx.destination);
        this.music = this.ctx.createGain();
        this.music.gain.value = 0.16;
        this.music.connect(this.master);
        this.sfx = this.ctx.createGain();
        this.sfx.gain.value = 0.85;
        this.sfx.connect(this.master);
        this.duck = this.gain(1);
        this.duck.connect(this.music);
        this.busA = this.gain(1);
        this.busB = this.gain(0.0001);
        this.bus = this.busA;
        this.lowpass = this.ctx.createBiquadFilter();
        this.lowpass.type = 'lowpass';
        this.lowpass.frequency.value = 2800;
        this.lowpass.Q.value = 0.4;
        this.busA.connect(this.lowpass);
        this.busB.connect(this.lowpass);
        this.lowpass.connect(this.duck);
        this.wet = this.gain(this.light ? 0 : 0.18);
        if (!this.light && this.lowpass) {
          const conv = this.ctx.createConvolver();
          conv.buffer = this.impulse();
          this.lowpass.connect(this.wet);
          this.wet.connect(conv);
          conv.connect(this.music);
        }
        this.crackleGain = this.gain(0);
        this.crackleGain.connect(this.music);
      } catch {
        this.ctx = null;
        return;
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    this.started = true;
    if (!this.song) {
      if (this.show) this.setShow(this.show.key, this.show.live);
      else this.setBed(this.mood, this.mode === 'runway');
    }
    this.ensureClock();
  }

  setMode(mode: Mode): void {
    this.mode = mode;
    if (mode === 'off') {
      this.fadeBuses();
      this.song = null;
      this.songKey = '';
      return;
    }
    this.setBed(this.mood, mode === 'runway');
  }

  /** Game-show bed: lobby or a stage theme, live (runway remix) or not. */
  setShow(key: string, live: boolean): void {
    this.show = { key, live };
    this.mode = live ? 'runway' : 'shop';
    const base = SHOW_SONGS[key] ?? SHOW_SONGS.lobby;
    const song = live ? this.remix(base) : base;
    const id = `show:${key}:${live ? 'live' : 'set'}`;
    if (!this.started || !this.ctx) return;
    if (this.songKey === id) return;
    this.songKey = id;
    this.crossfade(song);
  }

  /** Short game-show sounds layered over the bed. */
  stinger(kind: 'walk' | 'drumroll' | 'reveal' | 'through' | 'bow' | 'win' | 'paddle'): void {
    if (!this.ctx || !this.started || !this.sfx) return;
    const t0 = this.ctx.currentTime + 0.02;
    const out = this.sfx;
    const arp = (notes: number[], step: number, dur: number, type: OscillatorType, gain: number) =>
      notes.forEach((n, i) => this.tone(midi(n), t0 + i * step, dur, type, gain, out));
    switch (kind) {
      case 'walk':
        this.hit('kick', t0, 0.9);
        this.hit('clap', t0 + 0.2, 0.7);
        this.tone(midi(74), t0 + 0.2, 0.3, 'triangle', 0.05, out, { slide: midi(81) });
        break;
      case 'drumroll':
        for (let i = 0; i < 14; i++) this.hit('snare', t0 + i * 0.07, 0.35 + i * 0.03);
        break;
      case 'reveal':
        arp([67, 71, 74, 79], 0.06, 0.5, 'triangle', 0.05);
        this.hit('open', t0, 0.6);
        break;
      case 'through':
        arp([72, 76, 79, 84, 88], 0.09, 0.4, 'triangle', 0.05);
        this.hit('clap', t0 + 0.36, 0.8);
        break;
      case 'bow':
        arp([65, 69, 72], 0.14, 0.9, 'sine', 0.045);
        window.setTimeout(() => {
          if (!this.ctx) return;
          const t = this.ctx.currentTime + 0.02;
          [60, 64, 67, 72].forEach((n) => this.tone(midi(n), t, 1.2, 'sine', 0.035, out));
        }, 520);
        break;
      case 'win':
        arp([67, 72, 76, 79], 0.12, 0.35, 'sawtooth', 0.03);
        window.setTimeout(() => {
          if (!this.ctx) return;
          const t = this.ctx.currentTime + 0.02;
          [72, 76, 79, 84].forEach((n) => this.tone(midi(n), t, 1.4, 'triangle', 0.04, out, { filter: 2400 }));
          this.hit('open', t, 0.9);
        }, 520);
        break;
      case 'paddle':
        this.hit('rim', t0, 0.8);
        this.tone(midi(84), t0, 0.12, 'sine', 0.04, out);
        break;
    }
  }

  setBed(mood: Mood, runway: boolean): void {
    this.show = null;
    this.mood = mood;
    this.mode = runway ? 'runway' : 'shop';
    const base = SONGS[mood] ?? SONGS.soft;
    const song = runway ? this.remix(base) : base;
    const key = `${mood}:${runway ? 'live' : 'shop'}`;
    if (!this.started || !this.ctx) return;
    if (this.songKey === key) return;
    this.songKey = key;
    this.crossfade(song);
  }

  runwayHit(): void {
    if (!this.ctx || !this.started || !this.music) return;
    const t0 = this.ctx.currentTime + 0.02;
    for (let i = 0; i < 8; i++) {
      const t = t0 + i * (0.09 - i * 0.008);
      this.hit('snare', t, 0.7);
    }
    const end = t0 + 0.7;
    this.tone(midi(this.mood === 'bold' ? 76 : 79), end, 0.35, 'triangle', 0.06, this.music, { slide: midi(this.mood === 'bold' ? 83 : 86) });
    this.noiseAt(end, 0.18, 0.05, 900, 'lowpass', this.music);
  }

  private remix(song: Song): Song {
    return {
      ...song,
      title: song.liveTitle,
      bpm: Math.round(song.bpm * 1.08),
      drum: song.beats === 3 ? 'waltz' : 'house',
      energy: song.energy * 1.3,
      swing: Math.min(song.swing, 0.08),
    };
  }

  private crossfade(song: Song): void {
    if (!this.ctx || !this.busA || !this.busB) return;
    const from = this.bus ?? this.busA;
    const to = from === this.busA ? this.busB : this.busA;
    const now = this.ctx.currentTime;
    to.gain.cancelScheduledValues(now);
    to.gain.setValueAtTime(0.0001, now);
    to.gain.linearRampToValueAtTime(1, now + 1.5);
    from.gain.cancelScheduledValues(now);
    from.gain.setValueAtTime(Math.max(0.0001, from.gain.value), now);
    from.gain.linearRampToValueAtTime(0.0001, now + 1.5);
    this.bus = to;
    this.song = song;
    this.step = 0;
    this.nextTime = now + 0.06;
    this.generation += 1;
    this.syncCrackle(song.crackle === true);
    if (this.lowpass) this.lowpass.frequency.setTargetAtTime(song.lead === 'stab' || song.lead === 'brass' ? 2200 : 3200, now, 0.3);
    this.onTrack?.(song.title);
    this.ensureClock();
  }

  private fadeBuses(): void {
    if (!this.ctx || !this.busA || !this.busB) return;
    const now = this.ctx.currentTime;
    for (const bus of [this.busA, this.busB]) {
      bus.gain.cancelScheduledValues(now);
      bus.gain.setValueAtTime(Math.max(0.0001, bus.gain.value), now);
      bus.gain.linearRampToValueAtTime(0.0001, now + 0.4);
    }
    this.syncCrackle(false);
  }

  private ensureClock(): void {
    if (this.timer || !this.ctx) return;
    this.timer = window.setInterval(() => this.schedule(), 90);
  }

  private schedule(): void {
    if (!this.ctx || !this.song || !this.bus || this.mode === 'off') return;
    const horizon = this.ctx.currentTime + 0.28;
    const song = this.song;
    const gen = this.generation;
    const stepDur = 60 / song.bpm / 4;
    while (this.nextTime < horizon && this.song === song && this.generation === gen) {
      const when = this.nextTime + (this.step % 2 === 1 ? song.swing * stepDur : 0);
      this.playStep(song, this.step, when);
      this.step += 1;
      this.nextTime += stepDur;
    }
  }

  private playStep(song: Song, step: number, time: number): void {
    if (!this.bus || !this.duck) return;
    const perBar = song.beats * 4;
    const inBar = step % perBar;
    const bar = Math.floor(step / perBar);
    const chord = song.bars[bar % song.bars.length];
    const root = song.root + chord.semi;
    if (inBar === 0) {
      this.playBass(song, root, chord.q, time);
      if (!this.light) this.playPad(song, root, chord.q, time);
    }
    if (step % 2 === 0) {
      const eighth = Math.floor(step / 2);
      const note = song.melody[eighth % song.melody.length];
      const phrase = Math.floor(eighth / song.melody.length) % 3;
      if (note !== null) {
        const lift = phrase === 1 && eighth % 4 === 0 ? 12 : phrase === 2 ? 0 : 0;
        const freq = midi(degreeMidi(song.root, song.scale, note) + lift);
        this.playLead(song, freq, time);
      }
    }
    this.playDrum(song, inBar, bar, time);
  }

  private playBass(song: Song, root: number, q: Quality, time: number): void {
    if (!this.duck) return;
    const tones = TONES[q];
    const step = 60 / song.bpm;
    const walk = song.drum === 'funk' || song.drum === 'bossa';
    const notes = walk ? [tones[0], tones[2], tones[1] ?? 4, tones[0] + 12] : [tones[0]];
    notes.forEach((semi, i) => {
      if (!walk && i > 0) return;
      const at = time + (walk ? i * step : 0);
      const f = midi(root + semi - 12);
      if (song.drum === 'house') {
        this.tone(f, at, step * 0.45, 'sawtooth', 0.05 * song.energy, this.bus!, { filter: 280, slide: f * 1.01 });
      } else {
        this.tone(f, at, walk ? step * 0.7 : step * song.beats * 0.7, 'sine', 0.07 * song.energy, this.bus!);
        this.tone(f * 2, at, 0.12, 'triangle', 0.015, this.bus!);
      }
    });
    if (song.beats === 3 && this.bus) {
      this.tone(midi(root + (TONES[q][2] ?? 7) - 12), time + step, step * 1.6, 'sine', 0.04, this.bus);
    }
  }

  private playPad(song: Song, root: number, q: Quality, time: number): void {
    if (!this.bus || song.drum === 'house') return;
    const dur = (60 / song.bpm) * song.beats * 0.92;
    const gain = song.lead === 'air' ? 0.03 : 0.018;
    for (const semi of TONES[q].slice(0, 3)) {
      this.tone(midi(root + semi), time, dur, 'sine', gain * song.energy, this.bus, { filter: 900 });
    }
  }

  private playLead(song: Song, freq: number, time: number): void {
    if (!this.bus) return;
    const dest = this.bus;
    const beat = 60 / song.bpm;
    const g = 0.045 * song.energy;
    if (song.lead === 'bell' || song.lead === 'box') {
      this.tone(freq, time, song.lead === 'box' ? 0.22 : 0.18, 'sine', g, dest);
      this.tone(freq * 2.76, time, 0.08, 'sine', g * 0.25, dest);
      return;
    }
    if (song.lead === 'rhodes') {
      this.tone(freq, time, beat * 0.9, 'sine', g, dest, { filter: 1400 });
      this.tone(freq * 1.003, time, beat * 0.7, 'triangle', g * 0.4, dest, { filter: 1200 });
      return;
    }
    if (song.lead === 'flute') {
      this.tone(freq, time, beat * 0.85, 'triangle', g * 0.8, dest, { filter: 1800 });
      return;
    }
    if (song.lead === 'air') {
      this.tone(freq, time, beat * 1.4, 'sine', g * 0.7, dest, { filter: 1600 });
      return;
    }
    if (song.lead === 'brass') {
      this.tone(freq, time, beat * 0.7, 'sawtooth', g * 0.55, dest, { filter: 900 });
      return;
    }
    if (song.lead === 'clav') {
      this.tone(freq, time, 0.12, 'square', g * 0.4, dest, { filter: 1600 });
      return;
    }
    this.tone(freq, time, 0.16, 'sawtooth', g * 0.35, dest, { filter: 1400 });
  }

  private playDrum(song: Song, inBar: number, bar: number, time: number): void {
    if (!this.bus) return;
    const kick = (step: number) => inBar === step && this.hit('kick', time, song.energy);
    const snare = (step: number) => inBar === step && this.hit('snare', time, song.energy);
    const hat = (step: number, open = false) => inBar === step && this.hit(open ? 'open' : 'hat', time, song.energy);
    if (song.drum === 'pop') {
      kick(0); kick(8);
      snare(4); snare(12);
      if (inBar % 2 === 0) hat(inBar);
    } else if (song.drum === 'house') {
      kick(0); kick(4); kick(8); kick(12);
      if (inBar % 2 === 1) hat(inBar, inBar % 4 === 3);
      if (inBar === 4 || inBar === 12) this.hit('clap', time, song.energy * 0.8);
    } else if (song.drum === 'lofi') {
      kick(0); kick(10);
      snare(8);
      if (inBar === 4 || inBar === 12) hat(inBar);
    } else if (song.drum === 'bossa') {
      kick(0); kick(6); kick(10);
      if (inBar === 4 || inBar === 12) this.hit('rim', time, song.energy);
      if (inBar % 2 === 0) hat(inBar);
    } else if (song.drum === 'waltz') {
      kick(0);
      hat(4); hat(8);
    } else if (song.drum === 'ambient') {
      if (inBar === 0 && bar % 2 === 0) kick(0);
      if (inBar === 8) hat(8, true);
    } else if (song.drum === 'fanfare') {
      kick(0); kick(8);
      if (bar % 4 === 3 && inBar >= 12) this.hit('snare', time, song.energy);
      else if (inBar === 4 || inBar === 12) snare(inBar);
    } else {
      kick(0); if (inBar === 3 || inBar === 6 || inBar === 10) kick(inBar);
      snare(4); snare(12);
      if (inBar % 2 === 0) hat(inBar);
    }
  }

  private hit(kind: 'kick' | 'snare' | 'hat' | 'open' | 'clap' | 'rim', time: number, energy: number): void {
    if (!this.ctx || !this.bus) return;
    if (kind === 'kick') {
      this.tone(150, time, 0.18, 'sine', 0.12 * energy, this.bus, { slide: 48 });
      this.pump(time);
      return;
    }
    if (kind === 'hat' || kind === 'open') {
      this.noiseAt(time, kind === 'open' ? 0.12 : 0.04, 0.025 * energy, 7000, 'highpass', this.bus);
      return;
    }
    if (kind === 'rim') {
      this.tone(880, time, 0.05, 'square', 0.02 * energy, this.bus);
      return;
    }
    this.tone(180, time, 0.12, 'triangle', 0.04 * energy, this.bus);
    this.noiseAt(time, 0.12, 0.04 * energy, kind === 'clap' ? 1200 : 1800, 'bandpass', this.bus);
  }

  private pump(time: number): void {
    if (!this.duck || !this.ctx) return;
    const g = this.duck.gain;
    g.cancelScheduledValues(time);
    g.setValueAtTime(1, time);
    g.linearRampToValueAtTime(0.62, time + 0.03);
    g.linearRampToValueAtTime(1, time + (this.light ? 0.12 : 0.2));
  }

  private tone(
    frequency: number,
    time: number,
    dur: number,
    type: OscillatorType,
    gain: number,
    dest: AudioNode,
    opts?: { slide?: number; filter?: number },
  ): void {
    if (!this.ctx) return;
    if (this.voices >= (this.light ? 10 : 18)) return;
    this.voices += 1;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(40, frequency), time);
    if (opts?.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, opts.slide), time + dur);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(0.05, dur));
    let node: AudioNode = osc;
    if (opts?.filter) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(opts.filter, time);
      osc.connect(filter);
      node = filter;
    }
    node.connect(g);
    g.connect(dest);
    if (this.wet && !this.light && dest !== this.sfx) g.connect(this.wet);
    osc.start(time);
    osc.stop(time + dur + 0.05);
    osc.onended = () => {
      this.voices = Math.max(0, this.voices - 1);
    };
  }

  private noiseAt(time: number, dur: number, gain: number, cutoff: number, kind: BiquadFilterType, dest: AudioNode): void {
    if (!this.ctx) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer();
    src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = kind;
    filter.frequency.value = cutoff;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(dest);
    src.start(time);
    src.stop(time + dur + 0.02);
  }

  private noiseBuffer(): AudioBuffer {
    if (this.noiseBuf && this.ctx) return this.noiseBuf;
    const ctx = this.ctx!;
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuf = buf;
    return buf;
  }

  private impulse(): AudioBuffer {
    const ctx = this.ctx!;
    const length = Math.floor(ctx.sampleRate * 0.7);
    const buf = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const data = buf.getChannelData(c);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2.4;
    }
    return buf;
  }

  private syncCrackle(on: boolean): void {
    if (!this.ctx || !this.crackleGain) return;
    const now = this.ctx.currentTime;
    this.crackleGain.gain.cancelScheduledValues(now);
    this.crackleGain.gain.setTargetAtTime(on ? 0.012 : 0.0001, now, 0.4);
    if (on && !this.crackle) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer();
      src.loop = true;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 4000;
      src.connect(filter);
      filter.connect(this.crackleGain);
      src.start();
      this.crackle = src;
    }
  }

  private gain(value: number): GainNode {
    const node = this.ctx!.createGain();
    node.gain.value = value;
    return node;
  }

  private playNote(frequency: number, dur: number, type: OscillatorType, gain: number, dest?: AudioNode): void {
    if (!this.ctx || !this.sfx) return;
    this.tone(frequency, this.ctx.currentTime, dur, type, gain, dest ?? this.sfx);
  }

  private noise(dur: number, gain: number, cutoff: number, kind: BiquadFilterType): void {
    if (!this.ctx || !this.sfx) return;
    this.noiseAt(this.ctx.currentTime, dur, gain, cutoff, kind, this.sfx);
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
