// ゲーム（RPG）の試作：難易度・フレーズごとの判定・ダメージ・敵の表示。
// 数値はすべて仮。チームの計測（TASKS の R07）とヒアリング（R06）で決まったら、ここだけ変える。

// 難易度
//  missOnCut: 途中で息が切れたらそのフレーズは MISS で次へ（false なら続きから吹ける）
//  needHole:  正しい穴を押さないと音が鳴らない
//  guide:     次に押す穴を光らせる
//  perfect / good: 安定度（0〜1）の境目。good 未満は MISS（beginner は MISS なしで GOOD）
export const DIFFICULTIES = {
  beginner: { label: "beginner", desc: "どの穴でも鳴る。息が切れても続きから吹ける。MISS なし", missOnCut: false, needHole: false, guide: true, perfect: 0.7, great: 0.5, good: 0 },
  normal: { label: "normal", desc: "息が切れたら MISS。ガイドどおりに押すとボーナス", missOnCut: true, needHole: false, guide: true, perfect: 0.7, good: 0.45, holeBonus: 3 },
  hard: { label: "hard", desc: "正しい穴を押さないと音が鳴らない", missOnCut: true, needHole: true, guide: true, perfect: 0.7, good: 0.45 },
  expert: { label: "expert", desc: "hard ＋ 光るガイドなし。判定も厳しめ", missOnCut: true, needHole: true, guide: false, perfect: 0.8, good: 0.6 },
};
export const DIFFICULTY_ORDER = ["beginner", "normal", "hard", "expert"];

export const GAME = {
  hp: 100,
  // 6フレーズの曲を基準にしたダメージ。フレーズ数が違う曲は自動で割り戻す（全部 GOOD でちょうど倒せる）
  damage: { PERFECT: 25, GREAT: 21, GOOD: 17, MISS: 0 },
  points: { PERFECT: 100, GREAT: 80, GOOD: 60, MISS: 0 },
  basePhrases: 6,
};

// 敵（イラストはメンバーが描いたものに差し替える予定。今は図形の仮のキャラ）
export const ENEMIES = {
  twinkle: { name: "ほしスライム", color: "#6cc5b0" },
  joy: { name: "よろこびドラゴン", color: "#e6a04b" },
};

// フレーズ1つの判定
//  stability: そのフレーズで吐いた息の安定度（0〜1）／ cut: 途中で息が切れた ／ hitRatio: 正しい穴を押せた割合
export function judgePhrase(diff, { stability, cut, hitRatio }, phraseCount) {
  let tier;
  if (cut && diff.missOnCut) tier = "MISS";
  else if (stability >= diff.perfect) tier = "PERFECT";
  else if (diff.great !== undefined && stability >= diff.great) tier = "GREAT";
  else if (stability >= diff.good) tier = "GOOD";
  else tier = "MISS";

  let damage = GAME.damage[tier];
  if (tier !== "MISS") {
    if (diff.holeBonus && hitRatio >= 0.5) damage += diff.holeBonus;
    if (diff.needHole) damage *= 0.5 + 0.5 * hitRatio; // 鳴らなかった音のぶん弱くなる
  }
  damage = Math.round(damage * GAME.basePhrases / phraseCount);
  return { tier, damage, points: GAME.points[tier] };
}

// 戦闘の表示
export class Battle {
  constructor(root, songId) {
    const enemy = ENEMIES[songId] || { name: "まものスライム", color: "#8fa3a8" };
    this.hp = GAME.hp;
    this.defeated = false;
    root.innerHTML = `
      <div class="enemy-name">${enemy.name}</div>
      <div class="enemy" style="--enemy:${enemy.color}"><div class="eyes"><i></i><i></i></div></div>
      <div class="hpbar"><div class="hpfill"></div></div>
      <span class="hptext">HP ${this.hp}</span>
      <div class="floats"></div>`;
    this.root = root;
    this.enemyEl = root.querySelector(".enemy");
    this.fill = root.querySelector(".hpfill");
    this.text = root.querySelector(".hptext");
    this.floats = root.querySelector(".floats");
  }

  // 判定を表示してダメージを与える。この攻撃で倒したら true
  hit({ tier, damage }) {
    const f = document.createElement("div");
    f.className = `float ${tier.toLowerCase()}`;
    f.innerHTML = `${tier}<b>${damage ? damage : ""}</b>`;
    this.floats.append(f);
    setTimeout(() => f.remove(), 1600);
    if (!damage || this.defeated) return false;

    this.hp = Math.max(0, this.hp - damage);
    this.fill.style.width = `${(this.hp / GAME.hp) * 100}%`;
    this.text.textContent = `HP ${this.hp}`;
    this.enemyEl.classList.remove("shake");
    void this.enemyEl.offsetWidth; // アニメーションをやり直すため
    this.enemyEl.classList.add("shake");
    if (this.hp === 0) {
      this.defeated = true;
      this.enemyEl.classList.add("defeated");
      this.text.textContent = "たおした！ ここからフィナーレ";
      return true;
    }
    return false;
  }
}

// 1曲分のまとめ（結果発表用）
export function summarize(results, defeated) {
  const count = { PERFECT: 0, GREAT: 0, GOOD: 0, MISS: 0 };
  results.forEach((r) => count[r.tier]++);
  const score = results.length ? Math.round(results.reduce((s, r) => s + r.points, 0) / results.length) : 0;
  return { count, score, defeated };
}
