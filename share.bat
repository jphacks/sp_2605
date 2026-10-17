@echo off
rem シン呼吸を「観戦できる状態」で起動する（デモ用）。
rem 同じ Wi-Fi のほかのPCのブラウザで、黒い画面に出る「観戦用のアドレス」を開くと、同じ画面が映る。
rem 初めて起動したとき、Windows に「アクセスを許可しますか？」と聞かれたら、プライベート ネットワークにチェックして「許可」。
cd /d %~dp0
set PY=py
where py > nul 2> nul || set PY=python
%PY% -m pip install -q -r requirements.txt
start "" cmd /c "timeout /t 3 > nul & start http://localhost:8000/"
%PY% app\server\main.py --share %*
pause
