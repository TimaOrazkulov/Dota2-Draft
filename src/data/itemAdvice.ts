import type { HeroTag } from '../types';

// Situational item suggestions keyed by an *enemy* structural tag. Generic
// and mechanic-based (not tied to current item costs/numbers), so it stays
// useful across patches. `itemsFor` aggregates advice for every tag present
// across the enemy lineup and de-duplicates by item name.
export const ITEM_ADVICE: Partial<Record<HeroTag, { item: string; reason: string }[]>> = {
  hardDisable: [
    { item: 'Black King Bar', reason: 'даёт спелл-иммунитет от большинства дизейблов' },
    { item: 'Aeon Disk / Lotus Orb', reason: 'страховка/отражение, если BKB не по стилю героя' },
  ],
  burstMagic: [
    { item: 'Aeon Disk', reason: 'бесплатное восстановление после магического бурста' },
    { item: "Linken's Sphere", reason: 'блокирует одно вражеское воздействие, включая нюки' },
    { item: 'Glimmer Cape (командный)', reason: 'невидимость + магорезист от бурст-урона' },
  ],
  silence: [
    { item: 'Black King Bar', reason: 'силенс — это дебафф, BKB блокирует его наложение' },
    { item: 'Manta Style', reason: 'снимает силенс активкой' },
  ],
  invisibility: [
    { item: 'Sentry Ward / Dust of Appearance', reason: 'дешёвый способ раскрыть невидимого героя' },
    { item: 'Gem of True Sight', reason: 'постоянное true sight против частой невидимости' },
  ],
  evasion: [
    { item: 'Monkey King Bar', reason: 'даёт true strike, обходит эвейжен' },
  ],
  spellImmunity: [
    { item: 'Nullifier', reason: 'снимает спелл-иммунитет и мобильность на удар' },
    { item: 'Diffusal Blade / Orchid', reason: 'purge/силенс достаёт героя вне BKB-окна' },
  ],
  summons: [
    { item: 'Battle Fury / Mjollnir / Radiance', reason: 'АоЕ-урон массово убирает саммонов и иллюзии' },
  ],
  dispel: [
    { item: 'Scythe of Vyse', reason: 'хекс пробивает большинство диспелов' },
    { item: 'Orchid Malevolence / Bloodthorn', reason: 'силенс-лок сложно снять диспелом до убийства' },
  ],
  mobility: [
    { item: 'Blink Dagger / Shadow Blade', reason: 'догоняете мобильного героя, а не он вас' },
    { item: 'Orchid Malevolence / Bloodthorn', reason: 'силенс останавливает побег через активки' },
  ],
  tanky: [
    { item: 'Silver Edge / Desolator', reason: 'break пассивок и снижение брони танка' },
    { item: 'Abyssal Blade', reason: 'пробивной стан, пока танк не набрал критическую массу лечения' },
  ],
  channeledUlt: [
    { item: 'Orchid Malevolence', reason: 'силенс прерывает каналящийся ультимейт' },
  ],
  globalPresence: [
    { item: 'Boots of Travel', reason: 'быстрее реагируете на глобальные способности/телепорты врага' },
  ],
};

export function itemsForEnemyTags(tags: Set<HeroTag>): { item: string; reason: string }[] {
  const seen = new Set<string>();
  const result: { item: string; reason: string }[] = [];
  for (const tag of tags) {
    const list = ITEM_ADVICE[tag];
    if (!list) continue;
    for (const entry of list) {
      if (seen.has(entry.item)) continue;
      seen.add(entry.item);
      result.push(entry);
    }
  }
  return result;
}
