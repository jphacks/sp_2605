# セットアップ：自分のPCでエア・オカリナを動かす

**このファイルは、各メンバーの Claude Code が読んで、上から順に実行するための手順書です。**
メンバー本人は、Claude Code に「`docs/SETUP.md` を読んで、このPCでアプリを動かせるようにして」と頼むだけでよい。

## Claude Code へのお願い

- Windows を前提にしている。上から順に進め、各ステップの「確認」が通ってから次へ進む
- **このPCの Claude Code は PowerShell が許可されていない場合がある。コマンドはすべて Bash ツール（Git Bash）で実行する**（下の手順のコマンドは Git Bash でそのまま動く）
- サーバーの起動（`py app/server/main.py`）は終わらないコマンドなので、Bash ツールの**バックグラウンド実行**で起動する
- **ソースコード（`app/`・`firmware/`）は変更しない**（CLAUDE.md のルール）。この手順で行うのは、ソフトのインストールと起動だけ
- インストールや、管理者の許可が必要な操作は、**実行する前に本人に一言確認する**
- ボードへの書き込み（ModusToolbox・Arduino）は**しない**。タッチ基板にはすでにプログラムが入っていて、DPS368 2GO は最初から入っているプログラムで動く
- うまくいかないときは、エラー文をそのまま本人に見せ、下の「困ったとき」を確認する。それでもだめなら TASKS.md の「気づいたこと・質問」に書いて push する

## PowerShell でコマンドが動かないとき

PowerShell の安全設定（実行ポリシー）などでコマンドが動かない PC がある。次のどれかで進める。

1. **（いちばん簡単）本人が `setup.bat` をダブルクリック**する。PowerShell を使わずに、Python の確認 → 無ければ公式サイトを開いて入れ方を表示 → パッケージのインストール → 動作確認、まで進む。終わったら `start.bat` をダブルクリックで起動
2. **Claude Code は Git Bash（Bash ツール）で実行する。** 下の手順のコマンドは Git Bash でもそのまま動く（`py` が無いときは `python`）
3. **コマンドプロンプト経由で実行する**：`cmd /c "py -m pip install -r requirements.txt"` のように `cmd /c "…"` で囲む
4. Python が無い場合は、python.org からインストーラーをダウンロードして入れる。最初の画面で **「Add python.exe to PATH」にチェック**を入れる

PowerShell の実行ポリシーを変更する（`Set-ExecutionPolicy`）のは、PC の安全設定を変えることになるので**行わない**。上の方法で足りる。

## 必要なもの

| もの | 必要か | 備考 |
|---|---|---|
| Python 3.10 以上 | **必須** | サーバーを動かす |
| Python のパッケージ（`requirements.txt`） | **必須** | pyserial, websockets |
| Chrome または Edge | **必須** | 画面を表示する |
| ボードのドライバ | ふつうは不要 | Windows に最初から入っているもので認識される（H04・H05 で確認済み） |
| ModusToolbox・Arduino・J-Link | **不要** | ボードに書き込むときだけ使う（Hi6to のPCで行う） |

## 手順

### 1. リポジトリを最新にする

```bash
git pull
```

### 2. Python を確認する

```bash
py --version
```

- `Python 3.10` 以上が出れば OK。`py` が無いと言われたら `python --version` も試す
- **どちらも無い／3.10 より古い場合**：本人に確認してから、次で入れる（入れたらターミナルを開き直す）

```bash
winget install -e --id Python.Python.3.12
```

### 3. パッケージを入れる

```bash
py -m pip install -r requirements.txt
```

（`py` が無い PC では `python -m pip install -r requirements.txt`）

### 4. 動かせるか確認する（読むだけ）

```bash
py tools/check_env.py
```

- `[NG]` が無ければ OK。`[--]` は「無くても動く」項目
- ボードを挿していれば、`DPS368 2GO（息）：COMx`、`PSOC 4100T Plus（指穴）：COMy` のように見つかったポートが出る

### 5. ボードをつなぐ（無くても動作確認はできる）

- **DPS368 2GO**：USB Micro-B のケーブル
- **PSOC 4100T Plus**：USB Type-C のケーブル。**指穴の電極（アルミ）をつないでから挿す**（起動したときに電極に合わせて自動調整するため）
- 電極の端子：指穴1 ＝ P2.3、指穴2 ＝ P2.0、指穴3 ＝ P2.1、指穴4 ＝ P2.2
- COM ポートの番号は PC ごとに違うが、アプリが**自動で探す**ので指定しなくてよい。あとから挿しても自動でつながる

### 6. 起動する

本人が `start.bat` をダブルクリックする。または Claude Code から（**終わらないコマンドなのでバックグラウンドで**）：

```bash
py app/server/main.py
```

- ターミナルに `open http://localhost:8000/` と出たら起動完了
- ボードが見つかると `[dps] COMx に接続しました` のように出る
- Chrome か Edge で **http://localhost:8000/** を開き、**画面を1回クリック**（音を出せるようにするため）
- 右上が「センサー：接続中」なら DPS368 がつながっている

### 7. 動作確認

- ホームで「はじめる」→ 難易度を選ぶ → ストローを吹く（ボードが無いときは**スペースキー長押し＝吐く、1〜4キー＝指穴**）
- 1曲吹き終わると、結果画面に「勝利！」と「きょうの こきゅうが 1まいの レコードに なりました」が出れば成功
- 結果を TASKS.md の自分の行（K01 など）に書いて push する

## ボードが無いときの起動

```bash
py app/server/main.py --mock
```

疑似の息が自動で流れる。画面や演出の確認用。

## 困ったとき

| 症状 | 対処 |
|---|---|
| `py` も `python` も無い | 手順2の winget で Python を入れて、ターミナルを開き直す |
| `No module named serial` / `websockets` | 手順3をやり直す |
| ポート 8000 が使用中 | `py app/server/main.py --port 8010` で起動し、http://localhost:8010/ を開く |
| 右上が「センサー：未接続」のまま | USB を挿し直す。`py tools/check_env.py` で COM ポートが出るか確認。出なければケーブルが充電専用の可能性 |
| ボードの COM ポートが出ない／デバイスマネージャーで「不明なデバイス」 | 別のケーブル・別の USB の差し込み口で試す。それでもだめなら TASKS.md に書いて Hi6to に相談（ドライバの追加が必要な場合がある） |
| 吹いていないのに反応する | 12秒ほど何もしなければ自動で基準を測り直す。袋やボトルを握らない |
| 音が出ない | 画面を1回クリックしたか確認。PC の音量も確認 |
| 指穴が反応しない／反応しすぎる | 電極をつないだ状態で PSOC 4100T Plus の USB を挿し直す |

## メモ

- 遊んだ記録（`app/data/sessions.jsonl`・`profile.json`・`records.jsonl`）はそのPCにだけ保存され、リポジトリには入らない
