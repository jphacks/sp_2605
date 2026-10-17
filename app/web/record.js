// 息のレコード：1回の演奏を1枚のレコードとして描き、その回の演奏を再生する。
// 「1本の輪 ＝ 1回の吐く息」。外側から順に、吐いた順に並ぶ。
//   太さ ＝ 息の長さ ／ 輪のふちのギザギザ ＝ 実際の息のぶれ ／ 色 ＝ 息の安定度（金 > 緑 > 青 > 赤）
//   ラベルの大きな文字 ＝ その回のランク（S/A/B/C）／ ふちの ★ ＝ PERFECT の数
// 1回ごとに模様がはっきり違うので、「次はもっと太く・なめらかに・金色に」と目標にしやすい。

import { SONGS, noteToFreq } from "./songs.js";
import { setBreathLevel, Voice } from "./audio.js";

const STAGE_COLOR = { meadow: "#8e7bff", volcano: "#ff9f43" };
const STAGE_NAME = { meadow: "ほしのそうげん", volcano: "よろこびのかざん" };
// 安定度ごとの輪の色（あとで調整しやすいようにまとめる）
export const RING_COLORS = [
  { min: 0.85, color: "#ffd166", name: "きんいろ" },
  { min: 0.7, color: "#5cc2b3", name: "みどり" },
  { min: 0.5, color: "#6aa8ff", name: "あお" },
  { min: 0, color: "#e8735f", name: "あか" },
];
const BLOW = 0.15; // これより強いと「吐いている」とみなす
const FULL_SEC = 36; // この合計秒数（例：6秒×6回）吐くとレコードがちょうど埋まる

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

export function rankOf(rec) {
  const s = rec.score ?? 0;
  if (s >= 95 && (rec.aura_max || 0) >= 3) return "S";
  if (s >= 85) return "A";
  if (s >= 70) return "B";
  return "C";
}

const ringColor = (st) => RING_COLORS.find((c) => st >= c.min).color;

// 呼吸の波を「吐いた1回ずつ」に分ける
export function breathsOf(rec) {
  const tr = rec.trace || [];
  const out = [];
  let cur = null;
  let low = 0; // 吐いている途中の一瞬の落ち込み（0.3秒まで）は同じ1回の息として扱う
  for (const [t, v] of tr) {
    if (v > BLOW) {
      if (!cur) cur = { start: t, samples: [] };
      cur.samples.push(v);
      cur.end = t;
      low = 0;
    } else if (cur && ++low > 3) {
      out.push(cur);
      cur = null;
      low = 0;
    }
  }
  if (cur) out.push(cur);
  return out
    .filter((b) => b.samples.length >= 3)
    .map((b) => {
      const s = b.samples;
      const cut = Math.floor(s.length / 5);
      const core = s.length >= 5 ? s.slice(cut, s.length - cut) : s;
      const mean = core.reduce((a, x) => a + x, 0) / core.length;
      const sd = Math.sqrt(core.reduce((a, x) => a + (x - mean) ** 2, 0) / core.length);
      return { duration: Math.max(0.1, b.end - b.start), samples: s, mean, steadiness: mean ? Math.max(0, 1 - sd / mean) : 0 };
    });
}

// 1本の輪（ふちは実際の息の強さで波打つ）
function ringPath(cx, rOut, rIn, samples, mean, amp) {
  const N = 160;
  const pt = (r, a) => `${(cx + r * Math.cos(a)).toFixed(1)},${(cx + r * Math.sin(a)).toFixed(1)}`;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    const v = samples[Math.floor((i / N) * (samples.length - 1))];
    d += (i ? " L" : "M") + pt(rOut - Math.abs(v - mean) * amp, a);
  }
  // 内側の円（穴）は半円2つで描く（始点と終点が同じ1本の弧は描かれないため）
  d += ` Z M${pt(rIn, -Math.PI / 2)} A${rIn},${rIn} 0 1 0 ${pt(rIn, Math.PI / 2)} A${rIn},${rIn} 0 1 0 ${pt(rIn, -Math.PI / 2)} Z`;
  return d;
}

