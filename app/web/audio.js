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

// ゲームの効果音（短い合成音）
function tone(freq, start, dur, { type = "square", gain = 0.12, slideTo } = {}) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
  g.gain.setValueAtTime(gain, start);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(start);
  o.stop(start + dur + 0.02);
}

export function hitSfx(tier) {
  if (!ctx) return;
  const t = ctx.currentTime;
  if (tier === "MISS") {
    tone(220, t, 0.25, { type: "triangle", gain: 0.15, slideTo: 110 });
    return;
  }
  // 打撃音
  tone(180, t, 0.12, { type: "square", gain: 0.18, slideTo: 60 });
  if (tier === "PERFECT") {
    [1046, 1318, 1568, 2093].forEach((f, i) => tone(f, t + 0.05 + i * 0.05, 0.25, { type: "triangle", gain: 0.08 }));
  } else if (tier === "GREAT") {
    [880, 1175].forEach((f, i) => tone(f, t + 0.05 + i * 0.06, 0.2, { type: "triangle", gain: 0.07 }));
  } else {
    tone(784, t + 0.05, 0.15, { type: "triangle", gain: 0.06 });
  }
}

export function defeatSfx() {
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(300, t, 0.5, { type: "sawtooth", gain: 0.12, slideTo: 40 });
  [523, 659, 784, 1046].forEach((f, i) => tone(f, t + 0.35 + i * 0.12, 0.35, { type: "square", gain: 0.07 }));
}

export function levelUpSfx() {
  if (!ctx) return;
  const t = ctx.currentTime;
  [[523, 0], [523, 0.12], [523, 0.24], [698, 0.36], [784, 0.6], [1046, 0.84]].forEach(([f, d]) =>
    tone(f, t + d, d < 0.8 ? 0.16 : 0.6, { type: "square", gain: 0.08 }));
}

// 正しい穴を押した時のきらっとした効果音
// streak：続けて合った回数。多いほど少しずつ高く・きらびやかになる
export function sparkle(streak = 1) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const up = 2 ** (Math.min(streak - 1, 7) / 12);
  [1568, 2093, 2637, 3136].forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = i === 0 ? "triangle" : "sine";
    o.frequency.value = f * up;
    const s = t + i * 0.035;
    g.gain.setValueAtTime(0.0001, s);
    g.gain.exponentialRampToValueAtTime(i === 0 ? 0.12 : 0.09, s + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, s + 0.35);
    o.connect(g).connect(ctx.destination);
    o.start(s);
    o.stop(s + 0.4);
  });
}
