import { SONGS, noteToFreq, holeFor } from "./songs.js";
import { ensureAudio, setBreathLevel, Voice, sparkle, levelUpSfx } from "./audio.js";
import { burst } from "./fx.js";
import { barChart, lineChart } from "./charts.js";
import { showReview } from "./review.js";
import { DIFFICULTIES, DIFFICULTY_ORDER, STAGES, Battle, judgePhrase, summarize } from "./game.js";
import { avatarSVG, titleFor, newGearAt } from "./avatar.js";
import { recordSVG, recordDiary, recordInsights, Replayer } from "./record.js";
import { setStream, confetti } from "./fx.js";

const $ = (id) => document.getElementById(id);
// 観戦モード（?watch=1）：別のPCの演奏をそのまま映す。操作できず、記録も保存しない
const WATCH = new URLSearchParams(location.search).has("watch");
const MAX_HOLD_SEC = 2.5; // フレーズの最後の音を伸ばせる上限（長いと「一定の音が続くだけ」に聞こえる）

// ---------- 画面 ----------
function show(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
  screen = id;
}
let screen = "home";
let songId = "twinkle";
let diffKey = "beginner";

// ---------- ステージの選択とプレイヤーの成長（ホーム） ----------
let me = { level: 1, exp: 0, next: 80 };
const currentStage = () => STAGES.find((s) => s.song === songId) || STAGES[0];

function renderSongs() {
  $("songs").innerHTML = "";
  for (const st of STAGES) {
    const b = document.createElement("button");
    b.className = `stage-card ${st.bg}` + (st.song === songId ? " selected" : "");
    b.innerHTML = `<span class="stage-no">STAGE ${st.no}</span><b>${st.name}</b>
      <span class="stage-enemy">${st.enemy.name}</span>
      <span class="stage-rec ${me.level >= st.rec ? "ok" : ""}">すいしょう Lv ${st.rec}</span>`;
    b.onclick = () => act("song", { song: st.song });
    $("songs").append(b);
  }
}

function renderMe() {
  $("homeAvatar").innerHTML = avatarSVG(me.level, "good");
  $("homeLv").textContent = `Lv ${me.level}`;
  $("homeTitle").textContent = titleFor(me.level);
  $("homeExp").style.width = `${Math.round((me.exp / me.next) * 100)}%`;
  $("homeNext").textContent = `つぎの レベルまで あと ${me.next - me.exp}`;
  renderSongs();
}

// ---------- 指穴（ボード or キーボード 1〜4） ----------
let holes = [0, 0, 0, 0];
function setHoles(next) {
  holes = next;
  document.querySelectorAll("#holes span").forEach((el, i) => el.classList.toggle("pressed", !!holes[i]));
  player?.onTouch();
}

// ---------- 息の強さ → 音量（その人の最大の息を基準に正規化） ----------
let maxDelta = 120;
function onBreathSample(m) {
  if (m.state === "exhale") maxDelta = Math.max(maxDelta * 0.995, m.delta, 80);
  const level = m.state === "exhale" ? Math.min(1, Math.max(0, m.delta / maxDelta)) : 0;
  setBreathLevel(level, $("followBreath").checked);
  $("meterFill").style.width = `${Math.round(level * 100)}%`;
  breathLevel = level;
  // 吹いている間、笛から敵へ光の粒が流れる（息で攻撃している演出）
  const attacking = screen === "play" && player && player.state === "playing";
  setStream(attacking ? level : 0, player?.battle.origin, player?.battle.target);
  player?.battle.setBreath(attacking ? level : 0);
}

// ---------- 呼吸の波（結果画面用）：演奏中の息の強さを 0.1秒ごとに記録 ----------
let breathLevel = 0;
let trace = [];
let traceTimer = null;
function startTrace() {
  trace = [];
  const t0 = performance.now();
  clearInterval(traceTimer);
  traceTimer = setInterval(() => trace.push([(performance.now() - t0) / 1000, breathLevel]), 100);
}
function stopTrace() { clearInterval(traceTimer); traceTimer = null; }

