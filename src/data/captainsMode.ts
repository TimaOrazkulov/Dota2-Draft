import type { DraftStep, TeamId } from '../types';

// Standard modern Captains Mode sequence: 12 bans + 10 picks (5 picks per side),
// alternating in the well-known ban/pick block pattern. Team "A" is whichever
// side acts first (decided by the coin toss in a real match); we let the user
// say whether that is "my" team or the enemy's.
//
// NOTE: exact ban/pick counts have shifted slightly between patches in the
// past. If 7.41e's Captains Mode differs from this, tweak the sequence below —
// everything else in the app (suggestions, guides) is independent of it.
const SEQUENCE: Array<{ team: 'A' | 'B'; action: 'ban' | 'pick' }> = [
  { team: 'A', action: 'ban' },
  { team: 'B', action: 'ban' },
  { team: 'A', action: 'ban' },
  { team: 'B', action: 'ban' },
  { team: 'A', action: 'pick' },
  { team: 'B', action: 'pick' },
  { team: 'B', action: 'ban' },
  { team: 'A', action: 'ban' },
  { team: 'B', action: 'ban' },
  { team: 'A', action: 'ban' },
  { team: 'B', action: 'pick' },
  { team: 'A', action: 'pick' },
  { team: 'A', action: 'pick' },
  { team: 'B', action: 'pick' },
  { team: 'A', action: 'ban' },
  { team: 'B', action: 'ban' },
  { team: 'A', action: 'pick' },
  { team: 'B', action: 'pick' },
  { team: 'B', action: 'ban' },
  { team: 'A', action: 'ban' },
  { team: 'B', action: 'pick' },
  { team: 'A', action: 'pick' },
];

export function buildDraftSequence(mySideFirst: boolean): DraftStep[] {
  return SEQUENCE.map((s) => {
    const isA = s.team === 'A';
    const team: TeamId = isA === mySideFirst ? 'my' : 'enemy';
    return { team, action: s.action };
  });
}

export const TOTAL_STEPS = SEQUENCE.length;
