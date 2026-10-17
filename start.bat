@echo off
rem エア・オカリナを起動する（ダブルクリックで動く）。ボードの COM ポートは自動で探す。
cd /d %~dp0
set PY=py
where py > nul 2> nul || set PY=python
%PY% -m pip install -q -r requirements.txt
rem サーバーが立ち上がってからブラウザを開く
start "" cmd /c "timeout /t 3 > nul & start http://localhost:8000/"
%PY% app\server\main.py %*
pause
