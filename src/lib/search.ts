import Fuse from "fuse.js";
import type { PlayerEntry } from "../types";

export type PlayerSearch = (query: string, limit?: number) => PlayerEntry[];

export function createPlayerSearch(players: PlayerEntry[]): PlayerSearch {
    const fuse = new Fuse(players, {
        keys: ["label", "key"],
        threshold: 0.3, 
        ignoreLocation: true,
        minMatchCharLength: 2,
    });

    return (query, limit = 6) => {
        const q = query.trim();
        if (q.length < 2) return [];
        return fuse.search(q, { limit }).map((r) => r.item);
    };
}
