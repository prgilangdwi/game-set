"""
Americano Tournament Scheduling Engine

Generates rounds where:
1. Teammate pairs repeat as infrequently as possible
2. Opponent pairs repeat as infrequently as possible
3. Court usage is balanced across players
4. Skill ratings are balanced within matches
5. Mixed doubles: each team must have 1M + 1F (when format='mixed_doubles')
"""
from __future__ import annotations
import random
from collections import defaultdict
from dataclasses import dataclass, field
from itertools import combinations
from typing import Any


@dataclass
class PlayerInfo:
    id: str
    gender: str  # male | female | other
    rating: int = 1000


@dataclass
class MatchSlot:
    court: int
    team1: tuple[str, str]
    team2: tuple[str, str]


@dataclass
class ScheduleHistory:
    teammate_count: dict[frozenset, int] = field(default_factory=lambda: defaultdict(int))
    opponent_count: dict[frozenset, int] = field(default_factory=lambda: defaultdict(int))
    court_count: dict[str, int] = field(default_factory=lambda: defaultdict(int))

    def record_round(self, slots: list[MatchSlot]) -> None:
        for slot in slots:
            p1, p2 = slot.team1
            p3, p4 = slot.team2
            self.teammate_count[frozenset({p1, p2})] += 1
            self.teammate_count[frozenset({p3, p4})] += 1
            for a in (p1, p2):
                for b in (p3, p4):
                    self.opponent_count[frozenset({a, b})] += 1
            for p in (p1, p2, p3, p4):
                self.court_count[p] += 1


def _penalty(
    slots: list[MatchSlot],
    players: dict[str, PlayerInfo],
    history: ScheduleHistory,
    mixed: bool,
) -> float:
    score = 0.0
    for slot in slots:
        p1, p2 = slot.team1
        p3, p4 = slot.team2

        # Teammate repeat penalty
        score += history.teammate_count[frozenset({p1, p2})] * 10
        score += history.teammate_count[frozenset({p3, p4})] * 10

        # Opponent repeat penalty
        for a in (p1, p2):
            for b in (p3, p4):
                score += history.opponent_count[frozenset({a, b})] * 5

        # Skill imbalance penalty
        r1 = (players[p1].rating + players[p2].rating) / 2
        r2 = (players[p3].rating + players[p4].rating) / 2
        score += abs(r1 - r2) * 0.01

        # Mixed doubles validity: penalize heavily if teams are not mixed
        if mixed:
            t1_genders = {players[p1].gender, players[p2].gender}
            t2_genders = {players[p3].gender, players[p4].gender}
            if "male" not in t1_genders or "female" not in t1_genders:
                score += 1000
            if "male" not in t2_genders or "female" not in t2_genders:
                score += 1000

    # Court usage variance penalty
    all_counts = list(history.court_count.values())
    if all_counts:
        avg = sum(all_counts) / len(all_counts)
        score += sum((c - avg) ** 2 for c in all_counts) * 0.1

    return score


def _make_team(p1: str, p2: str, players: dict[str, PlayerInfo], mixed: bool) -> tuple[str, str] | None:
    if mixed:
        genders = {players[p1].gender, players[p2].gender}
        if "male" not in genders or "female" not in genders:
            return None
    return (p1, p2)


def _generate_candidate(
    active_players: list[str],
    players: dict[str, PlayerInfo],
    num_courts: int,
    history: ScheduleHistory,
    mixed: bool,
) -> list[MatchSlot] | None:
    """Try to build one valid round of num_courts matches."""
    pool = list(active_players)
    random.shuffle(pool)
    needed = num_courts * 4

    # If we have more players than needed, pick a subset that minimizes court-usage imbalance
    if len(pool) > needed:
        # Prefer players with fewer court appearances to sit out
        pool.sort(key=lambda p: history.court_count[p])
        pool = pool[:needed]
        random.shuffle(pool)

    if len(pool) < 4:
        return None

    slots: list[MatchSlot] = []
    used: set[str] = set()

    for court in range(1, num_courts + 1):
        available = [p for p in pool if p not in used]
        if len(available) < 4:
            break

        if mixed:
            males = [p for p in available if players[p].gender == "male"]
            females = [p for p in available if players[p].gender != "male"]
            if len(males) < 2 or len(females) < 2:
                break
            t1 = (males[0], females[0])
            t2 = (males[1], females[1])
        else:
            t1 = (available[0], available[1])
            t2 = (available[2], available[3])

        slots.append(MatchSlot(court=court, team1=t1, team2=t2))
        used.update([*t1, *t2])

    return slots if slots else None


def generate_round(
    players: list[dict[str, Any]],
    num_courts: int,
    history: ScheduleHistory,
    mixed_doubles: bool = False,
    attempts: int = 200,
) -> list[MatchSlot]:
    """
    Generate one round of matches using randomized greedy search.
    Returns a list of MatchSlot (one per court used).
    """
    player_map = {
        p["id"]: PlayerInfo(id=p["id"], gender=p.get("gender", "male"), rating=p.get("rating", 1000))
        for p in players
    }
    active = [p["id"] for p in players if p.get("is_checked_in", True)]

    if len(active) < 4:
        return []

    best: list[MatchSlot] | None = None
    best_score = float("inf")

    for _ in range(attempts):
        candidate = _generate_candidate(active, player_map, num_courts, history, mixed_doubles)
        if not candidate:
            continue
        score = _penalty(candidate, player_map, history, mixed_doubles)
        if score < best_score:
            best_score = score
            best = candidate

    return best or []


def build_history_from_matches(matches: list[dict[str, Any]]) -> ScheduleHistory:
    """Reconstruct ScheduleHistory from previously played matches."""
    h = ScheduleHistory()
    for m in matches:
        if m.get("status") != "completed":
            continue
        slot = MatchSlot(
            court=m["court_number"],
            team1=(m["team1_player1_id"], m["team1_player2_id"]),
            team2=(m["team2_player1_id"], m["team2_player2_id"]),
        )
        h.record_round([slot])
    return h
