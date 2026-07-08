import argparse
import html
import json
import re
import sys
import unicodedata
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup, Tag


DEFAULT_MATCHES = Path("src/data/matches.json")
DEFAULT_PLAYERS = Path("src/data/players.json")
ALIASES_FILE = Path("src/data/player-aliases.ts")
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/126.0.0.0 Safari/537.36"
)


class ScraperError(RuntimeError):
    pass


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = re.sub(r"['\u2019`.]", "", text.lower())
    text = text.replace("-", " ")
    return re.sub(r"\s+", " ", text).strip()


def slug(text: str) -> str:
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", normalize(text)))


def minute_value(minute: str) -> int:
    base, _, offset = minute.partition("+")
    return (int(base) if base.isdigit() else 0) + (
        int(offset) if offset.isdigit() else 0
    )


def base_minute(minute: str) -> int:
    base = minute.split("+", 1)[0]
    return int(base) if base.isdigit() else 0


def normalize_url(url: str) -> str:
    parsed = urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        raise ScraperError(f"Invalid URL: {url}")
    return url if url.endswith("/") else f"{url}/"


def fetch_html(url: str) -> str:
    response = requests.get(
        normalize_url(url),
        headers={"User-Agent": USER_AGENT, "Accept": "text/html"},
        timeout=30,
    )
    if response.status_code != 200:
        raise ScraperError(f"Fetch failed with HTTP {response.status_code}: {url}")
    response.encoding = response.encoding or "utf-8"
    return response.text


def read_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path, data: Any) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        json.dump(data, handle, ensure_ascii=False, separators=(",", ":"))


def load_aliases(path: Path = ALIASES_FILE) -> dict[str, str]:
    if not path.exists():
        return {}
    aliases: dict[str, str] = {}
    pattern = re.compile(r'^\s*(?:"([^"]+)"|([a-z0-9 ]+))\s*:\s*"([^"]+)"')
    for line in path.read_text(encoding="utf-8").splitlines():
        match = pattern.match(line)
        if not match:
            continue
        key = match.group(1) or match.group(2)
        aliases[normalize(key)] = match.group(3)
    return aliases


def infer_team_iso(matches: list[dict[str, Any]]) -> dict[str, str]:
    teams: dict[str, str] = {}
    for match in matches:
        if match.get("team1") and match.get("iso1"):
            teams[str(match["team1"])] = str(match["iso1"])
        if match.get("team2") and match.get("iso2"):
            teams[str(match["team2"])] = str(match["iso2"])
    return teams


def title_round(stage: str) -> str:
    small_words = {"a", "an", "and", "for", "of", "the"}
    words = re.split(r"(\s+)", stage.strip().lower())
    out: list[str] = []
    seen_word = False
    for token in words:
        if token.isspace():
            out.append(token)
            continue
        if seen_word and token in small_words:
            out.append(token)
        else:
            out.append(token[:1].upper() + token[1:])
        seen_word = True
    return "".join(out)


def text_of(node: Tag) -> str:
    return html.unescape(node.get_text(" ", strip=True)).replace("\xa0", " ")


def class_contains(node: Tag, value: str) -> bool:
    classes = node.get("class") or []
    return any(value in str(class_name) for class_name in classes)


def parse_pair(text: str) -> tuple[int, int]:
    match = re.search(r"(\d+)\s*[–-]\s*(\d+)", text)
    if not match:
        raise ScraperError(f"Could not parse score pair from: {text}")
    return int(match.group(1)), int(match.group(2))


def parse_minute(raw: str) -> str:
    numbers = re.findall(r"\d+", raw)
    if not numbers:
        raise ScraperError(f"Could not parse goal minute from: {raw}")
    if len(numbers) == 1:
        return numbers[0]
    return f"{numbers[0]}+{numbers[1]}"


