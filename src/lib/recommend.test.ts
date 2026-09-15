import { describe, expect, it } from 'vitest';
import type { Hero } from '../types';
import { rankCandidates, rankBanThreats } from './recommend';
import type { GetMatchup } from './matchups';

function makeHero(overrides: Partial<Hero> & { id: number; localizedName: string }): Hero {
  return {
    name: `npc_dota_hero_${overrides.id}`,
    primaryAttr: 'all',
    attackType: 'Melee',
    roles: [],
    img: '',
    icon: '',
    tags: [],
    positions: [3],
    ...overrides,
  };
}

describe('rankCandidates — real matchup data term', () => {
  it('does nothing when no getMatchup is supplied (no crash, no notes)', () => {
    const candidate = makeHero({ id: 1, localizedName: 'CandidateA' });
    const enemy = makeHero({ id: 2, localizedName: 'EnemyA' });

    const [result] = rankCandidates([candidate], [enemy], [], new Set());
    expect(result.reasons).toEqual([]);
    expect(result.risks).toEqual([]);
  });

  it('rewards a candidate with a strong real win rate against the enemy pick', () => {
    const strong = makeHero({ id: 1, localizedName: 'StrongPick' });
    const neutral = makeHero({ id: 2, localizedName: 'NeutralPick' });
    const enemy = makeHero({ id: 3, localizedName: 'EnemyHero' });

    // getMatchup is anchored on the enemy: enemy only wins 30% vs StrongPick
    // (i.e. StrongPick wins 70%), and splits evenly against NeutralPick.
    const getMatchup: GetMatchup = (anchorId, opponentId) => {
      if (anchorId === enemy.id && opponentId === strong.id) return { games: 200, winRate: 30 };
      if (anchorId === enemy.id && opponentId === neutral.id) return { games: 200, winRate: 50 };
      return undefined;
    };

    const results = rankCandidates([strong, neutral], [enemy], [], new Set(), { getMatchup });
    const strongResult = results.find((r) => r.hero.id === strong.id)!;
    const neutralResult = results.find((r) => r.hero.id === neutral.id)!;

    expect(strongResult.score).toBeGreaterThan(neutralResult.score);
    expect(strongResult.reasons.some((r) => r.includes('EnemyHero') && r.includes('70%'))).toBe(true);
    expect(neutralResult.reasons).toEqual([]);
    expect(neutralResult.risks).toEqual([]);
  });

  it('flags a bad real matchup as a risk and lowers the score', () => {
    const candidate = makeHero({ id: 1, localizedName: 'BadIntoIt' });
    const enemy = makeHero({ id: 2, localizedName: 'CounterHero' });

    // Enemy wins 68% vs candidate -> candidate only wins 32%.
    const getMatchup: GetMatchup = (anchorId, opponentId) =>
      anchorId === enemy.id && opponentId === candidate.id ? { games: 150, winRate: 68 } : undefined;

    const [result] = rankCandidates([candidate], [enemy], [], new Set(), { getMatchup });
    expect(result.score).toBeLessThan(0);
    expect(result.risks.some((r) => r.includes('CounterHero') && r.includes('32%'))).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it('contributes to score but stays out of the text when the delta is small', () => {
    const candidate = makeHero({ id: 1, localizedName: 'SlightEdge' });
    const enemy = makeHero({ id: 2, localizedName: 'CloseMatchup' });

    // Enemy wins 49% -> candidate wins 51%, a 1-point edge — below the
    // 4-point text threshold but should still nudge the score up a little.
    const getMatchup: GetMatchup = () => ({ games: 100, winRate: 49 });

    const [withData] = rankCandidates([candidate], [enemy], [], new Set(), { getMatchup });
    const [withoutData] = rankCandidates([candidate], [enemy], [], new Set());

    expect(withData.reasons).toEqual([]);
    expect(withData.risks).toEqual([]);
    expect(withData.score).toBeGreaterThan(withoutData.score);
  });
});

describe('rankBanThreats — matchup data anchored on my own picks', () => {
  it('forwards getMatchup so a threat that hard-counters my pick surfaces', () => {
    const myCarry = makeHero({ id: 1, localizedName: 'MyCarry' });
    const banCandidate = makeHero({ id: 2, localizedName: 'ScaryBan' });
    const other = makeHero({ id: 3, localizedName: 'HarmlessHero' });

    // Anchored on myCarry (the "enemyPicks" arg inside rankBanThreats):
    // myCarry only wins 30% against ScaryBan, i.e. ScaryBan is a real threat.
    const getMatchup: GetMatchup = (anchorId, opponentId) =>
      anchorId === myCarry.id && opponentId === banCandidate.id ? { games: 120, winRate: 30 } : undefined;

    const results = rankBanThreats([banCandidate, other], [myCarry], [], new Set(), { getMatchup });
    const scary = results.find((r) => r.hero.id === banCandidate.id)!;
    const harmless = results.find((r) => r.hero.id === other.id)!;

    expect(scary.score).toBeGreaterThan(harmless.score);
    expect(scary.reasons.some((r) => r.includes('MyCarry'))).toBe(true);
  });
});