// ---------- 演奏の進行 ----------
// ready: 吐くのを待つ / playing: 音が進む / paused: 途中で息が切れた / holding: 最後の音を伸ばしている / done
// ゲーム：フレーズが終わるたびに、そのフレーズの息（安定度）と指穴で判定し、敵にダメージを与える。
// 負けても曲は最後まで進む（敵を倒した後の残りはフィナーレ）。
class Player {
  constructor(id, diff) {
    this.song = SONGS[id];
    this.diff = DIFFICULTIES[diff];
    this.phrase = 0;
    this.note = 0;
    this.state = "ready";
    this.voice = null;
    this.timer = null;
    this.hits = 0;
    this.total = 0;
    this.results = [];
    this.combo = 0;
    this.breaths = []; // この回の吐く息（サーバーが再起動しても結果を出せるように、画面側でも覚えておく）
    this.holeStreak = 0; // 指穴が続けて合った回数
    this.resetPhraseStats();
    this.battle = new Battle($("battle"), currentStage(), me);
    this.recent = [];
    this.renderPhrase();
  }

  get notes() { return this.song.phrases[this.phrase]; }
  get beatSec() { return 60 / this.song.bpm; }

  resetPhraseStats() {
    this.phraseBreaths = [];
    this.phraseHits = 0;
    this.phraseTotal = 0;
  }

  exhaleStart() {
    if (this.state === "ready" || this.state === "paused") {
      this.state = "playing";
      prompt(this.battle.defeated ? "フィナーレ ♪" : "ゆっくり吐いて ♪", "exhale");
      this.playNote();
    }
  }

  // 呼吸の調子：直近2回の吐く息の長さと安定度から決める
  updateStatus(ev) {
    if (typeof ev?.duration !== "number" || typeof ev?.stability !== "number") return;
    this.recent = [...this.recent, ev].slice(-2);
    const avg = (k) => this.recent.reduce((s, e) => s + e[k], 0) / this.recent.length;
    const len = Math.min(1, avg("duration") / 6);
    const calm = Math.min(1, avg("stability"));
    const score = (len + calm) / 2;
    const mood = score >= 0.8 ? "great" : score >= 0.62 ? "good" : score >= 0.45 ? "normal" : "rough";
    this.battle.setStatus({ len, calm, mood });
  }

  exhaleEnd(ev) {
    this.updateStatus(ev);
    if (typeof ev?.duration === "number") {
      this.breaths.push({ duration: ev.duration, stability: ev.stability ?? 0.8, mean_delta: ev.mean_delta ?? 150 });
    }
    if (this.state === "playing") {
      this.stopNote();
      this.phraseBreaths.push(ev);
      if (this.diff.missOnCut) {
        // normal 以上：途中で息が切れたら MISS で次のフレーズへ
        this.judge(true);
        this.nextPhrase();
      } else {
        this.state = "paused";
        prompt("すって… 続きからどうぞ", "inhale");
      }
    } else if (this.state === "holding") {
      this.stopNote();
      this.phraseBreaths.push(ev);
      this.judge(false);
      this.nextPhrase();
    }
  }

  // このフレーズを判定して敵にダメージ
  judge(cut) {
    this.auraMax = Math.max(this.auraMax || 0, this.battle.auraLv || 0);
    const stabs = this.phraseBreaths.map((b) => b?.stability).filter((s) => typeof s === "number");
    const stability = stabs.length ? stabs.reduce((a, b) => a + b, 0) / stabs.length : 0.6;
    const hitRatio = this.phraseTotal ? this.phraseHits / this.phraseTotal : 0;
    const r = judgePhrase(this.diff, { stability, cut, hitRatio }, this.song.phrases.length);
    this.results.push(r);
    this.combo = r.tier === "MISS" ? 0 : this.combo + 1;
    this.battle.hit(r, this.combo);
    this.resetPhraseStats();
  }

