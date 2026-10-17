"""エア・オカリナのサーバー。

    py app/server/main.py                 # ボードを使う（COM ポートは自動で探す）
    py app/server/main.py --mock          # ボードなしで疑似の息を流す
    py app/server/main.py --dps COM5 --touch none

ブラウザで http://localhost:8000/ を開く（受信確認は /debug.html）。
"""
from __future__ import annotations

import argparse
import asyncio
import json
import mimetypes
import os
import sys
from datetime import datetime
from http import HTTPStatus
from pathlib import Path

from websockets.asyncio.server import broadcast, serve
from websockets.datastructures import Headers
from websockets.http11 import Response

import growth
import records
import store
from breath import BreathDetector
from serial_io import SerialReader, mock_pressure, parse_pressure, parse_touch

# Git Bash（Claude Code の Bash ツール）から実行したときに日本語が文字化けしないように
if os.environ.get("MSYSTEM"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

WEB_DIR = Path(__file__).resolve().parent.parent / "web"
RAW_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"

clients = set()
status = {"dps": False, "touch": False, "mock": False}
session: store.Session | None = None


def send_all(msg: dict) -> None:
    broadcast(clients, json.dumps(msg, ensure_ascii=False))


def serve_static(connection, request):
    """/ws 以外の HTTP リクエストには web/ のファイルを返す。"""
    if request.path == "/ws":
        return None
    rel = request.path.split("?")[0].lstrip("/") or "index.html"
    path = (WEB_DIR / rel).resolve()
    if WEB_DIR not in path.parents or not path.is_file():
        return connection.respond(HTTPStatus.NOT_FOUND, "Not Found\n")
    body = path.read_bytes()
    ctype = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    if ctype.startswith("text/") or ctype.endswith("javascript"):
        ctype += "; charset=utf-8"
    headers = Headers([("Content-Type", ctype), ("Content-Length", str(len(body))), ("Cache-Control", "no-store")])
    return Response(200, "OK", headers, body)


async def handler(ws):
    global session
    clients.add(ws)
    await ws.send(json.dumps({"type": "status", **status}))
    try:
        async for raw in ws:
            msg = json.loads(raw)
            kind = msg.get("type")
            if kind == "mirror":
                # 観戦モード：演奏している画面の操作を、ほかの画面（観戦）にそのまま流す
                broadcast([c for c in clients if c is not ws], raw)
            elif kind == "session_start":
                session = store.Session(msg.get("song", "unknown"))
            elif kind == "session_end" and session is not None:
                result = session.finish(bool(msg.get("completed")), msg.get("game"))
                session = None
                send_all({"type": "session_result", **result})
            elif kind == "get_records":
                await ws.send(json.dumps({"type": "records", "records": records.list_all()}, ensure_ascii=False))
            elif kind == "get_profile":
                await ws.send(json.dumps({"type": "profile", **growth.public(growth.load())}, ensure_ascii=False))
            elif kind == "get_history":
                await ws.send(json.dumps({"type": "history", **store.history()}, ensure_ascii=False))
            elif kind == "breath_key" and session is not None:
                # センサー不調時の予備（スペースキー）。強さ・安定度は測れないので固定値で記録する
                session.add_event({"event": "exhale_end", "duration": float(msg.get("duration", 0)),
                                   "mean_delta": 150.0, "stability": 0.8, "source": "keyboard"})
            elif kind == "touch_key":
                send_all({"type": "touch", "holes": msg.get("holes", [0, 0, 0, 0]), "source": "keyboard"})
    finally:
        clients.discard(ws)


async def pump(queue: asyncio.Queue) -> None:
    """ボードからの値を判定してブラウザへ流す。生データは app/data/raw/ に CSV で残す（調整用）。"""
    detector = BreathDetector()
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    raw = (RAW_DIR / f"{datetime.now():%Y%m%d-%H%M%S}.csv").open("w", encoding="utf-8")
    raw.write("t_sec,pa,delta,state,event\n")
    while True:
        item = await queue.get()
        if item[0] == "pressure":
            _, t, pa = item
            msg, events = detector.update(t, pa)
            if msg:
                names = ";".join(e["event"] for e in events)
                raw.write(f"{t:.3f},{pa:.2f},{msg['delta']},{msg['state']},{names}\n")
                raw.flush()
            if msg:
                send_all(msg)
            for ev in events:
                if session is not None:
                    session.add_event(ev)
                send_all(ev)
        elif item[0] == "touch":
            send_all({"type": "touch", "holes": item[2], "source": "board"})
        elif item[0] == "status":
            status[item[1]] = item[2]
            send_all({"type": "status", **status})


def lan_addresses() -> list[str]:
    """このPCの、同じ Wi-Fi のほかのPCから見えるアドレス。"""
    import socket
    ips = set()
    try:
        ips.update(socket.gethostbyname_ex(socket.gethostname())[2])
    except OSError:
        pass
    try:  # 実際に外へ出るときに使うアドレス（通信はしない）
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ips.add(s.getsockname()[0])
        s.close()
    except OSError:
        pass
    return sorted(ip for ip in ips if not ip.startswith("127."))


async def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dps", default="auto", help="DPS368 2GO の COM ポート（auto で自動検出）")
    ap.add_argument("--dps-baud", type=int, default=9600)
    ap.add_argument("--touch", default="auto", help="PSOC 4100T Plus の COM ポート（auto で自動検出、none で使わない）")
    ap.add_argument("--touch-baud", type=int, default=115200)
    ap.add_argument("--mock", action="store_true", help="ボードなしで疑似の息を流す")
    ap.add_argument("--port", type=int, default=8000)
    ap.add_argument("--share", action="store_true", help="同じ Wi-Fi のほかのPCから観戦できるようにする（デモ用）")
    args = ap.parse_args()

    loop = asyncio.get_running_loop()
    queue: asyncio.Queue = asyncio.Queue()
    tasks = [asyncio.create_task(pump(queue))]
    if args.mock:
        status["mock"] = True
        tasks.append(asyncio.create_task(mock_pressure(queue)))
    else:
        SerialReader("dps", args.dps, args.dps_baud, parse_pressure, loop, queue).start()
    if args.touch.lower() != "none" and not args.mock:
        SerialReader("touch", args.touch, args.touch_baud, parse_touch, loop, queue).start()

    host = "0.0.0.0" if args.share else "localhost"
    async with serve(handler, host, args.port, process_request=serve_static):
        print(f"open http://localhost:{args.port}/  (debug: /debug.html)", flush=True)
        if args.share:
            print("観戦用のアドレス（同じ Wi-Fi のPCのブラウザで開く）：", flush=True)
            for ip in lan_addresses():
                print(f"    http://{ip}:{args.port}/?watch=1", flush=True)
        await asyncio.Future()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
