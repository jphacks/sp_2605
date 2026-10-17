import { SONGS, noteToFreq, holeFor } from "./songs.js";
import { ensureAudio, setBreathLevel, Voice, sparkle } from "./audio.js";
import { barChart, lineChart } from "./charts.js";
import { showReview } from "./review.js";
import { DIFFICULTIES, DIFFICULTY_ORDER, Battle, judgePhrase, summarize } from "./game.js";

const $ = (id) => document.getElementById(id);
const MAX_HOLD_SEC = 6; // フレーズの最後の音を伸ばせる上限

// ---------- 画面 ----------
function show(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
  screen = id;
}
let screen = "home";
let songId = "twinkle";
let diffKey = "beginner";

function renderSongs() {
  $("songs").innerHTML = "";
  for (const [id, s] of Object.entries(SONGS)) {
    const b = document.createElement("button");
    b.className = "song" + (id === songId ? " selected" : "");
    b.textContent = s.title;
    b.onclick = () => { songId = id; renderSongs(); };
    $("songs").append(b);
  }
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
    this.resetPhraseStats();
    this.battle = new Battle($("battle"), id);
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

  exhaleEnd(ev) {
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
    const stabs = this.phraseBreaths.map((b) => b?.stability).filter((s) => typeof s === "number");
    const stability = stabs.length ? stabs.reduce((a, b) => a + b, 0) / stabs.length : 0.6;
    const hitRatio = this.phraseTotal ? this.phraseHits / this.phraseTotal : 0;
    const r = judgePhrase(this.diff, { stability, cut, hitRatio }, this.song.phrases.length);
    this.results.push(r);
    this.battle.hit(r);
    this.resetPhraseStats();
  }

  playNote() {
    const [name, beats] = this.notes[this.note];
    const hole = holeFor(name);
    const clean = !!holes[hole];
    // hard 以上は正しい穴を押していないと鳴らない
    this.voice = !this.diff.needHole || clean ? new Voice(noteToFreq(name), clean) : null;
    this.currentHit = clean;
    if (clean) sparkle();
    this.renderNote();

    const last = this.note === this.notes.length - 1;
    this.timer = setTimeout(() => {
      this.countNote();
      if (last) {
        // 吐き続けている限り最後の音を伸ばす（上限あり）
        this.state = "holding";
        prompt("のばして〜", "exhale");
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
      sparkle();
      this.renderNote();
    }
  }

  countNote() {
    this.total += 1;
    this.phraseTotal += 1;
    if (this.currentHit) { this.hits += 1; this.phraseHits += 1; }
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
    $("phraseDots").innerHTML = this.song.phrases
      .map((_, i) => `<i class="${i < this.phrase ? "done" : i === this.phrase ? "now" : ""}"></i>`)
      .join("");
    $("noteRow").innerHTML = this.notes.map(() => "<i></i>").join("");
    this.renderNote(true);
  }

  renderNote(beforeStart = false) {
    [...$("noteRow").children].forEach((el, i) => {
      el.className = i < this.note ? "played" : i === this.note && !beforeStart ? "now" : "";
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
  $("songTitle").textContent = `${player.song.title}（${diffKey}）`;
  waitRelease = byBreath;
  prompt("まず、ゆっくり吸って…", "inhale");
  show("play");
  send({ type: "session_start", song: songId });
  startTrace();
}

function finish(completed) {
  if (player && player.state !== "done") player.stop();
  send({ type: "session_end", completed });
  if (completed) {
    prompt("おつかれさまでした", "exhale");
  } else {
    stopTrace();
    player = null;
    show("home");
  }
}

function showResult(r) {
  stopTrace();
  renderPhraseCharts(r.exhales || []);
  renderGameResult(player?.summary());
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
    b.onclick = () => { diffKey = key; start(false); };
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
  $("outcome").className = "outcome " + (s.defeated ? "win" : "close");
  $("score").textContent = s.score;
  $("breakdown").innerHTML = Object.entries(s.count)
    .filter(([tier, n]) => n || tier !== "GREAT")
    .map(([tier, n]) => `<span class="${tier.toLowerCase()}">${tier} ${n}</span>`).join("");
  $("lowerBtn").hidden = diffKey === DIFFICULTY_ORDER[0];
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
  if (screen === "home") { start(true); return; }
  if (screen === "play" && player && !waitRelease) player.exhaleStart();
}
function onExhaleEnd(ev = {}) {
  if (screen !== "play" || !player) return;
  if (waitRelease) { waitRelease = false; prompt("吐くと演奏がはじまります", "inhale"); return; }
  player.exhaleEnd(ev);
}

// ---------- サーバーとの通信 ----------
let ws;
function send(msg) { if (ws?.readyState === 1) ws.send(JSON.stringify(msg)); }
function connect() {
  ws = new WebSocket(`ws://${location.host}/ws`);
  ws.onclose = () => { setSensor("サーバー未接続", false); setTimeout(connect, 2000); };
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.type === "breath") onBreathSample(m);
    else if (m.type === "breath_event") {
      if (m.event === "exhale_start") onExhaleStart();
      if (m.event === "exhale_end" || m.event === "baseline_reset") onExhaleEnd(m);
    } else if (m.type === "touch" && m.source === "board") setHoles(m.holes);
    else if (m.type === "session_result") showResult(m);
    else if (m.type === "history") renderHistory(m);
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
addEventListener("keydown", (e) => {
  if (e.code === "Space" && !e.repeat) {
    e.preventDefault();
    spaceDown = true;
    spaceStart = performance.now();
    ensureAudio();
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
  const i = "1234".indexOf(e.key);
  if (i >= 0 && !holes[i]) setHoles(holes.map((v, j) => (j === i ? 1 : v)));
});
addEventListener("keyup", (e) => {
  if (e.code === "Space" && spaceDown) {
    spaceDown = false;
    clearInterval(spaceTimer);
    if (screen === "play" && !waitRelease) send({ type: "breath_key", duration: (performance.now() - spaceStart) / 1000 });
    onBreathSample({ state: "idle", delta: 0 });
    onExhaleEnd({ stability: 0.8, source: "keyboard" });
  }
  const i = "1234".indexOf(e.key);
  if (i >= 0) setHoles(holes.map((v, j) => (j === i ? 0 : v)));
});

// ブラウザはクリック等の操作があるまで音を出せないので、最初の1回の操作で音を有効にする
addEventListener("pointerdown", ensureAudio, { once: true });

$("startBtn").onclick = showDifficulty;
$("diffBackBtn").onclick = () => show("home");
$("lowerBtn").onclick = () => { diffKey = DIFFICULTY_ORDER[Math.max(0, DIFFICULTY_ORDER.indexOf(diffKey) - 1)]; start(false); };
$("quitBtn").onclick = () => finish(false);
$("againBtn").onclick = () => start(false);
$("homeBtn").onclick = () => show("home");
$("recordsBtn").onclick = showRecords;
$("homeRecordsBtn").onclick = showRecords;
$("recordsHomeBtn").onclick = () => show("home");

renderSongs();
connect();
