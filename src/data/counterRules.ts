import type { HeroTag } from '../types';

// Structural counter rules. Each rule says: a hero with one of `attackerTags`
// threatens a victim hero when the victim either HAS `victimHasTag`, or LACKS
// all of `victimLacksAllTags`. Rules are evaluated symmetrically (attacker vs
// victim, and victim vs attacker) by the scoring engine, so this single table
// captures both "who counters what" and "what am I vulnerable to."
//
// `reason` takes just the OTHER hero's name — the card's own hero is already
// the card's title, so repeating it would be noise. Kept to 2-4 words: this
// is a quick-scan bullet list, not prose.
export interface CounterRule {
  id: string;
  attackerTags: HeroTag[];
  victimHasTag?: HeroTag;
  victimLacksAllTags?: HeroTag[];
  weight: number;
  reason: (name: string) => string;
}

export const COUNTER_RULES: CounterRule[] = [
  {
    id: 'hard-disable-vs-no-escape',
    attackerTags: ['hardDisable'],
    victimLacksAllTags: ['spellImmunity', 'dispel', 'mobility'],
    weight: 3,
    reason: (v) => `${v} — контроль без выхода`,
  },
  {
    id: 'burst-magic-vs-no-defense',
    attackerTags: ['burstMagic'],
    victimLacksAllTags: ['spellImmunity', 'dispel'],
    weight: 2.5,
    reason: (v) => `${v} — бурст без защиты`,
  },
  {
    id: 'burst-physical-vs-fragile',
    attackerTags: ['burstPhysical'],
    victimLacksAllTags: ['tanky', 'sustain'],
    weight: 1.5,
    reason: (v) => `${v} — физ. бурст, хрупкий`,
  },
  {
    id: 'silence-vs-no-defense',
    attackerTags: ['silence'],
    victimLacksAllTags: ['spellImmunity', 'dispel'],
    weight: 2,
    reason: (v) => `${v} — силенс без защиты`,
  },
  {
    id: 'detection-vs-invis',
    attackerTags: ['detection'],
    victimHasTag: 'invisibility',
    weight: 2,
    reason: (v) => `${v} — снимает невидимость`,
  },
  {
    id: 'invis-vs-no-detection',
    attackerTags: ['invisibility'],
    victimLacksAllTags: ['detection'],
    weight: 1.2,
    reason: (v) => `${v} — нет детекта`,
  },
  {
    id: 'waveclear-vs-pushlane',
    attackerTags: ['waveclear', 'burstMagic'],
    victimHasTag: 'pushLane',
    weight: 1.5,
    reason: (v) => `${v} — рубит пуш волной`,
  },
  {
    id: 'waveclear-vs-summons',
    attackerTags: ['waveclear', 'burstMagic'],
    victimHasTag: 'summons',
    weight: 1.5,
    reason: (v) => `${v} — АоЕ против саммонов`,
  },
  {
    id: 'global-vs-pushlane',
    attackerTags: ['globalPresence'],
    victimHasTag: 'pushLane',
    weight: 1.3,
    reason: (v) => `${v} — глобал против сплит-пуша`,
  },
  {
    id: 'interrupt-channel',
    attackerTags: ['hardDisable', 'silence'],
    victimHasTag: 'channeledUlt',
    weight: 2,
    reason: (v) => `${v} — прерывает канал`,
  },
  {
    id: 'mobility-vs-melee-no-gapcloser',
    attackerTags: ['mobility'],
    victimHasTag: 'meleeShortRange',
    weight: 1.2,
    reason: (v) => `${v} — кайтит ближника`,
  },
  {
    id: 'sustain-vs-burst-magic',
    attackerTags: ['sustain'],
    victimHasTag: 'burstMagic',
    weight: 1.3,
    reason: (v) => `${v} — реген против бурста`,
  },
  {
    id: 'true-damage-vs-evasion',
    attackerTags: ['burstMagic', 'sustainedDPS'],
    victimHasTag: 'evasion',
    weight: 1.5,
    reason: (v) => `${v} — игнорирует эвейжен`,
  },
  {
    id: 'sustained-dps-vs-fragile',
    attackerTags: ['sustainedDPS'],
    victimLacksAllTags: ['tanky', 'sustain'],
    weight: 1.5,
    reason: (v) => `${v} — DPS против хрупких`,
  },
  {
    id: 'dispel-vs-hard-disable',
    attackerTags: ['dispel'],
    victimHasTag: 'hardDisable',
    weight: 1,
    reason: (v) => `${v} — диспелит контроль`,
  },
];
