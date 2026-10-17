// アバター「いきのせい」：プレイヤー自身の分身。レベルで見た目が成長し、呼吸の調子で表情が変わる。
// 外部の画像は使わず、SVG で描く（オリジナルのキャラクター）。

// レベルごとの成長（この順に装備が増える）
export const GROWTH = [
  { level: 1, title: "いきのしずく", add: "" },
  { level: 2, title: "ほっぺのしずく", add: "ほっぺ" },
  { level: 3, title: "はねのせい", add: "はね" },
  { level: 5, title: "そよかぜのおうじ", add: "かんむり" },
  { level: 7, title: "おおぞらのせい", add: "オーラ" },
];

export function titleFor(level) {
  return [...GROWTH].reverse().find((g) => level >= g.level).title;
}
// このレベルで新しく増えた装備（なければ null）
export function newGearAt(level) {
  return GROWTH.find((g) => g.level === level && g.add)?.add ?? null;
}

// mood: "great" | "good" | "normal" | "rough"
export function avatarSVG(level = 1, mood = "normal") {
  const has = (n) => level >= n;
  const eyes = {
    great: '<path d="M38 52 q6 -7 12 0" class="av-line"/><path d="M70 52 q6 -7 12 0" class="av-line"/>',
    good: '<circle cx="44" cy="52" r="5" class="av-ink"/><circle cx="76" cy="52" r="5" class="av-ink"/><circle cx="46" cy="50" r="1.6" fill="#fff"/><circle cx="78" cy="50" r="1.6" fill="#fff"/>',
    normal: '<ellipse cx="44" cy="52" rx="4.5" ry="5.5" class="av-ink"/><ellipse cx="76" cy="52" rx="4.5" ry="5.5" class="av-ink"/>',
    rough: '<path d="M38 50 l12 4" class="av-line"/><path d="M82 50 l-12 4" class="av-line"/>',
  }[mood];
  const mouth = {
    great: '<path d="M50 66 q10 12 20 0 z" class="av-ink"/>',
    good: '<path d="M52 66 q8 7 16 0" class="av-line"/>',
    normal: '<ellipse cx="60" cy="68" rx="5" ry="3.5" class="av-ink"/>',
    rough: '<path d="M52 70 q8 -6 16 0" class="av-line"/>',
  }[mood];
  return `
<svg viewBox="0 0 120 120" class="avatar-svg" aria-label="いきのせい Lv${level}">
  ${has(7) ? '<circle cx="60" cy="64" r="56" class="av-aura"/>' : ""}
  ${has(3) ? `<path d="M22 60 q-20 -24 -10 -40 q12 10 22 30 z" class="av-wing"/>
  <path d="M98 60 q20 -24 10 -40 q-12 10 -22 30 z" class="av-wing"/>` : ""}
  <path d="M60 10 C 86 38, 100 56, 100 74 A 40 40 0 0 1 20 74 C 20 56, 34 38, 60 10 Z" class="av-body"/>
  <path d="M44 30 q-10 16 -12 30" class="av-shine"/>
  ${eyes}
  ${has(2) ? '<ellipse cx="34" cy="64" rx="7" ry="4" class="av-cheek"/><ellipse cx="86" cy="64" rx="7" ry="4" class="av-cheek"/>' : ""}
  ${mouth}
  ${has(5) ? '<path d="M42 16 l6 -12 l6 9 l6 -11 l6 11 l6 -9 l6 12 z" class="av-crown"/>' : ""}
</svg>`;
}
