// シンプルな SVG グラフ。1つのグラフに1つの軸・1つの系列だけ（単位の違う値は別のグラフにする）。
// 色は CSS 変数：本物のデータ = --accent、サンプル = --sample。数値は最初・最後・最大だけ表示し、詳細はマウスを乗せると出る。

const W = 520;
const H = 180;
const PAD = { top: 22, right: 14, bottom: 30, left: 40 };

function svg(tag, attrs = {}, text) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text !== undefined) el.textContent = text;
  return el;
}

function frame(container, title, maxY, unit) {
  container.innerHTML = "";
  const fig = document.createElement("figure");
  fig.className = "chart";
  const cap = document.createElement("figcaption");
  cap.textContent = title;
  fig.append(cap);
  const root = svg("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": title });
  fig.append(root);
  container.append(fig);

  const plotH = H - PAD.top - PAD.bottom;
  const y = (v) => PAD.top + plotH * (1 - v / maxY);
  // 目盛り：0・半分・最大の3本だけ（控えめに）
  for (const v of [0, maxY / 2, maxY]) {
    root.append(svg("line", { x1: PAD.left, x2: W - PAD.right, y1: y(v), y2: y(v), class: v === 0 ? "axis" : "grid" }));
    root.append(svg("text", { x: PAD.left - 6, y: y(v) + 4, class: "tick", "text-anchor": "end" }, `${+v.toFixed(1)}${unit}`));
  }
  return { root, y, plotW: W - PAD.left - PAD.right, base: y(0) };
}

function labelIndexes(values) {
  const max = values.indexOf(Math.max(...values));
  return new Set([0, values.length - 1, max]);
}

// 棒グラフ：items = [{label, value, sample}]
export function barChart(container, title, items, { maxY, unit = "", format = (v) => v.toFixed(1) }) {
  const { root, y, plotW, base } = frame(container, title, maxY, unit);
  const step = plotW / items.length;
  const bw = Math.min(36, step * 0.6);
  const show = labelIndexes(items.map((d) => d.value));
  items.forEach((d, i) => {
    const cx = PAD.left + step * (i + 0.5);
    const top = y(Math.min(d.value, maxY));
    const g = svg("g", { class: "mark" + (d.sample ? " sample" : "") });
    // 上の角だけ丸く、下は基準線にそろえる
    const h = Math.max(0, base - top);
    const r = Math.min(4, h);
    g.append(svg("path", {
      d: `M${cx - bw / 2},${base} V${top + r} Q${cx - bw / 2},${top} ${cx - bw / 2 + r},${top} H${cx + bw / 2 - r} Q${cx + bw / 2},${top} ${cx + bw / 2},${top + r} V${base} Z`,
    }));
    g.append(svg("rect", { x: cx - step / 2, y: PAD.top, width: step, height: base - PAD.top, class: "hit" }));
    g.append(svg("title", {}, `${d.label}：${format(d.value)}${unit}${d.sample ? "（サンプル）" : ""}`));
    root.append(g);
    root.append(svg("text", { x: cx, y: H - 10, class: "tick", "text-anchor": "middle" }, d.label));
    if (show.has(i)) root.append(svg("text", { x: cx, y: top - 6, class: "value", "text-anchor": "middle" }, format(d.value)));
  });
}

// 折れ線グラフ：items = [{label, value, sample}]。サンプルの区間は灰色の点線
export function lineChart(container, title, items, { maxY, unit = "", format = (v) => v.toFixed(1) }) {
  const { root, y, plotW } = frame(container, title, maxY, unit);
  const step = items.length > 1 ? plotW / (items.length - 1) : 0;
  const pts = items.map((d, i) => ({ ...d, x: PAD.left + (items.length > 1 ? step * i : plotW / 2), y: y(Math.min(d.value, maxY)) }));
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    root.append(svg("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: "series" + (a.sample || b.sample ? " sample" : "") }));
  }
  const show = labelIndexes(items.map((d) => d.value));
  pts.forEach((p, i) => {
    const g = svg("g", { class: "mark" + (p.sample ? " sample" : "") });
    g.append(svg("circle", { cx: p.x, cy: p.y, r: 5, class: "dot" }));
    g.append(svg("circle", { cx: p.x, cy: p.y, r: 14, class: "hit" }));
    g.append(svg("title", {}, `${p.label}：${format(p.value)}${unit}${p.sample ? "（サンプル）" : ""}`));
    root.append(g);
    if (items.length <= 10 || i % Math.ceil(items.length / 8) === 0) {
      root.append(svg("text", { x: p.x, y: H - 10, class: "tick", "text-anchor": "middle" }, p.label));
    }
    if (show.has(i)) root.append(svg("text", { x: p.x, y: p.y - 10, class: "value", "text-anchor": "middle" }, format(p.value)));
  });
}
