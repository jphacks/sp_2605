# JPHACKS2026 チーム作業リポジトリ（エア・オカリナ）

吹くと自然に深い呼吸になり、息が安定すると曲が進む「呼吸を整える楽器」を作る。

- 息：気圧センサー DPS368（音量・曲の進行）
- 指：PSOC 4100T Plus のタッチ（音の高さ）
- PC：ブラウザで音を鳴らし、息の強さ・長さ・安定度を記録・可視化

## チーム

| 項目 | 内容 |
|---|---|
| チームID | `sp_2605` |
| 会場 / 日程 | 札幌会場 / 2026/10/17（土）・18（日） |

| 名前 | GitHub | 役割 |
|---|---|---|
| （未記入） | Hi6to | コード編集・ボード書き込み（メインPC） |
| （未記入） | iwakikeitai9-design | 動作確認・工作 |
| （未記入） | KatoRyunosuke-git | 動作確認・工作 |
| （未記入） | oira0822 | 動作確認・工作（招待承認待ち） |

## 進め方

- 進捗はすべて [TASKS.md](TASKS.md) で共有する
- **コードを書き換えるのは Hi6to のPCだけ**。他のメンバーは確認・計測・工作を担当し、結果を TASKS.md に書く
- 作業前に必ず `git pull`、書いたらすぐ `git push`
- 各メンバーの Claude Code は [CLAUDE.md](CLAUDE.md) のルールに従う

## 注意（JPHACKS のルール）

- 審査対象は Hack Day の2日間に作った部分のみ。事前にやるのは環境構築と動作確認まで
- 最終提出は運営から配られる JPHACKS organization のリポジトリ（公開・MITライセンス）。このリポジトリは作業・進捗共有用
- APIキーやパスワードはコミットしない

## アプリの起動（どのPCでも）

**はじめて動かすPCでは、手作業なら [docs/SETUP_MANUAL.md](docs/SETUP_MANUAL.md)（ダウンロードとクリックだけ）、Claude Code に任せるなら [docs/SETUP.md](docs/SETUP.md) を見る**（Claude Code に「docs/SETUP.md を読んで、このPCで動かせるようにして」と頼めば、順に進めてくれる）。

```bash
py -m pip install -r requirements.txt   # 最初の1回
py tools/check_env.py                   # 動かせるか確認（読むだけ）
py app/server/main.py                   # 起動（ボードの COM ポートは自動で探す）
py app/server/main.py --mock            # ボードなしで疑似の息を流す
```

Windows では `start.bat` のダブルクリックでも起動できる。ブラウザで http://localhost:8000/ を開き、画面を1回クリック。
ボードが無いときは、スペースキー長押し＝吐く、1〜4キー＝指穴。