  playNote() {
    const [name, beats] = this.notes[this.note];
    const hole = holeFor(name);
    const clean = !!holes[hole];
    // hard 以上は正しい穴を押していないと鳴らない
    this.voice = !this.diff.needHole || clean ? new Voice(noteToFreq(name), clean) : null;
    this.currentHit = clean;
    this.renderNote();
    if (clean) this.holeHit(hole);

    const last = this.note === this.notes.length - 1;
    this.timer = setTimeout(() => {
      this.countNote();
      if (last) {
        // 吐き続けている限り最後の音を伸ばす（上限あり）
        this.state = "holding";
        prompt("のばして〜", "exhale");
        this.voice?.fade(MAX_HOLD_SEC); // 伸ばしている間に、だんだん小さくして自然に終わる
        this.timer = setTimeout(() => { this.stopNote(); this.judge(false); this.nextPhrase(); }, MAX_HOLD_SEC * 1000);
      } else {
        this.stopNote(0.04);
        this.note += 1;
        this.playNote();
      }
    }, beats * this.beatSec * 1000);
  }

  // 音の途中で正しい穴を押したら、その音を「きれい」に格上げする（hard 以上はここで鳴り始める）
  onTouch() {
    if (this.state !== "playing" || this.currentHit) return;
    const name = this.notes[this.note][0];
    if (holes[holeFor(name)]) {
      this.currentHit = true;
      if (!this.voice) this.voice = new Voice(noteToFreq(name), true);
      this.renderNote();
      this.holeHit(holeFor(name));
    }
  }

  countNote() {
    this.total += 1;
    this.phraseTotal += 1;
    if (this.currentHit) { this.hits += 1; this.phraseHits += 1; } else this.holeStreak = 0;
    this.noteHit[this.note] = !!this.currentHit;
  }

  // 指穴がタイミングよく合った：穴と目印から、穴の色の光をはじけさせる
  holeHit(i) {
    this.holeStreak += 1;
    const n = this.holeStreak;
    const color = HOLE_COLORS[i];
    sparkle(n);
    const holeEl = document.querySelectorAll("#holes span")[i];
    const noteEl = $("noteRow").children[this.note];
    if (holeEl) {
      burst(holeEl, { colors: [color, "#ffffff", color, "#fff3b0"], count: Math.min(80, 36 + n * 6), speed: 520 + Math.min(n, 8) * 40, size: 7, stars: true, gravity: 380 });
      ring(holeEl, color);
      popText(holeEl, n >= 2 ? `ナイス！ ×${n}` : "ナイス！", color, n);
    }
    if (noteEl) burst(noteEl, { colors: [color, "#ffffff"], count: 22, speed: 360, size: 5, stars: true, gravity: 200 });
  }

  stopNote(release) {
    clearTimeout(this.timer);
    this.voice?.release(release);
    this.voice = null;
  }

  nextPhrase() {
    this.phrase += 1;
    this.note = 0;
    if (this.phrase >= this.song.phrases.length) {
      this.state = "done";
      finish(true);
      return;
    }
    this.state = "ready";
    prompt("すって… 吐いたら次のフレーズ", "inhale");
    this.renderPhrase();
  }

  renderPhrase() {
    this.noteHit = []; // このフレーズの音ごとに、指穴が合ったか
    $("phraseDots").innerHTML = this.song.phrases
      .map((_, i) => `<i class="${i < this.phrase ? "done" : i === this.phrase ? "now" : ""}"></i>`)
      .join("");
    // リズムの目印：押す指穴の番号（1〜4）入りの大きな丸。色も笛の穴と同じにする
    $("noteRow").innerHTML = this.notes.map(([n]) => { const h = holeFor(n) + 1; return `<i class="h${h}">${h}</i>`; }).join("");
    this.renderNote(true);
  }

  renderNote(beforeStart = false) {
    [...$("noteRow").children].forEach((el, i) => {
      el.classList.toggle("played", i < this.note);
      el.classList.toggle("ok", i < this.note && !!this.noteHit[i]);
      el.classList.toggle("now", i === this.note && !beforeStart);
      el.classList.toggle("first", i === this.note && beforeStart); // 吐く前：最初に押す穴を先に見せる
    });
    const hole = holeFor(this.notes[this.note][0]);
    document.querySelectorAll("#holes span").forEach((el, i) => {
      el.classList.toggle("next", this.diff.guide && i === hole);
      el.classList.toggle("hit", i === hole && !beforeStart && this.currentHit);
    });
  }

