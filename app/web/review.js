// ふりかえり（結果画面）：数字を「わかる」に変える。
// 課題①「正しくできているかわからない」→ 変化の一言・呼吸の波・目安との判定・次へのひとこと
// 課題②「続かない」→ 前回・自己ベストとの比較

// 判定の基準（仮）。チームで決まったらここだけ変える
export const CRITERIA = {
  exhaleSec: { good: 4.0, ok: 3.0 },     // 平均の吐く長さ（秒）
  stability: { good: 0.7, ok: 0.5 },     // 平均の安定度（0〜1）
  pace: { low: 4, high: 8, okHigh: 10 }, // 1分あたりの呼吸の回数。呼吸法でよく紹介される「1分に6回前後」を目安にする
};

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

function grade(v, { good, ok }) {
  return v >= good ? "good" : v >= ok ? "ok" : "try";
}
function gradePace(v) {
  const c = CRITERIA.pace;
  return v >= c.low && v <= c.high ? "good" : v <= c.okHigh ? "ok" : "try";
}
const MARK = { good: "◎", ok: "○", try: "△" };

// 最初の2回と最後の2回の吐く息を比べる
function change(exhales) {
  if (exhales.length < 3) return null;
  const n = Math.min(2, Math.floor(exhales.length / 2));
  const first = exhales.slice(0, n), last = exhales.slice(-n);
  return {
    sec: mean(last.map((e) => e.duration)) - mean(first.map((e) => e.duration)),
    stab: mean(last.map((e) => e.stability)) - mean(first.map((e) => e.stability)),
  };
}

function headline(r, ch) {
  if (ch && ch.sec >= 0.5) {
    return { html: `最初より、吐く息が<span class="num" data-count="${ch.sec.toFixed(1)}">0.0</span>秒長くなりました`, sub: "吹いているうちに、呼吸が深くなっています" };
  }
  if (ch && ch.stab >= 0.08) {
    return { html: `息の安定度が<span class="num" data-count="${Math.round(ch.stab * 100)}" data-int>0</span>%上がりました`, sub: "だんだん一定の強さで吐けるようになっています" };
  }
  return { html: `<span class="num" data-count="${r.exhale_count}" data-int>0</span>回、ゆっくり息を吐けました`, sub: "最後まで、自分のペースで呼吸できました" };
}

function tip(g) {
  if (g.len === "try" || (g.len === "ok" && g.stab !== "try")) {
    return "次は<b>もう少しゆっくり、長く</b>吐いてみましょう。1つのフレーズを、ひと息で最後まで吹ききるイメージです。";
  }
  if (g.stab !== "good") {
    return "息の強さが少しぶれていました。<b>ストローを軽くくわえて、一定の強さで</b>吐くと、音もきれいに伸びます。";
  }
  return "とても落ち着いた呼吸でした。<b>この吐き方を覚えておく</b>と、作業の合間にも思い出せます。";
}

function badges(r) {
  const out = [];
  if (r.best) {
    if (r.exhale_avg_sec > r.best.exhale_avg_sec) out.push("自己ベスト更新：吐く長さ");
    if (r.stability_avg > r.best.stability_avg) out.push("自己ベスト更新：安定度");
  }
  if (r.prev) {
    const d = Math.round((r.stability_avg - r.prev.stability_avg) * 100);
    if (d > 0) out.push(`前回より安定度 +${d}%`);
    const s = r.exhale_avg_sec - r.prev.exhale_avg_sec;
    if (s >= 0.3) out.push(`前回より +${s.toFixed(1)}秒`);
  }
  if (!r.prev) out.push("はじめての記録");
  return out;
}

