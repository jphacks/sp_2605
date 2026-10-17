"""ボード（または疑似データ）から値を読み、asyncio のキューに流す。

キューに入るもの：
  ("pressure", t, pa)        気圧（Pa）
  ("touch", t, [0,1,0,0])    指穴4つの状態
  ("status", name, bool)     接続状態の変化
"""
from __future__ import annotations

import asyncio
import math
import random
import re
import threading
import time

import serial
from serial.tools import list_ports

# 既存FW：「Pressure[Pascal]:102218.73」。自作FW用に「P:102218.73」や数値だけの行も受け付ける
PRESSURE_RE = re.compile(r"(?:Pressure\[Pascal\]:|P:)?\s*(-?\d+(?:\.\d+)?)\s*$")
# タッチ：「T:0101」（左から指穴1〜4）
TOUCH_RE = re.compile(r"T:([01]{4})")


# ボードを USB の識別番号で見分ける（COM の番号は PC ごとに変わるため）
BOARD_IDS = {
    "dps": [(0x1366, None)],     # DPS368 2GO：基板上の J-Link（SEGGER）の USB シリアル
    "touch": [(0x04B4, 0xF155)],  # PSOC 4100T Plus：KitProg3 の USB-UART
}


def find_port(name: str) -> str | None:
    """ボードがつながっている COM ポートを探す。見つからなければ None。"""
    for p in list_ports.comports():
        for vid, pid in BOARD_IDS.get(name, []):
            if p.vid == vid and (pid is None or p.pid == pid):
                return p.device
    return None


class SerialReader(threading.Thread):
    """1つの COM ポートを読み続けるスレッド。切断されたら数秒ごとに再接続を試す。"""

    def __init__(self, name, port, baud, parse, loop, queue):
        super().__init__(daemon=True)
        self.name, self.port, self.baud, self.parse = name, port, baud, parse
        self.loop, self.queue = loop, queue

    def _put(self, item):
        self.loop.call_soon_threadsafe(self.queue.put_nowait, item)

    def run(self):
        t0 = time.monotonic()
        while True:
            # "auto" のときは、つなぐたびにボードを探し直す（あとから挿しても動く）
            port = find_port(self.name) if self.port == "auto" else self.port
            if not port:
                self._put(("status", self.name, False))
                time.sleep(2)
                continue
            try:
                with serial.Serial(port, self.baud, timeout=1) as s:
                    print(f"[{self.name}] {port} に接続しました", flush=True)
                    self._put(("status", self.name, True))
                    s.reset_input_buffer()
                    while True:
                        line = s.readline().decode(errors="ignore").strip()
                        if line:
                            item = self.parse(time.monotonic() - t0, line)
                            if item:
                                self._put(item)
            except serial.SerialException:
                self._put(("status", self.name, False))
                time.sleep(2)


def parse_pressure(t, line):
    m = PRESSURE_RE.search(line)
    return ("pressure", t, float(m.group(1))) if m else None


def parse_touch(t, line):
    m = TOUCH_RE.search(line)
    return ("touch", t, [int(c) for c in m.group(1)]) if m else None


async def mock_pressure(queue, rate_hz=20.0):
    """ボードなしで開発するための疑似の息：吐く 4〜7秒 → 休む 2〜3秒 を繰り返す。"""
    await queue.put(("status", "dps", True))
    t0 = time.monotonic()
    base = 101325.0
    phase_end, exhaling, amp = 3.0, False, 0.0
    while True:
        t = time.monotonic() - t0
        if t >= phase_end:
            exhaling = not exhaling
            amp = random.uniform(80, 250) if exhaling else 0.0
            phase_end = t + (random.uniform(4, 7) if exhaling else random.uniform(2, 3))
        wobble = amp * 0.1 * math.sin(t * 3)
        pa = base + amp + wobble + random.gauss(0, 0.5)
        await queue.put(("pressure", t, pa))
        await asyncio.sleep(1 / rate_hz)