def parse_goal_text(raw: str, team: int, aliases: dict[str, str]) -> dict[str, Any]:
    text = re.sub(r"\s+", " ", raw).strip()
    minute_match = re.search(r"\(([^()]*\d[^()]*)\)", text)
    if not minute_match:
        raise ScraperError(f"Could not parse goal row: {raw}")

    name = text[: minute_match.start()].strip()
    minute = parse_minute(minute_match.group(1))
    suffix = text[minute_match.end() :].upper()
    canonical = aliases.get(normalize(name), name)
    goal: dict[str, Any] = {
        "team": team,
        "name": canonical,
        "key": normalize(canonical),
        "minute": minute,
    }
    if re.search(r"\bP\b|PEN", suffix):
        goal["penalty"] = True
    if re.search(r"\bOG\b|OWN", suffix):
        goal["ownGoal"] = True
    return goal


def extract_header_grid(header: Tag) -> list[Tag]:
    grids = [
        node
        for node in header.find_all("div")
        if class_contains(node, "grid-cols-[1fr,auto,1fr]")
    ]
    if len(grids) < 2:
        raise ScraperError("Could not locate match header grids")
    return grids


def direct_tag_children(node: Tag) -> list[Tag]:
    return [child for child in node.children if isinstance(child, Tag)]


def parse_goals(goal_grid: Tag, aliases: dict[str, str]) -> list[dict[str, Any]]:
    columns = direct_tag_children(goal_grid)
    if len(columns) < 3:
        raise ScraperError("Could not locate goal columns")

    goals: list[dict[str, Any]] = []
    for team, column in ((1, columns[0]), (2, columns[2])):
        for node in column.find_all("div"):
            text = text_of(node)
            if "(" not in text or ")" not in text:
                continue
            if not re.search(r"\(\s*\d", text):
                continue
            goal = parse_goal_text(text, team, aliases)
            if goal not in goals:
                goals.append(goal)
    return sorted(goals, key=lambda goal: minute_value(str(goal["minute"])))


def parse_details(soup: BeautifulSoup) -> tuple[str, str]:
    date = ""
    ground = ""
    for label in soup.find_all("h5"):
        label_text = text_of(label).lower()
        value_node = label.find_next_sibling("p")
        if not value_node:
            continue
        value = text_of(value_node)
        if label_text == "date":
            date = value.split(",", 1)[0].strip()
        elif label_text == "stadium":
            if "•" in value:
                stadium, location = [part.strip() for part in value.split("•", 1)]
                city = location.split(",", 1)[0].strip()
                ground = f"{stadium}, {city}" if city else stadium
            else:
                ground = value
    return date, ground


def compute_score(
    displayed: tuple[int, int],
    penalties: tuple[int, int] | None,
    extra_time: bool,
    goals: list[dict[str, Any]],
) -> dict[str, list[int]]:
    if extra_time or penalties:
        ft = [0, 0]
        for goal in goals:
            if base_minute(str(goal["minute"])) <= 90:
                ft[int(goal["team"]) - 1] += 1
        score: dict[str, list[int]] = {"ft": ft, "et": [displayed[0], displayed[1]]}
        if penalties:
            score["p"] = [penalties[0], penalties[1]]
        return score
    return {"ft": [displayed[0], displayed[1]]}