  summary() { return summarize(this.results, this.battle.defeated); }

  stop() { this.stopNote(); this.state = "done"; }
}

const HOLE_COLORS = ["#ff7a7a", "#ffc857", "#6fdc8c", "#6cb6ff"]; // style.css の --h1〜--h4 と同じ

// 要素から広がる光の輪
function ring(el, color) {
  const r = el.getBoundingClientRect();
  const d = document.createElement("div");
  d.className = "hit-ring";
  d.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;--c:${color}`;
  document.body.append(d);
  setTimeout(() => d.remove(), 700);
}

// 要素の上に浮かび上がる文字（続けて合うほど大きく）
function popText(el, text, color, n) {
  const r = el.getBoundingClientRect();
  const d = document.createElement("div");
  d.className = "hit-pop";
  d.textContent = text;
  d.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top}px;--c:${color};--s:${Math.min(1.6, 1 + n * 0.08)}`;
  document.body.append(d);
  setTimeout(() => d.remove(), 900);
}

function prompt(text, cls) {
  $("prompt").textContent = text;
  $("prompt").className = "prompt " + cls;
}

// ---------- 開始・終了 ----------
let player = null;
let waitRelease = false; // 「吹いて開始」した直後の息は演奏に使わない

function start(byBreath) {
  ensureAudio();
  player = new Player(songId, diffKey);
  const st = currentStage();
  $("songTitle").textContent = `STAGE ${st.no}  ${st.name}（${player.song.title}・${diffKey}）`;
  waitRelease = byBreath;
  prompt("まず、ゆっくり吸って…", "inhale");
  show("play");
  send({ type: "session_start", song: songId });
  startTrace();
}

function finish(completed) {
  if (player && player.state !== "done") player.stop();
  let game = null;
  if (completed && player) {
    const s = player.summary();
    game = {
      difficulty: diffKey,
      tiers: player.results.map((r) => r.tier),
      stage: currentStage().id,
      score: s.score,
      defeated: s.defeated,
      aura_max: Math.max(player.auraMax || 0, player.battle.auraLv || 0),
      trace,
    };
  }
  send({ type: "session_end", completed, game, song: songId, breaths: player?.breaths || [] });
  if (completed) {
    prompt("おつかれさまでした", "exhale");
    // 保険：サーバーから結果が届かない（接続が切れている等）時は、画面側の記録だけで結果画面に進む
    const p = player;
    setTimeout(() => { if (player === p && screen === "play") showResult(localResult(p)); }, 4000);
  } else {
    stopTrace();
    player = null;
    show("home");
  }
}

// サーバーに届かなかった時の結果（経験値・レコードは保存できないので出さない）
function localResult(p) {
  const ex = p.breaths;
  const avg = (k) => (ex.length ? ex.reduce((s, e) => s + e[k], 0) / ex.length : 0);
  return {
    completed: true,
    exhale_count: ex.length,
    exhale_avg_sec: avg("duration"),
    exhale_max_sec: ex.length ? Math.max(...ex.map((e) => e.duration)) : 0,
    stability_avg: avg("stability"),
    duration_sec: trace.length ? trace[trace.length - 1][0] : 0,
    exhales: ex.map((e) => ({ duration: e.duration, stability: e.stability })),
  };
}

function showResult(r) {
  if (player && player.state !== "done") player.stop();
  stopTrace();
  renderPhraseCharts(r.exhales || []);
  renderGameResult(player?.summary());
  renderGrowth(r.growth);
  renderNewRecord(r.record);
  player = null;
  show("result");
  showReview(r, trace);
}

