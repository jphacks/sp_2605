"""演奏1回分（セッション）の記録・集計・保存。"""
from __future__ import annotations

import json
import statistics
from collections import defaultdict
from datetime import datetime
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
SESSIONS = DATA_DIR / "sessions.jsonl"
SAMPLE = DATA_DIR / "sample_sessions.jsonl"


class Session:
    def __init__(self, song: str):
        self.song = song
        self.started = datetime.now()
        self.exhales: list[dict] = []

    def add_event(self, event: dict) -> None:
        if event.get("event") == "exhale_end":
            self.exhales.append(event)

    def finish(self, completed: bool) -> dict:
        ex = self.exhales
        durations = [e["duration"] for e in ex]
        result = {
            "id": self.started.strftime("%Y%m%d-%H%M%S"),
            "date": self.started.strftime("%Y-%m-%d"),
            "song": self.song,
            "completed": completed,
            "duration_sec": round((datetime.now() - self.started).total_seconds(), 1),
            "exhale_count": len(ex),
            "exhale_avg_sec": round(statistics.fmean(durations), 2) if ex else 0.0,
            "exhale_max_sec": round(max(durations), 2) if ex else 0.0,
            "stability_avg": round(statistics.fmean(e["stability"] for e in ex), 3) if ex else 0.0,
            "strength_avg": round(statistics.fmean(e["mean_delta"] for e in ex) / 300, 3) if ex else 0.0,
        }
        DATA_DIR.mkdir(exist_ok=True)
        with SESSIONS.open("a", encoding="utf-8") as f:
            f.write(json.dumps(result, ensure_ascii=False) + "\n")
        return result


def _read(path: Path) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def history(include_sample: bool = True) -> list[dict]:
    """日ごとの集計（古い順）。"""
    rows = (_read(SAMPLE) if include_sample else []) + _read(SESSIONS)
    by_day: dict[str, list[dict]] = defaultdict(list)
    for r in rows:
        by_day[r["date"]].append(r)
    out = []
    for day in sorted(by_day):
        rs = by_day[day]
        out.append({
            "date": day,
            "sessions": len(rs),
            "exhale_avg_sec": round(statistics.fmean(r["exhale_avg_sec"] for r in rs), 2),
            "stability_avg": round(statistics.fmean(r["stability_avg"] for r in rs), 3),
        })
    return out
