import type { HeroTag } from '../types';

// Ally-ally structural synergy. Unlike counterRules (candidate vs enemy),
// these look at the candidate against heroes already on YOUR team, so
// suggestions also reward combos (control -> follow-up burst, etc.), not
// just answers to the enemy draft.
//
// `reason` takes just the ally's name (2-4 word phrase, same convention as
// counterRules — the card's own hero is implicit).
export interface SynergyRule {
  id: string;
  candidateTags: HeroTag[];
  allyHasTag: HeroTag;
  weight: number;
  reason: (allyName: string) => string;
}

export const SYNERGY_RULES: SynergyRule[] = [
  {
    id: 'burst-follows-disable',
    candidateTags: ['burstMagic', 'burstPhysical'],
    allyHasTag: 'hardDisable',
    weight: 1.5,
    reason: (a) => `${a} — добор после контроля`,
  },
  {
    id: 'disable-sets-up-burst',
    candidateTags: ['hardDisable'],
    allyHasTag: 'burstMagic',
    weight: 1.2,
    reason: (a) => `${a} — бурст под ваш контроль`,
  },
  {
    id: 'waveclear-with-push',
    candidateTags: ['waveclear', 'pushLane'],
    allyHasTag: 'pushLane',
    weight: 0.8,
    reason: (a) => `${a} — усиливает пуш`,
  },
  {
    id: 'detection-for-invis-ally',
    candidateTags: ['detection'],
    allyHasTag: 'invisibility',
    weight: 0.6,
    reason: (a) => `${a} — безопаснее от невидимости`,
  },
  {
    id: 'global-with-split',
    candidateTags: ['globalPresence'],
    allyHasTag: 'pushLane',
    weight: 0.6,
    reason: (a) => `${a} — поддержка сплит-пуша`,
  },
  {
    id: 'burst-follows-silence',
    candidateTags: ['burstMagic', 'burstPhysical'],
    allyHasTag: 'silence',
    weight: 1.3,
    reason: (a) => `${a} — силенс перед бурстом`,
  },
  {
    id: 'poke-behind-tank',
    candidateTags: ['ranged', 'burstMagic'],
    allyHasTag: 'tanky',
    weight: 0.6,
    reason: (a) => `${a} — держит фронт для вашего пока`,
  },
  {
    id: 'sustain-lets-you-trade',
    candidateTags: ['burstPhysical', 'meleeShortRange'],
    allyHasTag: 'sustain',
    weight: 0.6,
    reason: (a) => `${a} — лечение под ваш агрессив`,
  },
];
