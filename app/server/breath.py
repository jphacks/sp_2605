"""気圧の値から「吐く / 止める / 吸う」を判定し、1回の吐く息ごとの指標を計算する。"""
from __future__ import annotations

import statistics
from dataclasses import dataclass, field

# H12（コンビニ袋で密閉）の実測：静止ぶれ 0.4Pa、弱く +122Pa、強く +312Pa、吸う -30Pa
EXHALE_ON = 15.0
EXHALE_OFF = 8.0
INHALE_ON = -12.0
INHALE_OFF = -6.0
STRENGTH_FULL = 300.0  # この変化量で strength = 1
BASELINE_WARMUP = 5  # 起動直後、この数のサンプルの中央値を基準値にする
BASELINE_FOLLOW = 0.05  # idle 中の基準値の追従の速さ（0〜1）
BASELINE_FOLLOW_BAND = 5.0  # 基準値から ±この範囲の時だけ追従する
# 袋に入れ直した時などに基準値がずれて「吐きっぱなし」になるのを防ぐ：
# この秒数以上、変化がほぼ一定のまま吐く/吸う状態が続いたら基準値を測り直す
STUCK_SEC = 12.0
STUCK_SPREAD = 6.0


@dataclass
class Breath:
    """1回分の吐く（または吸う）息。"""

    kind: str  # "exhale" | "inhale"
    start: float
    deltas: list[float] = field(default_factory=list)
    end: float | None = None

    def summary(self) -> dict:
        mean = statistics.fmean(self.deltas) if self.deltas else 0.0
        if len(self.deltas) > 1 and mean:
            stability = max(0.0, 1.0 - statistics.pstdev(self.deltas) / abs(mean))
        else:
            stability = 0.0
        return {
            "kind": self.kind,
            "start": round(self.start, 3),
            "duration": round((self.end or self.start) - self.start, 3),
            "mean_delta": round(mean, 1),
            "peak_delta": round(max(self.deltas, key=abs), 1) if self.deltas else 0.0,
            "stability": round(stability, 3),
        }


class BreathDetector:
    def __init__(self) -> None:
        self.baseline: float | None = None
        self._warmup: list[float] = []
        self.state = "idle"
        self.current: Breath | None = None

    def update(self, t: float, pa: float) -> tuple[dict | None, list[dict]]:
        """新しい気圧の値を入れる。(breath メッセージ, breath_event のリスト) を返す。

        基準値が決まるまでは (None, []) を返す。
        """
        if self.baseline is None:
            self._warmup.append(pa)
            if len(self._warmup) >= BASELINE_WARMUP:
                self.baseline = statistics.median(self._warmup)
            return None, []

        delta = pa - self.baseline
        events: list[dict] = []

        if self.state == "idle":
            if delta >= EXHALE_ON:
                events.append(self._start("exhale", t))
            elif delta <= INHALE_ON:
                events.append(self._start("inhale", t))
            elif abs(delta) < BASELINE_FOLLOW_BAND:
                self.baseline += BASELINE_FOLLOW * delta
        elif self.state == "exhale" and delta < EXHALE_OFF:
            events.append(self._end(t))
            if delta <= INHALE_ON:
                events.append(self._start("inhale", t))
        elif self.state == "inhale" and delta > INHALE_OFF:
            events.append(self._end(t))
            if delta >= EXHALE_ON:
                events.append(self._start("exhale", t))

        if self.current is not None:
            self.current.deltas.append(delta)
            recent = self.current.deltas[-int(STUCK_SEC * 3):]
            if t - self.current.start > STUCK_SEC and max(recent) - min(recent) < STUCK_SPREAD:
                self.reset()
                return None, [{"type": "breath_event", "event": "baseline_reset", "t": round(t, 3)}]

        strength = max(0.0, min(1.0, delta / STRENGTH_FULL)) if self.state == "exhale" else 0.0
        msg = {
            "type": "breath",
            "t": round(t, 3),
            "pa": round(pa, 2),
            "delta": round(delta, 1),
            "state": self.state,
            "strength": round(strength, 3),
        }
        return msg, events

    def reset(self) -> None:
        """基準値を測り直す（次の数サンプルで決め直す）。"""
        self.baseline = None
        self._warmup = []
        self.state = "idle"
        self.current = None

    def _start(self, kind: str, t: float) -> dict:
        self.state = kind
        self.current = Breath(kind=kind, start=t)
        return {"type": "breath_event", "event": f"{kind}_start", "t": round(t, 3)}

    def _end(self, t: float) -> dict:
        breath = self.current
        assert breath is not None
        breath.end = t
        self.state = "idle"
        self.current = None
        return {"type": "breath_event", "event": f"{breath.kind}_end", "t": round(t, 3), **breath.summary()}
