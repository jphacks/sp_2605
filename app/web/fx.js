// 画面全体に重ねるエフェクト（光の粒・紙吹雪・息の流れ・画面の揺れ）。
// 「動きを減らす」設定の人には、粒の数と揺れを大きく減らす。

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
let canvas, ctx;
const parts = [];
const waves = [];
let waveClock = 0;
const NOTES = ["♪", "♫", "♬", "♩"];
const NOTE_COLORS = ["#ffd166", "#ffffff", "#8fd7ff", "#ff9fb0", "#b8f2e6"];
let stream = { level: 0, from: null, to: null };

function ensure() {
  if (canvas) return;
  canvas = document.createElement("canvas");
  canvas.className = "fx-canvas";
  document.body.append(canvas);
  ctx = canvas.getContext("2d");
  const resize = () => {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  };
  addEventListener("resize", resize);
  resize();
  requestAnimationFrame(loop);
}

function center(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  ctx.clearRect(0, 0, innerWidth, innerHeight);

  // 音波の攻撃：吹いている間、オカリナから敵へ「音波の輪」と「音符」が飛ぶ（息が強いほど多く大きく）
  if (stream.level > 0.05 && stream.from && stream.to && !reduced) {
    const a = center(stream.from), b = center(stream.to);
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    waveClock += dt;
    if (waveClock > 0.22 - stream.level * 0.1) {
      waveClock = 0;
      waves.push({ x: a.x, y: a.y, ang, r: 20, max: dist, w: 3 + stream.level * 5 });
    }
    if (Math.random() < 0.25 + stream.level * 0.5) {
      const sp = 380 + Math.random() * 200;
      const a2 = ang + (Math.random() - 0.5) * 0.35;
      parts.push({
        x: a.x, y: a.y, vx: Math.cos(a2) * sp, vy: Math.sin(a2) * sp,
        life: dist / sp, max: dist / sp, size: 22 + stream.level * 20, gravity: 0, drag: 1,
        color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)], glow: true,
        note: NOTES[Math.floor(Math.random() * NOTES.length)], wobble: Math.random() * 6,
      });
    }
  }
  // 音波の輪（敵の方向に開いた弧が広がっていく）
  for (let i = waves.length - 1; i >= 0; i--) {
    const w = waves[i];
    w.r += 520 * dt;
    if (w.r > w.max) { waves.splice(i, 1); continue; }
    ctx.globalAlpha = Math.max(0, 1 - w.r / w.max) * 0.9;
    ctx.strokeStyle = "#ffffff";
    ctx.shadowColor = "#8fd7ff";
    ctx.shadowBlur = 14;
    ctx.lineWidth = w.w;
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.r, w.ang - 0.45, w.ang + 0.45);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.life -= dt;
    if (p.life <= 0) { parts.splice(i, 1); continue; }
    p.vy += (p.gravity ?? 600) * dt;
    p.vx *= p.drag ?? 0.99;
    p.vy *= p.drag ?? 0.99;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.spin !== undefined) p.rot += p.spin * dt;
    const alpha = Math.max(0, p.life / p.max);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    if (p.glow) { ctx.shadowColor = p.color; ctx.shadowBlur = 16; } else { ctx.shadowBlur = 0; }
    if (p.note) {
      ctx.save();
      ctx.translate(p.x, p.y + Math.sin((p.max - p.life) * 12 + p.wobble) * 6);
      ctx.font = `bold ${p.size}px "Segoe UI Symbol", "Noto Music", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(13, 20, 48, 0.6)";
      ctx.strokeText(p.note, 0, 0);
      ctx.fillText(p.note, 0, 0);
      ctx.restore();
    } else if (p.rect) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    } else if (p.star) {
      drawStar(p.x, p.y, p.size * (0.5 + alpha * 0.5));
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.4 + alpha * 0.6), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  requestAnimationFrame(loop);
}

function drawStar(x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

// 息の流れの強さを更新（0〜1）
export function setStream(level, fromEl, toEl) {
  ensure();
  stream = { level, from: fromEl, to: toEl };
}

// 要素の位置から光の粒をはじけさせる
export function burst(el, { count = 40, colors = ["#ffd166"], speed = 520, size = 6, stars = false, gravity = 500 } = {}) {
  ensure();
  const c = center(el);
  const n = reduced ? Math.ceil(count / 5) : count;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = speed * (0.35 + Math.random() * 0.75);
    parts.push({
      x: c.x, y: c.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120,
      life: 0.7 + Math.random() * 0.6, max: 1.3, size: size * (0.6 + Math.random() * 0.8),
      color: colors[i % colors.length], glow: true, star: stars && i % 3 === 0, gravity, drag: 0.97,
      // 当たったときにも音符がはじける
      ...(i % 3 === 1 ? { note: NOTES[i % NOTES.length], size: size * 3.5, wobble: Math.random() * 6 } : {}),
    });
  }
}

// 紙吹雪（勝利）
export function confetti(count = 180) {
  ensure();
  const colors = ["#f2b33d", "#e86a5a", "#5cc2b3", "#5c9ad6", "#b48ae6", "#ffffff"];
  const n = reduced ? 30 : count;
  for (let i = 0; i < n; i++) {
    parts.push({
      x: Math.random() * innerWidth, y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 160, vy: 80 + Math.random() * 220,
      life: 2.6 + Math.random() * 1.4, max: 4, size: 10 + Math.random() * 8,
      color: colors[i % colors.length], rect: true, rot: Math.random() * 6, spin: (Math.random() - 0.5) * 12,
      gravity: 140, drag: 0.995,
    });
  }
}

// 画面（または要素）を揺らす
export function shake(el, strength = 1) {
  if (reduced) return;
  el.style.setProperty("--shake", `${8 * strength}px`);
  el.classList.remove("screen-shake");
  void el.offsetWidth;
  el.classList.add("screen-shake");
}

// 画面全体を一瞬光らせる
export function flash(color = "#ffffff") {
  if (reduced) return;
  const f = document.createElement("div");
  f.className = "fx-flash";
  f.style.background = color;
  document.body.append(f);
  setTimeout(() => f.remove(), 450);
}
