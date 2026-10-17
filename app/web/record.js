// 息のレコード：1回の演奏を1枚のレコードとして描き、その回の演奏を再生する。
//  溝：外側から内側へのうずまき。その回の呼吸の波で溝がふくらむので、
//      長く安定した呼吸 → なめらかなうねり、乱れた呼吸 → ガタガタの溝 になる。
//  ラベル：ステージの色。オーラが段階3まで届いた回は金色。

import { SONGS, noteToFreq } from "./songs.js";
import { setBreathLevel, Voice } from "./audio.js";

const STAGE_COLOR = { meadow: "#8e7bff", volcano: "#ff9f43" };
const STAGE_NAME = { meadow: "ほしのそうげん", volcano: "よろこびのかざん" };
const TURNS = 16;

export function recordLabel(rec) {
  const d = rec.date ? `${Number(rec.date.slice(5, 7))}/${Number(rec.date.slice(8, 10))}` : "";
  return { date: d, stage: STAGE_NAME[rec.stage] || "", gold: (rec.aura_max || 0) >= 3 };
}

// 1行の日記
export function recordDiary(rec) {
  const { date, stage } = recordLabel(rec);
  const end = rec.defeated ? "たおした！" : "あと すこし";
  return `${date} ${stage}：いき へいきん ${(rec.exhale_avg_sec || 0).toFixed(1)}びょう・しずか ${Math.round((rec.stability_avg || 0) * 100)}%・${end}`;
}

export function recordSVG(rec, { size = 220, cls = "" } = {}) {
  const R = 100;
  const outer = 94, inner = 40;
  const trace = rec.trace?.length ? rec.trace : [[0, 0], [1, 0]];
  const n = Math.max(trace.length, 2);
  const gap = (outer - inner) / TURNS;
  // うずまきを細かく区切り、その位置の息の強さで外側にふくらませる
  const steps = TURNS * 90;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const p = i / steps;
    const v = trace[Math.min(n - 1, Math.floor(p * (n - 1)))][1];
    const theta = p * TURNS * Math.PI * 2 - Math.PI / 2;
    const r = outer - (outer - inner) * p + v * gap * 0.95;
    const x = (R + r * Math.cos(theta)).toFixed(1);
    const y = (R + r * Math.sin(theta)).toFixed(1);
    d += (i ? " L" : "M") + x + "," + y;
  }
  const { date, stage, gold } = recordLabel(rec);
  const color = gold ? "#ffd166" : STAGE_COLOR[rec.stage] || "#5cc2b3";
  return `
<svg viewBox="0 0 200 200" width="${size}" height="${size}" class="record ${cls}" aria-label="${date} ${stage} のレコード">
  <defs>
    <radialGradient id="vinyl${rec.id}" cx="50%" cy="50%" r="50%">
      <stop offset="0.35" stop-color="#202436"/><stop offset="1" stop-color="#0b0d16"/>
    </radialGradient>
    <linearGradient id="sheen${rec.id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0.3" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.12"/><stop offset="0.7" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <circle cx="100" cy="100" r="99" fill="url(#vinyl${rec.id})"/>
  <path d="${d}" fill="none" stroke="${color}" stroke-opacity="0.85" stroke-width="0.9"/>
  <circle cx="100" cy="100" r="99" fill="url(#sheen${rec.id})"/>
  <circle cx="100" cy="100" r="34" fill="${color}"/>
  ${gold ? '<circle cx="100" cy="100" r="34" fill="none" stroke="#fff3b0" stroke-width="2" stroke-dasharray="3 3"/>' : ""}
  <text x="100" y="86" text-anchor="middle" class="rec-label rec-stage">${stage}</text>
  <text x="100" y="118" text-anchor="middle" class="rec-label rec-date">${date}</text>
  <text x="100" y="128" text-anchor="middle" class="rec-label rec-score">${rec.score != null ? `SCORE ${rec.score}` : ""}</text>
  <circle cx="100" cy="100" r="4" fill="#0b0d16"/>
</svg>`;
}

// その回の演奏を再生する：記録した呼吸の波をそのままの速さでたどり、
// 息が流れている間だけ曲が進む（音量もその時の息の強さ）。フレーズの間は、息がいったん止まるまで待つ。
export class Replayer {
  constructor(rec, { onProgress, onEnd } = {}) {
    this.rec = rec;
    this.song = SONGS[rec.song] || SONGS.twinkle;
    this.onProgress = onProgress;
    this.onEnd = onEnd;
  }

  play() {
    this.stop();
    const trace = this.rec.trace || [];
    if (!trace.length) { this.onEnd?.(); return; }
    const beat = 60 / this.song.bpm;
    let phrase = 0, note = 0, noteLeft = 0, waitBreak = false, idx = 0;
    const t0 = performance.now();
    const startT = trace[0][0];
    this.timer = setInterval(() => {
      const now = (performance.now() - t0) / 1000 + startT;
      while (idx < trace.length - 1 && trace[idx + 1][0] <= now) idx++;
      const level = trace[idx][1];
      setBreathLevel(level, true);
      const blowing = level > 0.15;
      this.onProgress?.(idx / (trace.length - 1));

      if (waitBreak) {
        if (!blowing) waitBreak = false;
      } else if (blowing && phrase < this.song.phrases.length) {
        if (!this.voice) {
          const [name, beats] = this.song.phrases[phrase][note];
          this.voice = new Voice(noteToFreq(name), true);
          noteLeft = beats * beat;
        }
        noteLeft -= 0.05;
        if (noteLeft <= 0) {
          this.voice.release(0.04);
          this.voice = null;
          note++;
          if (note >= this.song.phrases[phrase].length) { phrase++; note = 0; waitBreak = true; }
        }
      } else if (!blowing && this.voice) {
        this.voice.release();
        this.voice = null;
      }

      if (idx >= trace.length - 1) {
        this.stop();
        this.onEnd?.();
      }
    }, 50);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
    this.voice?.release();
    this.voice = null;
    setBreathLevel(0, true);
  }
}