// ---------- 難易度の選択 ----------
function renderDifficulties() {
  $("diffs").innerHTML = "";
  for (const key of DIFFICULTY_ORDER) {
    const d = DIFFICULTIES[key];
    const b = document.createElement("button");
    b.className = "diff" + (key === diffKey ? " selected" : "");
    b.innerHTML = `<b>${d.label}</b><span>${d.desc}</span>`;
    b.onclick = () => act("start", { song: songId, diff: key, byBreath: false });
    $("diffs").append(b);
  }
}
function showDifficulty() {
  renderDifficulties();
  show("difficulty");
}

// ---------- ゲームの結果発表 ----------
function renderGameResult(s) {
  const box = $("gameResult");
  if (!s) { box.hidden = true; return; }
  box.hidden = false;
  $("outcome").textContent = s.defeated ? "勝利！" : "あと少し！ 敵は逃げていった";
  $("outcome").className = "outcome " + (s.defeated ? "is-win" : "is-close");
  if (s.defeated) setTimeout(() => confetti(220), 300);
  $("score").textContent = s.score;
  $("breakdown").innerHTML = Object.entries(s.count)
    .filter(([tier, n]) => n || tier !== "GREAT")
    .map(([tier, n]) => `<span class="${tier.toLowerCase()}">${tier} ${n}</span>`).join("");
  $("lowerBtn").hidden = diffKey === DIFFICULTY_ORDER[0];
}

// ---------- 息のレコード ----------
function renderNewRecord(rec) {
  const box = $("newRecord");
  if (!rec) { box.hidden = true; return; }
  box.hidden = false;
  $("newRecordDisc").innerHTML = recordSVG(rec, { size: 200, cls: "spin-in" });
  $("newRecordDiary").textContent = recordDiary(rec);
  const ins = recordInsights(rec, null);
  $("newRecordNext").innerHTML = ins.next ? `<b>つぎは：</b>${ins.next}` : "";
}

let replayer = null;
let playReplay = () => {};
function showShelf() {
  stopReplay();
  $("player").hidden = true;
  send({ type: "get_records" });
  show("shelf");
}
let shelfList = [];
function renderShelf(list) {
  shelfList = list;
  $("shelfEmpty").hidden = list.length > 0;
  $("shelfGrid").innerHTML = "";
  for (const rec of list) {
    const b = document.createElement("button");
    b.className = "shelf-item";
    b.innerHTML = `<div class="sleeve">${recordSVG(rec, { size: 140 })}</div><span class="diary">${recordDiary(rec)}</span>`;
    b.onclick = () => act("record", { i: list.indexOf(rec) });
    $("shelfGrid").append(b);
  }
}
function openRecord(rec, prev) {
  stopReplay();
  $("player").hidden = false;
  $("playerDisc").innerHTML = recordSVG(rec, { size: 240 });
  $("playerDiary").textContent = recordDiary(rec);
  const ins = recordInsights(rec, prev);
  $("playerFacts").innerHTML = ins.facts.map((f) => `<li>${f}</li>`).join("");
  $("playerNext").innerHTML = ins.next ? `<b>つぎは：</b>${ins.next}` : "";
  $("playerProgress").style.width = "0%";
  $("player").scrollIntoView({ behavior: "smooth", block: "start" });
  $("playerPlay").onclick = () => act("replay");
  playReplay = () => {
    ensureAudio();
    stopReplay();
    const disc = $("playerDisc").querySelector("svg");
    disc.classList.add("spinning");
    replayer = new Replayer(rec, {
      onProgress: (p) => { $("playerProgress").style.width = `${Math.round(p * 100)}%`; },
      onEnd: () => disc.classList.remove("spinning"),
    });
    replayer.play();
  };
}
function stopReplay() {
  replayer?.stop();
  replayer = null;
  $("playerDisc").querySelector("svg")?.classList.remove("spinning");
}

