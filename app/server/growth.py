"""プレイヤーの成長（レベル・経験値）。経験値は「ゲームの成績」と「本人の呼吸のデータ」から計算する。

続ける理由をつくるのがねらい：深く・安定して吐けた分、自己ベストを更新した分、今日も来た分が経験値になる。
数値はすべて仮。調整するときはこのファイルの定数だけ変える。
"""
from __future__ import annotations

import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PROFILE = DATA_DIR / "profile.json"

TIER_EXP = {"PERFECT": 10, "GREAT": 8, "GOOD": 6, "MISS": 0}
DIFFICULTY_RATE = {"beginner": 1.0, "normal": 1.2, "hard": 1.5, "expert": 2.0}
DEEP_BREATH_PER_SEC = 5      # 平均の吐く長さ（秒）× この値
CALM_FULL = 30               # 平均の安定度（0〜1）× この値
BEST_BONUS = 30              # 自己ベスト更新（長さ・安定度それぞれ）
IMPROVE_BONUS = 10           # 前回より良くなった
FIRST_OF_DAY_BONUS = 20      # 今日はじめての演奏


def exp_to_next(level: int) -> int:
    """そのレベルから次のレベルに上がるのに必要な経験値。"""
    return 80 + 40 * (level - 1)


def load() -> dict:
    if PROFILE.exists():
        return json.loads(PROFILE.read_text(encoding="utf-8"))
    return {"level": 1, "exp": 0, "total_exp": 0, "plays": 0, "last_date": None}


def save(p: dict) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    PROFILE.write_text(json.dumps(p, ensure_ascii=False, indent=2), encoding="utf-8")


def public(p: dict) -> dict:
    return {**p, "next": exp_to_next(p["level"])}


def award(result: dict, game: dict | None) -> dict:
    """1曲分の結果から経験値を計算してプロフィールに加え、内訳とレベルの変化を返す。"""
    p = load()
    lines: list[tuple[str, int]] = []
    tiers = (game or {}).get("tiers", [])
    if tiers:
        lines.append(("えんそう", sum(TIER_EXP.get(t, 0) for t in tiers)))
    lines.append(("ふかい いき", round(result["exhale_avg_sec"] * DEEP_BREATH_PER_SEC)))
    lines.append(("しずかな いき", round(result["stability_avg"] * CALM_FULL)))
    best, prev = result.get("best"), result.get("prev")
    if best and result["exhale_avg_sec"] > best["exhale_avg_sec"]:
        lines.append(("じこベスト（ながさ）", BEST_BONUS))
    if best and result["stability_avg"] > best["stability_avg"]:
        lines.append(("じこベスト（しずかさ）", BEST_BONUS))
    if prev and (result["exhale_avg_sec"] > prev["exhale_avg_sec"] or result["stability_avg"] > prev["stability_avg"]):
        lines.append(("ぜんかいより せいちょう", IMPROVE_BONUS))
    if p.get("last_date") != result["date"]:
        lines.append(("きょうの いっかいめ", FIRST_OF_DAY_BONUS))

    rate = DIFFICULTY_RATE.get((game or {}).get("difficulty", "beginner"), 1.0)
    base = sum(v for _, v in lines)
    gained = round(base * rate)

    before = {"level": p["level"], "exp": p["exp"], "next": exp_to_next(p["level"])}
    p["exp"] += gained
    p["total_exp"] += gained
    p["plays"] += 1
    p["last_date"] = result["date"]
    while p["exp"] >= exp_to_next(p["level"]):
        p["exp"] -= exp_to_next(p["level"])
        p["level"] += 1
    save(p)
    return {
        "lines": [{"label": k, "value": v} for k, v in lines if v],
        "rate": rate,
        "gained": gained,
        "before": before,
        "after": public(p),
    }
