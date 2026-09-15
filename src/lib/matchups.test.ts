import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getHeroMatchups } from './matchups';

function mockFetchOnce(payload: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: async () => payload,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getHeroMatchups', () => {
  it('parses games_played/wins into a winRate per opponent', async () => {
    mockFetchOnce([
      { hero_id: 2, games_played: 100, wins: 60 },
      { hero_id: 3, games_played: 50, wins: 20 },
    ]);

    const result = await getHeroMatchups(1);
    expect(result.get(2)).toEqual({ games: 100, winRate: 60 });
    expect(result.get(3)).toEqual({ games: 50, winRate: 40 });
  });

  it('drops matchups below the minimum sample size', async () => {
    mockFetchOnce([
      { hero_id: 2, games_played: 100, wins: 60 },
      { hero_id: 3, games_played: 5, wins: 3 }, // too few games to trust
    ]);

    const result = await getHeroMatchups(1);
    expect(result.has(2)).toBe(true);
    expect(result.has(3)).toBe(false);
  });

  it('caches results so a second call does not refetch', async () => {
    const fetchMock = mockFetchOnce([{ hero_id: 2, games_played: 100, wins: 60 }]);

    await getHeroMatchups(1);
    await getHeroMatchups(1);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('serves from a fresh cache without calling fetch at all', async () => {
    const fetchMock = mockFetchOnce([{ hero_id: 2, games_played: 100, wins: 60 }]);
    await getHeroMatchups(1); // populates the cache
    fetchMock.mockClear();

    const result = await getHeroMatchups(1);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.get(2)).toEqual({ games: 100, winRate: 60 });
  });

  it('throws on a non-ok response instead of silently caching nothing', async () => {
    mockFetchOnce([], false);
    await expect(getHeroMatchups(999)).rejects.toThrow();
  });
});