// ---------- 経験値とレベルアップ（続ける理由） ----------
async function renderGrowth(g) {
  const box = $("growth");
  if (!g) { box.hidden = true; return; }
  box.hidden = false;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const lvUp = g.after.level > g.before.level;
  $("growthAvatar").innerHTML = avatarSVG(g.before.level, "good");
  $("growthAvatar").classList.remove("evolve");
  $("growthGain").innerHTML = `けいけんち <b>${g.gained}</b> ポイント かくとく！`;
  $("growthLevel").textContent = `Lv ${g.before.level}`;
  $("growthLines").innerHTML = "";
  $("growthStage").textContent = "";
  const bar = $("growthExp");
  bar.style.transition = "none";
  bar.style.width = `${(g.before.exp / g.before.next) * 100}%`;
  $("growthNext").textContent = "";

  await sleep(3200); // ふりかえりの演出のあとに出す
  for (const line of g.lines) {
    const li = document.createElement("li");
    li.className = "pop";
    li.innerHTML = `<span>${line.label}</span><b>+${line.value}</b>`;
    $("growthLines").append(li);
    await sleep(220);
  }
  if (g.rate !== 1) {
    const li = document.createElement("li");
    li.className = "pop rate";
    li.innerHTML = `<span>なんいど ボーナス</span><b>×${g.rate}</b>`;
    $("growthLines").append(li);
  }
  await sleep(300);
  bar.style.transition = "width 1.2s ease";
  if (lvUp) {
    bar.style.width = "100%";
    await sleep(1300);
    levelUpSfx();
    $("growthLevel").innerHTML = `<span class="lvup">レベルが あがった！</span> Lv ${g.before.level} → <b>Lv ${g.after.level}</b>`;
    $("growthAvatar").innerHTML = avatarSVG(g.after.level, "great");
    $("growthAvatar").classList.add("evolve");
    const gear = [];
    for (let lv = g.before.level + 1; lv <= g.after.level; lv++) if (newGearAt(lv)) gear.push(newGearAt(lv));
    if (gear.length) $("growthLevel").innerHTML += `<br>${gear.join("・")}を てにいれた！（${titleFor(g.after.level)}）`;
    confetti(160);
    bar.style.transition = "none";
    bar.style.width = "0%";
    await sleep(60);
    bar.style.transition = "width 1s ease";
  }
  bar.style.width = `${(g.after.exp / g.after.next) * 100}%`;
  $("growthNext").textContent = `つぎの レベルまで あと ${g.after.next - g.after.exp}`;
  const nextStage = STAGES.find((s) => s.rec > g.after.level) || null;
  $("growthStage").textContent = nextStage
    ? `つぎの もくひょう：STAGE ${nextStage.no} ${nextStage.name}（すいしょう Lv ${nextStage.rec}）`
    : "すべての ステージの すいしょうレベルに とうたつ！";
  me = g.after;
  renderMe();
}

// ---------- グラフ ----------
const pct = (v) => Math.round(v * 100);
const maxOf = (values, floor) => Math.max(floor, Math.ceil(Math.max(0, ...values)));

// 今回の1曲：フレーズ（＝1回の吐く息）ごと。その場で吹いたデータだけで見せられる
function renderPhraseCharts(exhales) {
  const items = exhales.map((e, i) => ({ label: `${i + 1}`, duration: e.duration, stability: e.stability }));
  if (!items.length) {
    $("cPhraseLen").innerHTML = '<p class="note">息の記録がありません（センサーを確認）</p>';
    $("cPhraseStab").innerHTML = "";
    return;
  }
  barChart($("cPhraseLen"), "吐いた長さ（秒）", items.map((d) => ({ label: d.label, value: d.duration })),
    { maxY: maxOf(items.map((d) => d.duration), 6), unit: "秒" });
  barChart($("cPhraseStab"), "息の安定度（%）", items.map((d) => ({ label: d.label, value: pct(d.stability) })),
    { maxY: 100, unit: "%", format: (v) => `${Math.round(v)}` });
}