def parse_match(
    page_html: str,
    url: str,
    matches: list[dict[str, Any]],
    aliases: dict[str, str],
    round_override: str | None = None,
    group: str | None = None,
) -> dict[str, Any]:
    soup = BeautifulSoup(page_html, "html.parser")
    header = soup.find("header")
    if not isinstance(header, Tag):
        raise ScraperError("Could not locate match header")

    tournament_link = header.find("a", href=re.compile(r"/tournaments/WC-\d{4}$"))
    if not isinstance(tournament_link, Tag):
        raise ScraperError("Could not locate tournament/year header")
    tournament_text = text_of(tournament_link)
    year_match = re.search(r"\b(19|20)\d{2}\b", tournament_text)
    if not year_match:
        raise ScraperError(f"Could not parse year from: {tournament_text}")
    year = int(year_match.group(0))
    stage = tournament_text.split("•", 1)[1].strip() if "•" in tournament_text else ""
    round_name = round_override or title_round(stage)

    team_nodes = header.find_all("h2")
    if len(team_nodes) < 2:
        raise ScraperError("Could not locate both teams")
    team1 = text_of(team_nodes[0])
    team2 = text_of(team_nodes[1])

    grids = extract_header_grid(header)
    score_grid = grids[0]
    goal_grid = grids[1]
    score_text = text_of(score_grid)
    score_parts = re.findall(r"\d+\s*[–-]\s*\d+", score_text)
    if not score_parts:
        raise ScraperError(f"Could not locate displayed score: {score_text}")
    displayed = parse_pair(score_parts[0])
    penalties = parse_pair(score_parts[1]) if len(score_parts) > 1 else None
    extra_time = "(a.e.t)" in score_text.lower() or bool(penalties)

    parsed_goals = parse_goals(goal_grid, aliases)
    date, ground = parse_details(soup)

    team_iso = infer_team_iso(matches)
    missing = [team for team in (team1, team2) if team not in team_iso]
    if missing:
        raise ScraperError(
            "Unknown team mapping for "
            + ", ".join(missing)
            + ". Add/confirm the team in existing match data before writing."
        )

    match: dict[str, Any] = {
        "id": f"{year}-{slug(round_name) or 'x'}-{team_iso[team1]}-{team_iso[team2]}",
        "year": year,
        "date": date,
        "round": round_name,
        "ground": ground,
        "team1": team1,
        "team2": team2,
        "score": compute_score(displayed, penalties, extra_time, parsed_goals),
        "goals": parsed_goals,
        "iso1": team_iso[team1],
        "iso2": team_iso[team2],
    }
    if group:
        match["group"] = group

    if not parsed_goals:
        raise ScraperError(f"No goals parsed from {url}")
    return match


def merge_match(
    matches: list[dict[str, Any]], new_match: dict[str, Any]
) -> tuple[list[dict[str, Any]], str]:
    for index, match in enumerate(matches):
        same_id = match.get("id") == new_match["id"]
        same_fixture = (
            match.get("date") == new_match["date"]
            and match.get("team1") == new_match["team1"]
            and match.get("team2") == new_match["team2"]
        )
        if same_id or same_fixture:
            merged = list(matches)
            merged[index] = new_match
            return merged, "replaced"
    return [*matches, new_match], "appended"


def rebuild_players(matches: list[dict[str, Any]]) -> list[dict[str, str]]:
    player_map: dict[str, str] = {}
    for match in matches:
        for goal in match.get("goals", []):
            key = str(goal.get("key", ""))
            name = str(goal.get("name", ""))
            if key and key not in player_map:
                player_map[key] = name
    return [
        {"key": key, "label": label}
        for key, label in sorted(player_map.items(), key=lambda item: normalize(item[1]))
    ]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Scrape one World Cup Archives match into app JSON data."
    )
    parser.add_argument("url")
    parser.add_argument("--matches", type=Path, default=DEFAULT_MATCHES)
    parser.add_argument("--players", type=Path, default=DEFAULT_PLAYERS)
    parser.add_argument("--round", dest="round_override")
    parser.add_argument("--group")
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def main() -> int:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8")

    args = parse_args()
    try:
        matches = read_json(args.matches)
        if not isinstance(matches, list):
            raise ScraperError(f"{args.matches} must contain a JSON array")

        aliases = load_aliases()
        page_html = fetch_html(args.url)
        new_match = parse_match(
            page_html,
            args.url,
            matches,
            aliases,
            round_override=args.round_override,
            group=args.group,
        )
        merged_matches, action = merge_match(matches, new_match)
        players = rebuild_players(merged_matches)

        if args.dry_run:
            print(json.dumps(new_match, ensure_ascii=False, indent=2))
            print(
                f"\nDry run: would {action} {new_match['id']} "
                f"({len(merged_matches)} matches, {len(players)} players)."
            )
            print("Note: halftime score is omitted; the source HTML does not expose it.")
            return 0

        write_json(args.matches, merged_matches)
        write_json(args.players, players)
        print(f"Match: {new_match['id']}")
        print(f"Action: {action}")
        print(f"Matches: {len(merged_matches)}")
        print(f"Players: {len(players)}")
        print("Note: halftime score is omitted; the source HTML does not expose it.")
        return 0
    except (OSError, requests.RequestException, ScraperError, json.JSONDecodeError) as err:
        print(f"scraper.py: {err}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
