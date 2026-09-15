import { useCallback, useEffect, useRef, useState } from 'react';
import { getHeroMatchups, type GetMatchup, type MatchupEntry } from '../lib/matchups';

// Ensures matchup tables are loaded for every hero currently on the board
// (both sides — a few, not the whole candidate pool) and exposes a
// synchronous lookup once they've arrived. Returns undefined for any pair
// not yet loaded, so callers can treat it as "no data yet" rather than
// blocking on a promise.
export function useMatchups(anchorHeroIds: number[]): { getMatchup: GetMatchup } {
  const [tables, setTables] = useState<Map<number, Map<number, MatchupEntry>>>(new Map());
  const requestedRef = useRef(new Set<number>());
  const key = anchorHeroIds.slice().sort((a, b) => a - b).join(',');

  useEffect(() => {
    const toLoad = anchorHeroIds.filter((id) => !requestedRef.current.has(id));
    if (toLoad.length === 0) return;
    for (const id of toLoad) requestedRef.current.add(id);

    let cancelled = false;
    Promise.all(toLoad.map((id) => getHeroMatchups(id).then((m) => [id, m] as const)))
      .then((results) => {
        if (cancelled) return;
        setTables((prev) => {
          const next = new Map(prev);
          for (const [id, m] of results) next.set(id, m);
          return next;
        });
      })
      .catch(() => {
        // Network hiccup or rate limit — matchup term just won't contribute
        // for these heroes; structural rules and meta win rate still do.
      });

    return () => {
      cancelled = true;
    };
    // `key` is a stable, sorted string derived from anchorHeroIds — used
    // deliberately instead of the array itself so this doesn't refetch on
    // every render just because callers pass a fresh array reference.
  }, [key]);

  const getMatchup = useCallback<GetMatchup>(
    (anchorHeroId, opponentHeroId) => tables.get(anchorHeroId)?.get(opponentHeroId),
    [tables],
  );

  return { getMatchup };
}
