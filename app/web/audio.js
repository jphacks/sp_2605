// 音を鳴らす部分。あとで本物の楽器の録音素材に差し替える時は、このファイルの Voice だけを差し替える。

let ctx = null;
let master = null; // 息の強さで動く音量

export function ensureAudio() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.6;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
}

// 息の強さ（0〜1）→ 音量。弱い息でもしっかり聞こえ、強い息でもうるさくならないよう幅を抑える。
export function setBreathLevel(level01, followBreath) {
  if (!ctx) return;
  const target = followBreath ? 0.45 + 0.45 * Math.sqrt(level01) : 0.7;
  master.gain.setTargetAtTime(target, ctx.currentTime, 0.12);
}

// 1つの音。clean=true（正しい指穴）だと倍音とビブラートが加わってきれいな音になる。
export class Voice {
  constructor(freq, clean) {
    const t = ctx.currentTime;
    this.out = ctx.createGain();
    this.out.gain.setValueAtTime(0, t);
    this.out.gain.linearRampToValueAtTime(0.5, t + 0.04);
    this.out.connect(master);
    this.oscs = [];

    const base = ctx.createOscillator();
    base.type = "sine";
    base.frequency.value = freq;
    base.connect(this.out);
    this.oscs.push(base);

    if (clean) {
      const over = ctx.createOscillator();
      over.type = "triangle";
      over.frequency.value = freq * 2;
      const overGain = ctx.createGain();
      overGain.gain.value = 0.12;
      over.connect(overGain).connect(this.out);
      this.oscs.push(over);

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 5.5;
      const depth = ctx.createGain();
      depth.gain.value = freq * 0.006;
      lfo.connect(depth).connect(base.frequency);
      this.oscs.push(lfo);
    }
    this.oscs.forEach((o) => o.start(t));
  }

  release(sec = 0.12) {
    const t = ctx.currentTime;
    this.out.gain.cancelScheduledValues(t);
    this.out.gain.setValueAtTime(this.out.gain.value, t);
    this.out.gain.linearRampToValueAtTime(0, t + sec);
    this.oscs.forEach((o) => o.stop(t + sec + 0.02));
  }
}

// 正しい穴を押した時のきらっとした効果音
export function sparkle() {
  if (!ctx) return;
  const t = ctx.currentTime;
  [2093, 2637].forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t + i * 0.05);
    g.gain.exponentialRampToValueAtTime(0.08, t + i * 0.05 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.05 + 0.25);
    o.connect(g).connect(ctx.destination);
    o.start(t + i * 0.05);
    o.stop(t + i * 0.05 + 0.3);
  });
}