// 呼吸の波：1曲分の息の強さ（0〜1）を、なめらかな線で左から右へ描いていく
function drawWave(trace) {
  const svg = $("wave");
  const W = 600, H = 160, top = 12, bottom = 148;
  const pts = trace.length > 1 ? trace : [[0, 0], [1, 0]];
  const t0 = pts[0][0], t1 = pts[pts.length - 1][0] || 1;
  const xy = pts.map(([t, v]) => [((t - t0) / (t1 - t0 || 1)) * W, bottom - Math.min(1, v) * (bottom - top)]);
  // なめらかにする（中点を通る2次ベジェ）
  let d = `M${xy[0][0]},${xy[0][1]}`;
  for (let i = 1; i < xy.length; i++) {
    const [x0, y0] = xy[i - 1], [x1, y1] = xy[i];
    d += ` Q${x0},${y0} ${(x0 + x1) / 2},${(y0 + y1) / 2}`;
  }
  d += ` T${xy.at(-1)[0]},${xy.at(-1)[1]}`;
  svg.innerHTML = `
    <defs>
      <linearGradient id="waveStroke" x1="0" x2="1"><stop offset="0" stop-color="var(--sample)"/><stop offset="1" stop-color="var(--accent)"/></linearGradient>
      <linearGradient id="waveGrad" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient>
      <clipPath id="waveClip"><rect id="waveReveal" x="0" y="0" width="${reduced ? W : 0}" height="${H}"/></clipPath>
    </defs>
    <line class="base" x1="0" x2="${W}" y1="${bottom}" y2="${bottom}"/>
    <g clip-path="url(#waveClip)">
      <path class="wave-fill" d="${d} L${W},${bottom} L0,${bottom} Z"/>
      <path class="wave-line" d="${d}"/>
    </g>`;
  if (!reduced) {
    const rect = svg.querySelector("#waveReveal");
    const start = performance.now(), dur = 2600;
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      rect.setAttribute("width", W * (1 - (1 - p) ** 2));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}

function countUp(root) {
  root.querySelectorAll("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count), isInt = "int" in el.dataset;
    if (reduced) { el.textContent = isInt ? target : target.toFixed(1); return; }
    const start = performance.now(), dur = 1200;
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur), v = target * (1 - (1 - p) ** 3);
      el.textContent = isInt ? Math.round(v) : v.toFixed(1);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function judgeCard(label, value, unit, g, hint) {
  const el = document.createElement("div");
  el.className = "judge reveal";
  el.innerHTML = `<span class="label">${label}</span><span class="value">${value}<small>${unit}</small></span><span class="mark ${g}">${MARK[g]}</span><span class="hint">${hint}</span>`;
  return el;
}

export async function showReview(r, trace) {
  const exhales = r.exhales || [];
  const pace = r.duration_sec > 0 ? r.exhale_count / (r.duration_sec / 60) : 0;
  const g = {
    len: grade(r.exhale_avg_sec, CRITERIA.exhaleSec),
    stab: grade(r.stability_avg, CRITERIA.stability),
    pace: gradePace(pace),
  };

  const h = headline(r, change(exhales));
  $("resultHeadline").innerHTML = h.html;
  $("resultSub").textContent = h.sub;
  countUp($("resultHeadline"));

  const judges = $("judges");
  judges.innerHTML = "";
  judges.append(
    judgeCard("吐く長さ（平均）", r.exhale_avg_sec.toFixed(1), "秒", g.len, `目安 ${CRITERIA.exhaleSec.good}秒以上`),
    judgeCard("息の安定度", Math.round(r.stability_avg * 100), "%", g.stab, `目安 ${Math.round(CRITERIA.stability.good * 100)}%以上`),
  );
  $("tip").innerHTML = tip(g);
  $("badges").innerHTML = "";
  document.querySelectorAll("#result .reveal").forEach((el) => el.classList.remove("show"));

  // 順番に見せる：見出し → 波 → 判定（1つずつ）→ ひとこと → バッジ
  drawWave(trace);
  await sleep(reduced ? 0 : 150);
  document.querySelector("#result .wave-card").classList.add("show");
  await sleep(reduced ? 0 : 1800);
  for (const el of judges.children) {
    el.classList.add("show");
    el.querySelector(".mark").classList.add("pop");
    await sleep(reduced ? 0 : 350);
  }
  $("tip").classList.add("show");
  await sleep(reduced ? 0 : 400);
  for (const text of badges(r)) {
    const b = document.createElement("span");
    b.className = "badge pop";
    b.textContent = text;
    $("badges").append(b);
    await sleep(reduced ? 0 : 250);
  }
}
