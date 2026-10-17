// アバター「オカリナのせい」：プレイヤー自身の分身。レベルで見た目が成長し、呼吸の調子で表情が変わる。
// 外部の画像は使わず、SVG で描く（オリジナルのキャラクター）。

// レベルごとの成長（この順に装備が増える）
export const GROWTH = [
  { level: 1, title: "ちいさなオカリナ", add: "" },
  { level: 2, title: "ほっぺのオカリナ", add: "ほっぺ" },
  { level: 3, title: "おんぷのせい", add: "うかぶ おんぷ" },
  { level: 5, title: "しきしゃの オカリナ", add: "かんむり" },
  { level: 7, title: "ごせんふの けんじゃ", add: "ごせんふの わ" },
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
    great: '<path d="M44 60 q6 -7 12 0" class="av-line"/><path d="M70 60 q6 -7 12 0" class="av-line"/>',
    good: '<circle cx="50" cy="60" r="5" class="av-ink"/><circle cx="76" cy="60" r="5" class="av-ink"/><circle cx="52" cy="58" r="1.6" fill="#fff"/><circle cx="78" cy="58" r="1.6" fill="#fff"/>',
    normal: '<ellipse cx="50" cy="60" rx="4.5" ry="5.5" class="av-ink"/><ellipse cx="76" cy="60" rx="4.5" ry="5.5" class="av-ink"/>',
    rough: '<path d="M44 58 l12 4" class="av-line"/><path d="M82 58 l-12 4" class="av-line"/>',
  }[mood];
  const mouth = {
    great: '<path d="M55 72 q8 11 16 0 z" class="av-ink"/>',
    good: '<path d="M56 72 q7 6 14 0" class="av-line"/>',
    normal: '<ellipse cx="63" cy="74" rx="5" ry="3.5" class="av-ink"/>',
    rough: '<path d="M56 76 q7 -6 14 0" class="av-line"/>',
  }[mood];
  return `
<svg viewBox="0 0 120 120" class="avatar-svg" aria-label="オカリナのせい Lv${level}">
  ${has(7) ? `<g class="av-aura">${[0, 1, 2, 3, 4].map((i) => `<ellipse cx="62" cy="66" rx="${52 + i * 3}" ry="${40 + i * 3}"/>`).join("")}</g>` : ""}
  ${has(3) ? '<g class="av-notes"><text x="6" y="34">♪</text><text x="96" y="26">♫</text><text x="100" y="92">♪</text></g>' : ""}
  <!-- 吹き口 -->
  <path d="M100 44 q14 -4 16 6 q-2 8 -14 8 z" class="av-body"/>
  <!-- 本体（オカリナのたまご形） -->
  <path d="M18 70 C 18 44, 44 32, 68 34 C 92 36, 108 52, 104 74 C 100 96, 74 104, 52 100 C 30 96, 18 88, 18 70 Z" class="av-body"/>
  <path d="M34 48 q10 -10 26 -10" class="av-shine"/>
  <!-- 指穴 -->
  <circle cx="40" cy="86" r="4" class="av-hole"/><circle cx="56" cy="91" r="4" class="av-hole"/>
  <circle cx="72" cy="91" r="4" class="av-hole"/><circle cx="88" cy="85" r="4" class="av-hole"/>
  ${eyes}
  ${has(2) ? '<ellipse cx="40" cy="70" rx="7" ry="4" class="av-cheek"/><ellipse cx="86" cy="70" rx="7" ry="4" class="av-cheek"/>' : ""}
  ${mouth}
  ${has(5) ? '<path d="M44 32 l6 -14 l7 10 l6 -12 l6 12 l7 -10 l6 14 z" class="av-crown"/>' : ""}
</svg>`;
}
