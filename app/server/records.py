"""息のレコード：1回の演奏を「1枚のレコード」として残す。

レコードには、その回の呼吸の波（息の強さ 0〜1 の並び）と、ふりかえり用の要約を入れる。
ブラウザはこれを使って、溝の模様を描いたり、その回の演奏を再生したりする。
"""
from __future__ import annotations

import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
RECORDS = DATA_DIR / "records.jsonl"
MAX_POINTS = 300  # 呼吸の波は最大この点数に間引いて保存する


def _thin(trace: list) -> list:
    if len(trace) <= MAX_POINTS:
        return trace
    step = len(trace) / MAX_POINTS
    return [trace[int(i * step)] for i in range(MAX_POINTS)]


def add(result: dict, game: dict) -> dict:
    trace = _thin([[round(t, 1), round(v, 2)] for t, v in game.get("trace", [])])
    rec = {
        "id": result["id"],
        "date": result["date"],
        "song": result["song"],
        "stage": game.get("stage"),
        "difficulty": game.get("difficulty"),
        "score": game.get("score"),
        "defeated": game.get("defeated"),
        "aura_max": game.get("aura_max", 0),
        "tiers": game.get("tiers", []),
        "exhale_count": result["exhale_count"],
        "exhale_avg_sec": result["exhale_avg_sec"],
        "stability_avg": result["stability_avg"],
        "trace": trace,
    }
    DATA_DIR.mkdir(exist_ok=True)
    with RECORDS.open("a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    return rec


def list_all() -> list[dict]:
    """新しい順。"""
    if not RECORDS.exists():
        return []
    rows = [json.loads(line) for line in RECORDS.read_text(encoding="utf-8").splitlines() if line.strip()]
    return rows[::-1]
