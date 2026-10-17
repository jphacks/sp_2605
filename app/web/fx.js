// 画面全体に重ねるエフェクト（光の粒・紙吹雪・息の流れ・画面の揺れ）。
// 「動きを減らす」設定の人には、粒の数と揺れを大きく減らす。

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
let canvas, ctx;
const parts = [];
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

  // 息の流れ：吹いている間、笛から敵へ光の粒が流れる（息が強いほど多く太く）
  if (stream.level > 0.05 && stream.from && stream.to && !reduced) {
    const a = center(stream.from), b = center(stream.to);
    const n = Math.ceil(stream.level * 4);
    for (let i = 0; i < n; i++) {
      const ang = Math.atan2(b.y - a.y, b.x - a.x) + (Math.random() - 0.5) * 0.5;
      const sp = 520 + Math.random() * 260;
      parts.push({ x: a.x + (Math.random() - 0.5) * 30, y: a.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 0.55, max: 0.55, size: 3 + stream.level * 6, color: Math.random() < 0.3 ? "#ffffff" : "#7fe0cf", glow: true, gravity: 0 });
    }
  }

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
    if (p.rect) {
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
      color: colors[i % colors.length], glow: true, star: stars && i % 2 === 0, gravity, drag: 0.97,
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
