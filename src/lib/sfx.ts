import { useGame } from "../state/store";

/* Tiny synthesized sound kit, no audio files to load. */
let ctx: AudioContext | null = null;
const ac = () => {
  if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.12, slideTo?: number) {
  const a = ac();
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, a.currentTime + start);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, a.currentTime + start + dur);
  g.gain.setValueAtTime(0, a.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, a.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dur);
  o.connect(g).connect(a.destination);
  o.start(a.currentTime + start);
  o.stop(a.currentTime + start + dur + 0.02);
}

const SOUNDS = {
  tap: () => tone(660, 0, 0.06, "triangle", 0.06),
  pop: () => tone(420, 0, 0.12, "sine", 0.12, 900),
  good: () => {
    tone(784, 0, 0.12, "triangle", 0.1);
    tone(1175, 0.08, 0.2, "triangle", 0.1);
  },
  bad: () => {
    tone(220, 0, 0.18, "square", 0.05, 140);
  },
  coin: () => {
    tone(988, 0, 0.07, "square", 0.04);
    tone(1319, 0.06, 0.18, "square", 0.04);
  },
  win: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.25, "triangle", 0.09));
  },
  whoosh: () => tone(200, 0, 0.25, "sawtooth", 0.025, 1200),
  bubble: () => tone(300 + Math.random() * 300, 0, 0.08, "sine", 0.05, 900),
};

export type Sfx = keyof typeof SOUNDS;
export function sfx(name: Sfx) {
  if (!useGame.getState().sound) return;
  try {
    SOUNDS[name]();
  } catch {
    /* audio blocked, ignore */
  }
}
