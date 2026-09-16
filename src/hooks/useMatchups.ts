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
    // allSettled, not all: one slow/failing hero shouldn't discard the
    // successful fetches for every other hero in the same batch.
    Promise.allSettled(
      toLoad.map((id) => getHeroMatchups(id).then((m): [number, Map<number, MatchupEntry>] => [id, m])),
    ).then((results) => {
      if (cancelled) return;
      const loaded: [number, Map<number, MatchupEntry>][] = [];
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          loaded.push(result.value);
        } else {
          // Network hiccup, rate limit, or the 20s cap tripped — matchup
          // term just won't contribute for this hero this time (structural
          // rules and meta win rate still do). Un-mark it as requested so
          // the next render with a changed anchor list gets another try,
          // instead of silently giving up for the rest of the session.
          requestedRef.current.delete(toLoad[i]);
        }
      });
      if (loaded.length === 0) return;
      setTables((prev) => {
        const next = new Map(prev);
        for (const [id, m] of loaded) next.set(id, m);
        return next;
      });
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
