"""気圧の値から「吐く / 止める / 吸う」を判定し、1回の吐く息ごとの指標を計算する。"""
from __future__ import annotations

import statistics
from dataclasses import dataclass, field

# H12（コンビニ袋で密閉）の実測：静止ぶれ 0.4Pa、弱く +122Pa、強く +312Pa、吸う -30Pa
# 1回目の試奏で、袋に触れた時などの小さな気圧変化を息と誤検知したため、しきい値を高めにしている
EXHALE_ON = 20.0  # 10/18 試奏2回目：弱めの息（+20Pa 前後）も拾う。硬いボトルなので触った時の誤検知は袋より少ない
# 10/18 の試奏：吐き始め 35〜50Pa → ゆっくり弱まり 10〜20Pa で吐き続けていたのに、15Pa で「吐き終わり」になっていた
EXHALE_OFF = 6.0
END_SAMPLES = 2  # 吐き終わりは、しきい値を2回続けて下回ったら（1回だけの落ち込みでは終わりにしない）
INHALE_ON = -25.0
INHALE_OFF = -10.0
STRENGTH_FULL = 300.0  # この変化量で strength = 1
BASELINE_WARMUP = 5  # 起動直後、この数のサンプルの中央値を基準値にする
BASELINE_FOLLOW = 0.1  # idle 中の基準値の追従の速さ（0〜1）
BASELINE_FOLLOW_BAND = 10.0  # 基準値から ±この範囲の時だけ追従する（袋がゆっくりしぼむ等を吸収）
# 袋に入れ直した時などに基準値がずれて「吐きっぱなし」になるのを防ぐ：
# この秒数以上、変化がほぼ一定のまま吐く/吸う状態が続いたら基準値を測り直す
STUCK_SEC = 12.0
STUCK_SPREAD = 6.0
# 10/18 の試奏2回目：吐いた後、ボトルの中が冷えて気圧が 15〜25Pa 低いまま数十秒戻らず、次の息が届かなくなった。
# 吐いていない時に、値が基準からずれたまま止まっていたら（約3秒）、そこを新しい基準にする
SETTLE_SAMPLES = 9
SETTLE_SPREAD = 4.0
SETTLE_MIN_OFFSET = 8.0


@dataclass
class Breath:
    """1回分の吐く（または吸う）息。"""

    kind: str  # "exhale" | "inhale"
    start: float
    deltas: list[float] = field(default_factory=list)
    end: float | None = None

    def summary(self) -> dict:
        mean = statistics.fmean(self.deltas) if self.deltas else 0.0
        # 安定度は吹き始めと吹き終わり（各20%）を除いた真ん中で計算する。
        # 自然な息は立ち上がりと終わりで強さが変わるので、そこを「ぶれ」と数えないため
        core = self.deltas
        if len(self.deltas) >= 5:
            cut = max(1, len(self.deltas) // 5)
            core = self.deltas[cut:-cut]
        core_mean = statistics.fmean(core) if core else 0.0
        if len(core) > 1 and core_mean:
            stability = max(0.0, 1.0 - statistics.pstdev(core) / abs(core_mean))
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
        self._low = 0
        self._recent: list[float] = []

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

        # 吐いていない時に、基準からずれたまま止まっていたら、すぐ基準を合わせ直す
        self._recent = (self._recent + [pa])[-SETTLE_SAMPLES:]
        if self.state != "exhale" and len(self._recent) == SETTLE_SAMPLES:
            spread = max(self._recent) - min(self._recent)
            if spread < SETTLE_SPREAD and abs(delta) >= SETTLE_MIN_OFFSET:
                if self.state == "inhale":
                    events.append(self._end(t))
                self.baseline = statistics.fmean(self._recent)
                delta = pa - self.baseline

        if self.state == "idle":
            if delta >= EXHALE_ON:
                events.append(self._start("exhale", t))
            elif delta <= INHALE_ON:
                events.append(self._start("inhale", t))
            elif abs(delta) < BASELINE_FOLLOW_BAND:
                self.baseline += BASELINE_FOLLOW * delta
        elif self.state == "exhale" and delta < EXHALE_OFF:
            self._low += 1
            # 吸い始めたらすぐ切り替える。それ以外は、少し続けて弱まったら吐き終わり
            if delta <= INHALE_ON or self._low >= END_SAMPLES:
                events.append(self._end(t))
                if delta <= INHALE_ON:
                    events.append(self._start("inhale", t))
        elif self.state == "exhale":
            self._low = 0
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
        self._recent = []
        self.state = "idle"
        self.current = None

    def _start(self, kind: str, t: float) -> dict:
        self.state = kind
        self._low = 0
        self.current = Breath(kind=kind, start=t)
        return {"type": "breath_event", "event": f"{kind}_start", "t": round(t, 3)}

    def _end(self, t: float) -> dict:
        breath = self.current
        assert breath is not None
        breath.end = t
        self.state = "idle"
        self.current = None
        return {"type": "breath_event", "event": f"{breath.kind}_end", "t": round(t, 3), **breath.summary()}
