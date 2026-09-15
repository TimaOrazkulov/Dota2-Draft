// Structural tag vocabulary used by the counter-pick engine. These describe
// *mechanics* a hero has (or lacks), not patch-specific numbers, so the model
// stays valid across balance patches.
export type HeroTag =
  | 'hardDisable'
  | 'silence'
  | 'burstMagic'
  | 'burstPhysical'
  | 'sustainedDPS'
  | 'dispel'
  | 'spellImmunity'
  | 'mobility'
  | 'globalPresence'
  | 'invisibility'
  | 'detection'
  | 'summons'
  | 'evasion'
  | 'waveclear'
  | 'pushLane'
  | 'tanky'
  | 'sustain'
  | 'ranged'
  | 'meleeShortRange'
  | 'channeledUlt';

export interface Hero {
  id: number;
  name: string; // npc_dota_hero_x
  localizedName: string;
  primaryAttr: 'str' | 'agi' | 'int' | 'all';
  attackType: 'Melee' | 'Ranged';
  roles: string[];
  img: string; // absolute URL
  icon: string; // absolute URL
  tags: HeroTag[];
  positions: number[]; // typical Dota positions 1-5 (1 = safe-lane carry, 5 = hard support)
  metaWinRate?: number; // 0-100, Divine+/Immortal when there's enough sample, else all brackets
  metaMatches?: number; // sample size behind metaWinRate
  metaIsHighSkill?: boolean; // true if metaWinRate came from the Divine+/Immortal bracket specifically
}

export type TeamId = 'my' | 'enemy';

export type DraftActionType = 'ban' | 'pick';

export interface DraftStep {
  team: TeamId;
  action: DraftActionType;
}

export interface DraftEntry {
  step: number;
  team: TeamId;
  action: DraftActionType;
  heroId: number;
}

export interface DraftState {
  mySideFirst: boolean; // did "my" team act first in the sequence?
  entries: DraftEntry[]; // history, in order
}

export interface Suggestion {
  hero: Hero;
  score: number;
  reasons: string[]; // counters vs enemy picks, positive (RU)
  risks: string[]; // vulnerable to enemy picks, negative (RU)
  synergies: string[]; // combos with your own picks (RU)
  metaNote?: string; // live win-rate signal (RU), when notably strong
  positionLabel?: string; // which position(s) this hero is being suggested for (RU)
  balanceNote?: string; // team-composition gap this hero fills (RU), when relevant
}
