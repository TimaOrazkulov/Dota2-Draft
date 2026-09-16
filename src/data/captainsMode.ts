import type { DraftStep, TeamId } from '../types';

// Captains Mode draft order. Verified against Liquipedia's Game Modes
// Changelog (liquipedia.net/dota2/Game_Modes/Changelog), which explicitly
// has no entries for 7.40 or 7.41 — the structure has been unchanged since
// patch 7.34 and is still current in 7.41f, despite some secondary sources
// (mis)reporting a 7.40 change. The 7.34 changelog entry gives the
// authoritative aggregate split:
//   First-pick team (A):  3-2-2 bans, 1-3-1 picks  → 7 bans / 5 picks
//   Second-pick team (B): 4-1-2 bans, 1-3-1 picks  → 7 bans / 5 picks
// 24 actions total: 14 bans + 10 picks.
//
// Team "A" is whichever side acts first (decided by the coin toss in a real
// match); we let the user say whether that is "my" team or the enemy's.
//
// The per-phase bans/picks TOTALS above are authoritative (Liquipedia). The
// turn-by-turn order within each phase below matches those totals exactly
// and is corroborated by multiple independent write-ups of the 7.34 order,
// but isn't a screenshot of a live draft — if you see it differ in-game,
// this array is the only thing that needs editing.
const SEQUENCE: Array<{ team: 'A' | 'B'; action: 'ban' | 'pick' }> = [
  // Phase 1: bans 3-2-2/4-1-2 block 1 (A:3, B:4), then first picks (A:1, B:1)
  { team: 'A', action: 'ban' },
  { team: 'A', action: 'ban' },
  { team: 'B', action: 'ban' },
  { team: 'B', action: 'ban' },
  { team: 'A', action: 'ban' },
  { team: 'B', action: 'ban' },
  { team: 'B', action: 'ban' },
  { team: 'A', action: 'pick' },
  { team: 'B', action: 'pick' },
  // Phase 2: bans block 2 (A:2, B:1), then picks block (A:3, B:3)
  { team: 'A', action: 'ban' },
  { team: 'A', action: 'ban' },
  { team: 'B', action: 'ban' },
  { team: 'B', action: 'pick' },
  { team: 'A', action: 'pick' },
  { team: 'A', action: 'pick' },
  { team: 'B', action: 'pick' },
  { team: 'B', action: 'pick' },
  { team: 'A', action: 'pick' },
  // Phase 3: bans block 3 (A:2, B:2), then final picks (A:1, B:1)
  { team: 'A', action: 'ban' },
  { team: 'B', action: 'ban' },
  { team: 'A', action: 'ban' },
  { team: 'B', action: 'ban' },
  { team: 'A', action: 'pick' },
  { team: 'B', action: 'pick' },
];

export function buildDraftSequence(mySideFirst: boolean): DraftStep[] {
  return SEQUENCE.map((s) => {
    const isA = s.team === 'A';
    const team: TeamId = isA === mySideFirst ? 'my' : 'enemy';
    return { team, action: s.action };
  });
}

export const TOTAL_STEPS = SEQUENCE.length;
export const MAX_BAN_SLOTS = 7;
export const PICKS_PER_SIDE = 5;