// 記録：これまでの演奏（本物のデータ）と、日ごとの推移（サンプルは灰色）
function renderHistory(m) {
  const sess = m.sessions || [];
  $("noSessions").hidden = sess.length > 0;
  if (sess.length) {
    const label = (s, i) => `${i + 1}回目`;
    lineChart($("cSessLen"), "平均の吐く長さ（秒）", sess.map((s, i) => ({ label: label(s, i), value: s.exhale_avg_sec })),
      { maxY: maxOf(sess.map((s) => s.exhale_avg_sec), 6), unit: "秒" });
    lineChart($("cSessStab"), "平均の安定度（%）", sess.map((s, i) => ({ label: label(s, i), value: pct(s.stability_avg) })),
      { maxY: 100, unit: "%", format: (v) => `${Math.round(v)}` });
  } else {
    $("cSessLen").innerHTML = "";
    $("cSessStab").innerHTML = "";
  }
  const days = m.days || [];
  const dayLabel = (d) => `${Number(d.date.slice(5, 7))}/${Number(d.date.slice(8, 10))}`;
  lineChart($("cDayLen"), "1日の平均の吐く長さ（秒）", days.map((d) => ({ label: dayLabel(d), value: d.exhale_avg_sec, sample: d.sample })),
    { maxY: maxOf(days.map((d) => d.exhale_avg_sec), 6), unit: "秒" });
  lineChart($("cDayStab"), "1日の平均の安定度（%）", days.map((d) => ({ label: dayLabel(d), value: pct(d.stability_avg), sample: d.sample })),
    { maxY: 100, unit: "%", format: (v) => `${Math.round(v)}` });
}

function showRecords() {
  send({ type: "get_history" });
  show("records");
}

// ---------- 息のイベント（サーバー or スペースキー） ----------
function onExhaleStart() {
  if (screen === "home") {
    // 観戦側は演奏側の合図で始める。息は同じサーバーにつながる全部の画面に届くので、
    // 操作中のウィンドウだけが始める（裏のタブや別のウィンドウが勝手に演奏して音が重ならないように）
    if (!WATCH && document.hasFocus()) act("start", { song: songId, diff: diffKey, byBreath: true });
    return;
  }
  if (screen === "play" && player && !waitRelease) player.exhaleStart();
}
function onExhaleEnd(ev = {}) {
  if (screen !== "play" || !player) return;
  if (waitRelease) { waitRelease = false; prompt("吐くと演奏がはじまります", "inhale"); return; }
  player.exhaleEnd(ev);
}

// ---------- サーバーとの通信 ----------
let ws;
const WATCH_BLOCK = new Set(["session_start", "session_end", "breath_key", "mirror"]);
function send(msg) {
  if (WATCH && WATCH_BLOCK.has(msg.type)) return;
  if (ws?.readyState === 1) ws.send(JSON.stringify(msg));
}
function connect() {
  ws = new WebSocket(`ws://${location.host}/ws`);
  ws.onopen = () => send({ type: "get_profile" });
  ws.onclose = () => { setSensor("サーバー未接続", false); setTimeout(connect, 2000); };
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.type === "breath") onBreathSample(m);
    else if (m.type === "breath_event") {
      if (m.event === "exhale_start") onExhaleStart();
      if (m.event === "exhale_end" || m.event === "baseline_reset") onExhaleEnd(m);
    } else if (m.type === "touch" && m.source === "board") setHoles(m.holes);
    else if (m.type === "session_result") { if (player || WATCH) showResult(m); } // 演奏していた画面だけ
    else if (m.type === "session_owner" && !WATCH && player) {
      // 別の画面で演奏が始まった：こちらの演奏は止めてホームへ
      player.stop();
      stopTrace();
      player = null;
      show("home");
    }
    else if (m.type === "history") renderHistory(m);
    else if (m.type === "profile") { me = m; renderMe(); }
    else if (m.type === "records") renderShelf(m.records);
    else if (m.type === "mirror" && WATCH) ACTIONS[m.action]?.(m.data || {});
    else if (m.type === "status") setSensor(m.mock ? "センサー：疑似データ" : m.dps ? "センサー：接続中" : "センサー：未接続", m.dps);
  };
}
function setSensor(text, ok) {
  $("sensor").textContent = text;
  $("sensor").classList.toggle("ok", !!ok);
}

