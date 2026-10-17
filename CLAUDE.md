# このリポジトリで作業する Claude Code へ

JPHACKS2026 チーム sp_2605 の提出用リポジトリ（公開）。作品は「エア・オカリナ」（呼吸を整える楽器）。作品の紹介は README.md、チームの作業ルールは docs/TEAM.md、タスクは TASKS.md。

- **公開リポジトリなので、APIキー・パスワード・個人のメールアドレスなどを書かない・コミットしない**

## 役割のルール（必ず守る）

- **ソースコード（firmware/、app/ など）の編集は Hi6to のPCだけで行う。** それ以外のメンバーのPCでは、ソースコードを作成・変更・削除しない。修正が必要だと思ったら、TASKS.md の「気づいたこと」に書くだけにする
- 他のメンバーのPCで行ってよいこと：
  - TASKS.md の自分が担当するタスクの状態と結果欄の更新
  - ボードの認識確認、シリアル出力の読み取り、計測などの「確認作業」の実行
  - 写真・ログを `reports/` に追加する
- ボードへの書き込みは、原則 Hi6to のPCで行う（他のPCで行う場合は TASKS.md に指示がある時だけ）

## アプリを動かす（どのメンバーのPCでも）

- **`docs/SETUP.md` を上から順に実行する。** Python とパッケージを入れて、`start.bat` か `py app/server/main.py` で起動する
- ソフトのインストール（Python・`requirements.txt`）とアプリの起動は、どのPCで行ってもよい（ソースコードの変更ではないため）。インストールの前に本人に一言確認する
- ボードの COM ポートは自動で探すので、指定しなくてよい
- ボードへの書き込み（ModusToolbox・Arduino・J-Link）は Hi6to のPCだけで行う

## TASKS.md の更新方法

1. 作業前に `git pull --rebase`
2. 担当タスクの `[ ]` を `[x]` にし、「結果」に **日付・名前・やったこと・数値やエラー文** を書く
   - うまくいかなかった場合は `[!]` にして、エラー文をそのまま貼る
3. 自分のタスクの行だけを変更する（他人の行は触らない）
4. `git commit -m "TASKS: H03 完了 (名前)"` のように短く書いて `git push`
   - push が拒否されたら `git pull --rebase` してから再度 push

## 開発環境（Hi6to のPC）

- DPS368：Arduino（board: infineon:psoc6 / infineon:xmc、lib: XENSIV Digital Pressure Sensor）
- PSOC 4100T Plus：ModusToolbox 3.9（board: CY8CPROTO-041TP）
- PCアプリ：Python 3.14（pyserial, numpy, matplotlib, websockets）、ブラウザ（Web Audio / Web Serial）
