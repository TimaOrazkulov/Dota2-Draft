const CACHE_PREFIX = 'dota-draft:matchups-v2:';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 1 day
const MIN_MATCHUP_SAMPLE = 20;

export interface MatchupEntry {
  games: number;
  winRate: number; // 0-100, the ANCHOR hero's win rate against this opponent
}

export type GetMatchup = (anchorHeroId: number, opponentHeroId: number) => MatchupEntry | undefined;

interface OpenDotaMatchup {
  hero_id: number;
  games_played: number;
  wins: number;
}

// OpenDota's /heroes/{id}/matchups gives, for the hero in the URL, real
// aggregated win rate against every other hero it's actually been played
// against — grounded in match outcomes rather than our own structural
// heuristics. We fetch it anchored on whichever heroes are already on the
// board (few, 0-10) rather than the whole candidate pool (which can be
// dozens), then look candidates up inside that small set of tables.
export async function getHeroMatchups(heroId: number): Promise<Map<number, MatchupEntry>> {
  const cacheKey = CACHE_PREFIX + heroId;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as { at: number; entries: [number, MatchupEntry][] };
      if (Date.now() - parsed.at < CACHE_TTL_MS && parsed.entries) {
        return new Map(parsed.entries);
      }
    }
  } catch {
    // ignore corrupt cache
  }

  const res = await fetch(`https://api.opendota.com/api/heroes/${heroId}/matchups`);
  if (!res.ok) throw new Error(`OpenDota matchups request failed: ${res.status}`);
  const raw = (await res.json()) as OpenDotaMatchup[];

  const entries: [number, MatchupEntry][] = raw
    .filter((r) => r.games_played >= MIN_MATCHUP_SAMPLE)
    .map((r) => [r.hero_id, { games: r.games_played, winRate: (r.wins / r.games_played) * 100 }]);

  try {
    localStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), entries }));
  } catch {
    // ignore quota errors
  }

  return new Map(entries);
}
