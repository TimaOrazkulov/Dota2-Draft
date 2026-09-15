import { describe, expect, it } from 'vitest';
import { extractDraft, readTeamSlots } from './draft-parser.js';

describe('readTeamSlots', () => {
  it('collects positive numeric ids in slot order', () => {
    const team = { ban0_id: 14, ban1_id: 22, ban2_id: 8 };
    expect(readTeamSlots(team, 'ban', 5)).toEqual([14, 22, 8]);
  });

  it('skips 0 (Dota\'s "not chosen yet" sentinel)', () => {
    const team = { ban0_id: 14, ban1_id: 0, ban2_id: 0 };
    expect(readTeamSlots(team, 'ban', 5)).toEqual([14]);
  });

  it('skips non-number values instead of throwing', () => {
    const team = { ban0_id: 'not-a-number', ban1_id: null, ban2_id: 8 };
    expect(readTeamSlots(team, 'ban', 5)).toEqual([8]);
  });

  it('returns an empty array for an undefined team object', () => {
    expect(readTeamSlots(undefined, 'ban', 5)).toEqual([]);
  });

  it('stops at maxIndex', () => {
    const team = { pick0_id: 1, pick1_id: 2, pick2_id: 3 };
    expect(readTeamSlots(team, 'pick', 1)).toEqual([1, 2]);
  });
});

describe('extractDraft', () => {
  it('returns null when there is no draft key', () => {
    expect(extractDraft({})).toBeNull();
    expect(extractDraft({ provider: { name: 'Dota 2' } })).toBeNull();
  });

  it('returns null for a non-object body', () => {
    expect(extractDraft(null)).toBeNull();
    expect(extractDraft('not an object')).toBeNull();
    expect(extractDraft(undefined)).toBeNull();
  });

  it('parses activeteam, pick phase, and both teams from a full payload', () => {
    const result = extractDraft({
      draft: {
        activeteam: 3,
        pick: true,
        team2: { home_team: true, ban0_id: 8, pick0_id: 1 },
        team3: { home_team: false, ban0_id: 5, pick0_id: 6 },
      },
    });

    expect(result).toEqual({
      activeteam: 3,
      isPickPhase: true,
      teams: [
        { teamNum: 2, homeTeam: true, bans: [8], picks: [1] },
        { teamNum: 3, homeTeam: false, bans: [5], picks: [6] },
      ],
    });
  });

  it('defaults activeteam to null and isPickPhase to false when absent', () => {
    const result = extractDraft({ draft: { team2: {}, team3: {} } });
    expect(result.activeteam).toBeNull();
    expect(result.isPickPhase).toBe(false);
  });

  it('treats a missing team object as an empty team (no bans/picks, not home)', () => {
    const result = extractDraft({ draft: { activeteam: 2 } });
    expect(result.teams).toEqual([
      { teamNum: 2, homeTeam: false, bans: [], picks: [] },
      { teamNum: 3, homeTeam: false, bans: [], picks: [] },
    ]);
  });

  it('only trusts home_team when it is exactly boolean true', () => {
    const result = extractDraft({
      draft: { team2: { home_team: 'true' }, team3: { home_team: 1 } },
    });
    expect(result.teams[0].homeTeam).toBe(false);
    expect(result.teams[1].homeTeam).toBe(false);
  });

  it('never looks at player/hero data even if present in the payload', () => {
    // Defence in depth: even if a differently-configured Dota client ever
    // sent extra components, extractDraft must not surface them.
    const result = extractDraft({
      draft: { activeteam: 2, team2: {}, team3: {} },
      player: { steamid: '76561198000000000', name: 'someone' },
      hero: { id: 1, name: 'npc_dota_hero_antimage' },
    });
    expect(result).not.toHaveProperty('player');
    expect(result).not.toHaveProperty('hero');
  });
});
