import { SONGS, noteToFreq, holeFor } from "./songs.js";
import { ensureAudio, setBreathLevel, Voice, sparkle } from "./audio.js";
import { barChart, lineChart } from "./charts.js";

const $ = (id) => document.getElementById(id);
const MAX_HOLD_SEC = 6; // フレーズの最後の音を伸ばせる上限

// ---------- 画面 ----------
function show(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
  screen = id;
}
let screen = "home";
let songId = "twinkle";

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
}

// ---------- 演奏の進行 ----------
// ready: 吐くのを待つ / playing: 音が進む / paused: 途中で息が切れた / holding: 最後の音を伸ばしている / done
class Player {
  constructor(id) {
    this.song = SONGS[id];
    this.phrase = 0;
    this.note = 0;
    this.state = "ready";
    this.voice = null;
    this.timer = null;
    this.hits = 0;
    this.total = 0;
    this.renderPhrase();
  }

  get notes() { return this.song.phrases[this.phrase]; }
  get beatSec() { return 60 / this.song.bpm; }

  exhaleStart() {
    if (this.state === "ready" || this.state === "paused") {
      this.state = "playing";
      prompt("ゆっくり吐いて ♪", "exhale");
      this.playNote();
    }
  }

  exhaleEnd() {
    if (this.state === "playing") {
      this.stopNote();
      this.state = "paused";
      prompt("すって… 続きからどうぞ", "inhale");
    } else if (this.state === "holding") {
      this.stopNote();
      this.nextPhrase();
    }
  }

  playNote() {
    const [name, beats] = this.notes[this.note];
    const hole = holeFor(name);
    const clean = !!holes[hole];
    this.voice = new Voice(noteToFreq(name), clean);
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
        this.timer = setTimeout(() => { this.stopNote(); this.nextPhrase(); }, MAX_HOLD_SEC * 1000);
      } else {
        this.stopNote(0.04);
        this.note += 1;
        this.playNote();
      }
    }, beats * this.beatSec * 1000);
  }

  // 音の途中で正しい穴を押したら、その音を「きれい」に格上げする
  onTouch() {
    if (this.state !== "playing" || this.currentHit) return;
    const hole = holeFor(this.notes[this.note][0]);
    if (holes[hole]) {
      this.currentHit = true;
      sparkle();
      this.renderNote();
    }
  }

  countNote() {
    this.total += 1;
    if (this.currentHit) this.hits += 1;
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
      el.classList.toggle("next", i === hole);
      el.classList.toggle("hit", i === hole && !beforeStart && this.currentHit);
    });
  }

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
  player = new Player(songId);
  $("songTitle").textContent = player.song.title;
  waitRelease = byBreath;
  prompt("まず、ゆっくり吸って…", "inhale");
  show("play");
  send({ type: "session_start", song: songId });
}

function finish(completed) {
  if (player && player.state !== "done") player.stop();
  send({ type: "session_end", completed });
  if (completed) {
    prompt("おつかれさまでした", "exhale");
  } else {
    player = null;
    show("home");
  }
}

function showResult(r) {
  const hitRate = player && player.total ? `${player.hits}/${player.total}` : "-";
  $("resultHeadline").textContent = r.exhale_count
    ? `${r.exhale_count}回、ゆっくり息を吐けました`
    : "おつかれさまでした";
  $("rAvg").textContent = r.exhale_avg_sec.toFixed(1);
  $("rMax").textContent = r.exhale_max_sec.toFixed(1);
  $("rStab").textContent = `${Math.round(r.stability_avg * 100)}%`;
  $("rHit").textContent = hitRate;
  renderPhraseCharts(r.exhales || []);
  player = null;
  show("result");
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
function onExhaleEnd() {
  if (screen !== "play" || !player) return;
  if (waitRelease) { waitRelease = false; prompt("吐くと演奏がはじまります", "inhale"); return; }
  player.exhaleEnd();
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
      if (m.event === "exhale_end" || m.event === "baseline_reset") onExhaleEnd();
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
addEventListener("keydown", (e) => {
  if (e.code === "Space" && !e.repeat) {
    e.preventDefault();
    spaceDown = true;
    spaceStart = performance.now();
    ensureAudio();
    onBreathSample({ state: "exhale", delta: maxDelta * 0.6 });
    onExhaleStart();
  }
  const i = "1234".indexOf(e.key);
  if (i >= 0 && !holes[i]) setHoles(holes.map((v, j) => (j === i ? 1 : v)));
});
addEventListener("keyup", (e) => {
  if (e.code === "Space" && spaceDown) {
    spaceDown = false;
    if (screen === "play" && !waitRelease) send({ type: "breath_key", duration: (performance.now() - spaceStart) / 1000 });
    onBreathSample({ state: "idle", delta: 0 });
    onExhaleEnd();
  }
  const i = "1234".indexOf(e.key);
  if (i >= 0) setHoles(holes.map((v, j) => (j === i ? 0 : v)));
});

// ブラウザはクリック等の操作があるまで音を出せないので、最初の1回の操作で音を有効にする
addEventListener("pointerdown", ensureAudio, { once: true });

$("startBtn").onclick = () => start(false);
$("quitBtn").onclick = () => finish(false);
$("againBtn").onclick = () => start(false);
$("homeBtn").onclick = () => show("home");
$("recordsBtn").onclick = showRecords;
$("homeRecordsBtn").onclick = showRecords;
$("recordsHomeBtn").onclick = () => show("home");

renderSongs();
connect();