// ---------- キーボード（開発・デモの予備） ----------
let spaceDown = false;
let spaceStart = 0;
let spaceTimer = null;
function spaceDownAct() {
  spaceDown = true;
  spaceStart = performance.now();
  // 本物の息に近い形（立ち上がって、少し揺れながら続く）にする
  clearInterval(spaceTimer);
  spaceTimer = setInterval(() => {
    const t = (performance.now() - spaceStart) / 1000;
    const level = Math.min(1, t / 0.5) * (0.55 + 0.03 * Math.sin(t * 1.5));
    onBreathSample({ state: "exhale", delta: maxDelta * level });
  }, 100);
  onBreathSample({ state: "exhale", delta: maxDelta * 0.1 });
  onExhaleStart();
}
function spaceUpAct({ duration }) {
  spaceDown = false;
  clearInterval(spaceTimer);
  if (screen === "play" && !waitRelease) send({ type: "breath_key", duration });
  onBreathSample({ state: "idle", delta: 0 });
  onExhaleEnd({ stability: 0.8, duration, source: "keyboard" });
}
addEventListener("keydown", (e) => {
  if (WATCH) return;
  if (e.code === "Space" && !e.repeat) {
    e.preventDefault();
    ensureAudio();
    act("spaceDown");
  }
  const i = "1234".indexOf(e.key);
  if (i >= 0 && !holes[i]) act("holes", { holes: holes.map((v, j) => (j === i ? 1 : v)) });
});
addEventListener("keyup", (e) => {
  if (WATCH) return;
  if (e.code === "Space" && spaceDown) act("spaceUp", { duration: (performance.now() - spaceStart) / 1000 });
  const i = "1234".indexOf(e.key);
  if (i >= 0) act("holes", { holes: holes.map((v, j) => (j === i ? 0 : v)) });
});

// ---------- 観戦モード：操作をその場で行い、同時に観戦画面へ流す ----------
const ACTIONS = {
  song: ({ song }) => { songId = song; renderSongs(); },
  difficulty: () => showDifficulty(),
  start: ({ song, diff, byBreath }) => { songId = song; diffKey = diff; start(byBreath); },
  quit: () => finish(false),
  again: () => start(false),
  lower: () => { diffKey = DIFFICULTY_ORDER[Math.max(0, DIFFICULTY_ORDER.indexOf(diffKey) - 1)]; start(false); },
  home: () => { stopReplay(); show("home"); },
  shelf: () => showShelf(),
  records: () => showRecords(),
  record: ({ i }) => openRecord(shelfList[i], shelfList[i + 1]),
  replay: () => { ensureAudio(); playReplay(); },
  stopReplay: () => stopReplay(),
  spaceDown: () => spaceDownAct(),
  spaceUp: (d) => spaceUpAct(d),
  holes: ({ holes: h }) => setHoles(h),
};
function act(action, data = {}) {
  // 先に観戦画面へ流してから、自分で行う（最後の息 → 演奏の終わり、の順番が観戦側でも崩れないように）
  if (!WATCH) send({ type: "mirror", action, data });
  ACTIONS[action](data);
}

if (WATCH) {
  document.body.classList.add("watch");
  const bar = document.createElement("div");
  bar.className = "watch-bar";
  bar.textContent = "観戦モード：演奏している画面をそのまま映しています（画面を1回クリックすると音も出ます）";
  document.body.prepend(bar);
}

// ブラウザはクリック等の操作があるまで音を出せないので、最初の1回の操作で音を有効にする
addEventListener("pointerdown", ensureAudio, { once: true });

$("startBtn").onclick = () => act("difficulty");
$("homeShelfBtn").onclick = () => act("shelf");
$("toShelfBtn").onclick = () => act("shelf");
$("shelfHomeBtn").onclick = () => act("home");
$("playerStop").onclick = () => act("stopReplay");
$("diffBackBtn").onclick = () => act("home");
$("lowerBtn").onclick = () => act("lower");
$("quitBtn").onclick = () => act("quit");
$("againBtn").onclick = () => act("again");
$("homeBtn").onclick = () => act("home");
$("recordsBtn").onclick = () => act("records");
$("homeRecordsBtn").onclick = () => act("records");
$("recordsHomeBtn").onclick = () => act("home");

renderMe();
connect();
