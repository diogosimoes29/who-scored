import type { Goal, Match, Score } from "../types";

const MONTHS = [
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec",
];

export function formatDate(iso: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!m) return iso;
    const [, y, mo, d] = m;
    const mes = MONTHS[Number(mo) - 1] ?? mo;
    return `${Number(d)} ${mes} ${y}`;
}

export function mainScore(score: Score): string {
    const [a, b] = score.et ?? score.ft;
    return `${a}–${b}`;
}

export function scoreNote(score: Score): string | null {
    if (score.p) return `${score.p[0]}–${score.p[1]} pens`;
    if (score.et) return "AET";
    return null;
}

export function teamTag(name: string, iso?: string): string {
    if (iso) {
        const sub = iso.split("-")[1];
        if (sub) return sub.toUpperCase();
        return iso.toUpperCase();
    }
    return name.slice(0, 3).toUpperCase();
}


export function flagUrl(iso?: string): string | null {
    if (!iso) return null;
    return `https://flagcdn.com/${iso.toLowerCase()}.svg`;
}

export function goalTags(goal: Goal): string {
    const tags: string[] = [];
    if (goal.penalty) tags.push("pen.");
    if (goal.ownGoal) tags.push("OG");
    return tags.length ? ` (${tags.join(", ")})` : "";
}

export function roundLabel(match: Match): string {
    return match.group ? `${match.round} · ${match.group}` : match.round;
}