export function recordSVG(rec, { size = 220, cls = "" } = {}) {
  const C = 100, outer = 95, inner = 38, gapW = 4;
  const breaths = breathsOf(rec);
  const total = breaths.reduce((a, b) => a + b.duration, 0) || 1;
  const usable = outer - inner - gapW * Math.max(0, breaths.length - 1);
  // 太さは「実際の秒数」で決める（目安：6秒×6回でレコードがちょうど埋まる）。
  // 息が短いと中心の近くが空いたままになるので、「レコードを埋めよう」が次の目標になる
  const perSec = Math.min(usable / FULL_SEC, usable / total);
  let r = outer;
  const rings = breaths.map((b, i) => {
    const w = Math.max(2.2, b.duration * perSec);
    const rIn = Math.max(inner, r - w);
    const path = ringPath(C, r, rIn, b.samples, b.mean, Math.min(w * 1.1, 16));
    const color = ringColor(b.steadiness);
    r = rIn - gapW;
    return `<path d="${path}" fill="${color}" fill-rule="evenodd"><title>${i + 1}かいめ：${b.duration.toFixed(1)}びょう・あんてい ${Math.round(b.steadiness * 100)}%</title></path>`;
  }).join("");
  const perfect = (rec.tiers || []).filter((t) => t === "PERFECT").length;
  const stars = Array.from({ length: perfect }, (_, i) => {
    const a = -Math.PI / 2 + (i - (perfect - 1) / 2) * 0.32;
    return `<text x="${(C + 92 * Math.cos(a)).toFixed(1)}" y="${(C + 92 * Math.sin(a) + 3).toFixed(1)}" text-anchor="middle" class="rec-star">★</text>`;
  }).join("");
  const { date, stage, gold } = recordLabel(rec);
  const label = gold ? "#ffd166" : STAGE_COLOR[rec.stage] || "#5cc2b3";
  const rank = rankOf(rec);
  return `
<svg viewBox="0 0 200 200" width="${size}" height="${size}" class="record ${cls}" aria-label="${date} ${stage} のレコード（ランク${rank}）">
  <defs>
    <radialGradient id="vinyl${rec.id}" cx="50%" cy="50%" r="50%">
      <stop offset="0.35" stop-color="#202436"/><stop offset="1" stop-color="#0b0d16"/>
    </radialGradient>
    <linearGradient id="sheen${rec.id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0.3" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.16"/><stop offset="0.7" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <circle cx="100" cy="100" r="99" fill="url(#vinyl${rec.id})"/>
  ${rings}
  <circle cx="100" cy="100" r="99" fill="url(#sheen${rec.id})" pointer-events="none"/>
  ${stars}
  <circle cx="100" cy="100" r="34" fill="${label}"/>
  ${gold ? '<circle cx="100" cy="100" r="34" fill="none" stroke="#fff3b0" stroke-width="2" stroke-dasharray="3 3"/>' : ""}
  <text x="100" y="78" text-anchor="middle" class="rec-label rec-stage">${stage}</text>
  <text x="100" y="95" text-anchor="middle" class="rec-label rec-rank rank-${rank}">${rank}</text>
  <circle cx="100" cy="101" r="2.2" fill="#0b0d16"/>
  <text x="100" y="114" text-anchor="middle" class="rec-label rec-date">${date}</text>
  <text x="100" y="123" text-anchor="middle" class="rec-label rec-score">${rec.score != null ? `SCORE ${rec.score}` : ""}</text>
</svg>`;
}

// このレコードの特徴と、次の目標（前のレコードがあれば比べる）
export function recordInsights(rec, prev) {
  const bs = breathsOf(rec);
  if (!bs.length) return { facts: [], next: "" };
  const longest = bs.reduce((a, b) => (b.duration > a.duration ? b : a));
  const steadiest = bs.reduce((a, b) => (b.steadiness > a.steadiness ? b : a));
  const rough = bs.filter((b) => b.steadiness < RING_COLORS[2].min).length;
  const goldN = bs.filter((b) => b.steadiness >= RING_COLORS[0].min).length;
  const facts = [
    `いちばん ながい いき：${bs.indexOf(longest) + 1}かいめ（${longest.duration.toFixed(1)}びょう）`,
    `いちばん しずかな いき：${bs.indexOf(steadiest) + 1}かいめ（${Math.round(steadiest.steadiness * 100)}%）`,
    `きんいろの わ：${goldN}ほん ／ あかい わ：${rough}ほん`,
  ];
  if (prev) {
    const d = (rec.exhale_avg_sec || 0) - (prev.exhale_avg_sec || 0);
    const s = Math.round(((rec.stability_avg || 0) - (prev.stability_avg || 0)) * 100);
    facts.push(`まえの レコードより：ながさ ${d >= 0 ? "+" : ""}${d.toFixed(1)}びょう・しずかさ ${s >= 0 ? "+" : ""}${s}%`);
  }
  // つぎの目標：いちばん伸ばせるところを1つ
  const avgDur = bs.reduce((a, b) => a + b.duration, 0) / bs.length;
  let next;
  if (rough > 0) next = `あかい わを なくそう：${bs.findIndex((b) => b.steadiness < RING_COLORS[2].min) + 1}かいめの いきが みだれて いました。いっていの つよさで はいてみよう`;
  else if (avgDur < 4) next = "わを もっと ふとく しよう：1かいの いきを もう すこし ながく はいて、レコードを うめてみよう";
  else if (goldN < bs.length) next = `ぜんぶの わを きんいろに しよう：いまは ${goldN}/${bs.length}ほん`;
  else next = "かんぺきな レコード！ つぎは ちがう ステージや むずかしさで ためしてみよう";
  return { facts, next };
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
