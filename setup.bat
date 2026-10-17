@echo off
rem エア・オカリナのセットアップ（ダブルクリックで動く。PowerShell は使わない）
rem   1. Python があるか確認 → 無ければ公式サイトを開いて入れ方を表示
rem   2. パッケージを入れる
rem   3. 動かせるか確認する
cd /d %~dp0

set PY=
where py > nul 2> nul && set PY=py
if not defined PY (
  where python > nul 2> nul && python -c "import sys" > nul 2> nul && set PY=python
)

if not defined PY (
  echo.
  echo [NG] Python が見つかりません。
  echo      これから Python の公式サイトを開きます。
  echo      1. 「Download Python 3.12」などの黄色いボタンでダウンロード
  echo      2. ダウンロードしたファイルをダブルクリック
  echo      3. 最初の画面で「Add python.exe to PATH」に必ずチェックを入れて「Install Now」
  echo      4. 終わったら、この setup.bat をもう一度ダブルクリック
  echo.
  start "" https://www.python.org/downloads/windows/
  pause
  exit /b 1
)

echo [OK] Python が見つかりました（%PY%）
%PY% --version
echo.
echo パッケージを入れています...
%PY% -m pip install -r requirements.txt
if errorlevel 1 (
  echo [NG] パッケージを入れられませんでした。上のエラー文を Claude Code か Hi6to に見せてください。
  pause
  exit /b 1
)
echo.
%PY% tools\check_env.py
echo.
echo 準備ができたら start.bat をダブルクリックすると起動します。
pause
