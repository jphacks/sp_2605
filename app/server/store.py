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
            # フレーズ（＝1回の吐く息）ごとの記録。「今回の1曲」のグラフに使う
            "exhales": [{"duration": round(e["duration"], 2), "stability": round(e["stability"], 3)} for e in ex],
        }
        # 前回・自己ベストとの比較（今回を保存する前の記録と比べる）
        past = [r for r in _read(SESSIONS) if r.get("exhale_count")]
        if past:
            result["prev"] = {"exhale_avg_sec": past[-1]["exhale_avg_sec"], "stability_avg": past[-1]["stability_avg"]}
            result["best"] = {
                "exhale_avg_sec": max(r["exhale_avg_sec"] for r in past),
                "stability_avg": max(r["stability_avg"] for r in past),
            }
        DATA_DIR.mkdir(exist_ok=True)
        with SESSIONS.open("a", encoding="utf-8") as f:
            saved = {k: v for k, v in result.items() if k not in ("prev", "best")}
            f.write(json.dumps(saved, ensure_ascii=False) + "\n")
        return result


def _read(path: Path) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def history(recent: int = 20) -> dict:
    """記録の集計。

    sessions: 本物の演奏の記録（新しい順に recent 件を、古い順で返す）
    days:     日ごとの平均（古い順）。サンプルデータの日は sample=True で区別する
    """
    real = [r for r in _read(SESSIONS) if r.get("exhale_count")]
    sample = [dict(r, sample=True) for r in _read(SAMPLE)]
    sessions = [
        {"id": r["id"], "exhale_avg_sec": r["exhale_avg_sec"], "stability_avg": r["stability_avg"], "song": r["song"]}
        for r in real[-recent:]
    ]
    by_day: dict[str, list[dict]] = defaultdict(list)
    for r in sample + real:
        by_day[r["date"]].append(r)
    days = []
    for day in sorted(by_day):
        rs = by_day[day]
        days.append({
            "date": day,
            "sample": all(r.get("sample") for r in rs),
            "sessions": len(rs),
            "exhale_avg_sec": round(statistics.fmean(r["exhale_avg_sec"] for r in rs), 2),
            "stability_avg": round(statistics.fmean(r["stability_avg"] for r in rs), 3),
        })
    return {"sessions": sessions, "days": days}
