# 技術設計

最終更新：10/17

## 全体構成

```
[DPS368 2GO] --USB(COM4, 9600bps)--+
                                   +--> [Python サーバー app/server]  --WebSocket /ws-->  [ブラウザ app/web]
[PSOC 4100T Plus] --USB(COM3)------+     ・気圧/タッチの受信              ・音を鳴らす（Web Audio）
                                         ・息の判定（吐く/止める/吸う）    ・指穴ガイド・画面
                                         ・演奏の記録と分析・保存          ・結果画面・推移グラフ
                                         ・画面ファイルの配信（http）
```

- 起動は1コマンド：`py app/server/main.py`（ボードなしでも `--mock` で疑似データを流せる）
- ブラウザで `http://localhost:8000/` を開く。画面ファイルと WebSocket は同じポート

## 息の判定（Python：app/server/breath.py）

- **基準値**：起動直後の数サンプルの中央値。その後は「止まっている」間だけゆっくり追従（天気・温度の変化を吸収）
- **状態**：`idle`（止めている）/ `exhale`（吐いている）/ `inhale`（吸っている）
- **しきい値**（H12 の袋の実測から：静止ぶれ0.4Pa、弱く+122Pa、吸う-30Pa）
  - 吐き始め +15Pa 以上、吐き終わり +8Pa 未満（行ったり来たりしないよう差をつける）
  - 吸い始め -12Pa 以下、吸い終わり -6Pa より上
- **強さ** `strength`：0〜1（+300Pa で 1）
- **吐き終わったとき**に、その1回分の「長さ・平均の強さ・安定度」を計算する
  - 安定度 = 1 − (強さのばらつき ÷ 平均)。ゆっくり一定に吐けるほど 1 に近い

## WebSocket のメッセージ（JSON）

Python → ブラウザ

| type | 中身 | いつ |
|---|---|---|
| `breath` | `t`, `pa`, `delta`, `state`, `strength` | 気圧の値が届くたび |
| `breath_event` | `event`(`exhale_start`/`exhale_end`/`inhale_start`/`inhale_end`), `duration`, `mean_delta`, `stability` | 状態が変わったとき |
| `touch` | `holes`: `[0,1,0,0]`（4つの指穴） | タッチが変わったとき |
| `session_result` | 1曲分の集計（下記） | ブラウザが `session_end` を送った後 |
| `history` | 日ごとの集計の配列 | ブラウザが `get_history` を送った後 |
| `status` | `dps`, `touch`（接続中か）, `mock` | 接続直後・変化時 |

ブラウザ → Python

| type | 中身 |
|---|---|
| `session_start` | `song`（例 `twinkle`） |
| `session_end` | `completed`（最後まで吹けたか） |
| `get_history` | なし |
| `touch_key` | `holes`（タッチ基板がない時、キーボードの 1〜4 で代用） |

## 記録（app/data/sessions.jsonl：1行＝1曲分）

```json
{"id": "20261017-153012", "date": "2026-10-17", "song": "twinkle", "completed": true,
 "duration_sec": 52.3, "exhale_count": 6, "exhale_avg_sec": 5.8, "exhale_max_sec": 8.1,
 "stability_avg": 0.82, "strength_avg": 0.41}
```

日ごとの推移は、この行を日付ごとにまとめて計算する。デモ用のサンプルデータは `app/data/sample_sessions.jsonl`。

## フォルダ構成

```
app/
  server/   main.py（起動・WebSocket・配信） serial_io.py（ボード受信・疑似データ） breath.py（息の判定） store.py（記録と集計）
  web/      index.html, app.js, audio.js, songs.js, style.css, debug.html（受信確認用）
  data/     sessions.jsonl（実データ・git管理外）, sample_sessions.jsonl
firmware/   touch_psoc4/（タッチの出力プログラム・予定）, dps368_fast/（速い気圧出力・予定）
```

## 未決定（ヒアリング中）

- 音色（Web Audio の単純な音 / 楽器らしい合成音 / 実際の楽器の録音素材）
- 曲の進み方（吐いている間の進み方、途中で息が切れた時の扱い）
- 結果画面の内容（メンバーのヒアリング R01〜R04）
