import type { Hero, HeroTag } from '../types';

// Draft-balance aspects: things a healthy 5-man team wants some minimum
// coverage of. Used to nudge suggestions toward filling a gap in your own
// picks (e.g. zero control, zero sustain) rather than only reacting to the
// enemy. `target` is the rough number of heroes covering that aspect a team
// wants before it's "enough" — not a hard requirement, just a soft need.
export interface CompositionAspect {
  id: string;
  label: string; // short RU label, used in "нужен: <label>" notes
  tags: HeroTag[];
  target: number;
  weight: number;
}

export const COMPOSITION_ASPECTS: CompositionAspect[] = [
  { id: 'control', label: 'контроль', tags: ['hardDisable', 'silence'], target: 2, weight: 1.2 },
  { id: 'teamfight', label: 'урон по площади', tags: ['burstMagic', 'waveclear'], target: 2, weight: 1 },
  { id: 'sustain', label: 'сустейн/лечение', tags: ['sustain'], target: 1, weight: 1 },
  { id: 'detection', label: 'детект невидимости', tags: ['detection'], target: 1, weight: 0.8 },
  { id: 'initiation', label: 'мобильность/инициация', tags: ['mobility'], target: 2, weight: 0.6 },
  { id: 'frontline', label: 'крепкий фронтлайн', tags: ['tanky'], target: 1, weight: 0.6 },
];

export function hasAspect(hero: Hero, aspect: CompositionAspect): boolean {
  return aspect.tags.some((t) => hero.tags.includes(t));
}
