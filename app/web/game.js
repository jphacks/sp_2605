import { burst, confetti, shake, flash } from "./fx.js";
import { hitSfx, defeatSfx } from "./audio.js";

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

// 戦闘の表示（ド派手版）
//  判定は画面中央に大きく、ダメージの数字は敵から飛び出す。PERFECT は金色の光と画面の揺れ。
//  連続で成功するとコンボ表示。倒したら爆発・「DEFEATED!」・紙吹雪。
const TIER_FX = {
  PERFECT: { colors: ["#ffd166", "#fff3b0", "#ffffff", "#f2b33d"], count: 90, speed: 700, stars: true, shake: 1.6 },
  GREAT: { colors: ["#5cc2b3", "#b8f2e6", "#ffffff"], count: 55, speed: 560, stars: true, shake: 1 },
  GOOD: { colors: ["#5c9ad6", "#cfe3ff"], count: 35, speed: 460, stars: false, shake: 0.6 },
  MISS: null,
};

export class Battle {
  constructor(root, songId) {
    const enemy = ENEMIES[songId] || { name: "まものスライム", color: "#8fa3a8" };
    this.hp = GAME.hp;
    this.defeated = false;
    root.innerHTML = `
      <div class="enemy-name">${enemy.name}</div>
      <div class="enemy-wrap"><div class="enemy" style="--enemy:${enemy.color}"><div class="eyes"><i></i><i></i></div><div class="mouth"></div></div></div>
      <div class="hpbar"><div class="hpghost"></div><div class="hpfill"></div></div>
      <span class="hptext">HP ${this.hp}</span>
      <div class="judge-banner"></div>
      <div class="combo"></div>
      <div class="dmg-layer"></div>`;
    this.root = root;
    this.enemyEl = root.querySelector(".enemy");
    this.wrap = root.querySelector(".enemy-wrap");
    this.fill = root.querySelector(".hpfill");
    this.ghost = root.querySelector(".hpghost");
    this.text = root.querySelector(".hptext");
    this.banner = root.querySelector(".judge-banner");
    this.comboEl = root.querySelector(".combo");
    this.dmgLayer = root.querySelector(".dmg-layer");
  }

  get target() { return this.enemyEl; }

  // 吹いている間、敵が「効いている」様子で震える
  setBreath(level) {
    this.enemyEl.style.setProperty("--tremble", `${Math.round(level * 4)}px`);
    this.enemyEl.classList.toggle("taking", level > 0.15 && !this.defeated);
  }

  restart(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  // 判定を表示してダメージを与える。この攻撃で倒したら true
  hit({ tier, damage }, combo) {
    // 中央の大きな判定
    this.banner.className = `judge-banner ${tier.toLowerCase()}`;
    this.banner.innerHTML = tier === "MISS" ? "MISS…" : `${tier}!`;
    this.restart(this.banner, "show");
    hitSfx(tier);

    // コンボ
    if (combo >= 2 && tier !== "MISS") {
      this.comboEl.innerHTML = `<b>${combo}</b> COMBO!`;
      this.restart(this.comboEl, "show");
    }

    if (tier === "MISS" || !damage) {
      this.restart(this.enemyEl, "dodge");
      return false;
    }

    // 敵：白く光る・のけぞる・つぶれる
    this.restart(this.enemyEl, tier === "PERFECT" ? "hit-big" : "hit");
    const f = TIER_FX[tier];
    burst(this.enemyEl, f);
    shake(this.root.closest(".screen"), f.shake);
    if (tier === "PERFECT") flash("rgba(255, 220, 120, 0.35)");

    // 敵から飛び出すダメージの数字
    const d = document.createElement("div");
    d.className = `dmg ${tier.toLowerCase()}`;
    d.textContent = damage;
    d.style.setProperty("--dx", `${(Math.random() - 0.5) * 160}px`);
    this.dmgLayer.append(d);
    setTimeout(() => d.remove(), 1400);

    if (this.defeated) return false; // フィナーレ中はダメージ表示だけ

    // HP：先に本体が減り、白い残像が遅れて追いかける
    this.hp = Math.max(0, this.hp - damage);
    const pct = `${(this.hp / GAME.hp) * 100}%`;
    this.fill.style.width = pct;
    setTimeout(() => { this.ghost.style.width = pct; }, 450);
    this.text.textContent = `HP ${this.hp}`;
    this.restart(this.root.querySelector(".hpbar"), "jolt");

    if (this.hp === 0) {
      this.defeated = true;
      setTimeout(() => this.defeat(), 500);
      return true;
    }
    return false;
  }

  defeat() {
    defeatSfx();
    flash("rgba(255,255,255,0.8)");
    burst(this.enemyEl, { colors: ["#ffd166", "#e86a5a", "#ffffff", "#5cc2b3", "#b48ae6"], count: 160, speed: 900, size: 8, stars: true });
    shake(this.root.closest(".screen"), 2.4);
    this.enemyEl.classList.add("defeated");
    this.banner.className = "judge-banner defeat";
    this.banner.textContent = "DEFEATED!";
    this.restart(this.banner, "show");
    this.text.textContent = "たおした！ ここからフィナーレ";
    confetti();
  }
}

// 1曲分のまとめ（結果発表用）
export function summarize(results, defeated) {
  const count = { PERFECT: 0, GREAT: 0, GOOD: 0, MISS: 0 };
  results.forEach((r) => count[r.tier]++);
  const score = results.length ? Math.round(results.reduce((s, r) => s + r.points, 0) / results.length) : 0;
  return { count, score, defeated };
}
