import type { Hero, HeroTag } from '../types';
import { CARRY_GUIDES } from '../data/carryGuides';
import { itemsForEnemyTags } from '../data/itemAdvice';

export interface GeneratedGuide {
  title: string;
  roleLine: string;
  laning: string;
  skillOrder: string;
  startingItems: string;
  coreItems: string;
  situationalItems: { item: string; reason: string }[];
  combo: string;
}

const STARTING_ITEMS_BY_ATTR: Record<Hero['primaryAttr'], string> = {
  str: 'Tango, Quelling Blade, Gauntlets/Branches, набор от харасса (Salve/Circlet)',
  agi: 'Quelling Blade, Slippers of Agility/Circlet, Branches, Tango',
  int: 'Circlet, Branches, Tango, Clarity',
  all: 'Tango, Branches, Circlet — универсальный набор',
};

function genericLaningTip(hero: Hero): string {
  if (hero.attackType === 'Ranged') {
    return 'Используйте преимущество дальности атаки — харрасьте, не входя в зону ответа врага.';
  }
  return 'Вы ближний боец — избегайте лишнего харасса от дальних героев, фармите креп вне зоны их атаки.';
}

function genericSkillOrder(hero: Hero): string {
  if (hero.tags.includes('mobility')) {
    return 'Максимизируйте фарм/харасс-скилл и скилл мобильности почти поровну, берите ультимейт при каждой возможности.';
  }
  if (hero.tags.includes('hardDisable')) {
    return 'Приоритет — скилл контроля и основной урон-скилл почти поровну, ультимейт как только доступен.';
  }
  return 'Максимизируйте основной фарм/урон-скилл, берите второй ключевой скилл по одному очку, ультимейт при каждой возможности.';
}

function genericCoreItems(hero: Hero): string {
  const boots = 'Power Treads/Phase Boots';
  if (hero.tags.includes('sustain')) {
    return `${boots} → предмет под самолечение/атакспид (например Armlet/Battle Fury) → BKB по ситуации.`;
  }
  return `${boots} → основной урон-предмет под стиль игры (Battle Fury для фарма, Bloodthorn/Echo Sabre для бурста) → BKB по ситуации.`;
}

function genericCombo(hero: Hero): string {
  if (hero.tags.includes('mobility') && hero.tags.includes('burstMagic')) {
    return 'Закрывайте дистанцию мобильностью и добивайте бурст-способностями до ответа врага.';
  }
  if (hero.tags.includes('hardDisable')) {
    return 'Начинайте бой контролем на приоритетную цель, затем добивайте основным уроном.';
  }
  return 'Используйте окно мобильности/иммунитета (если есть) для безопасного входа в бой и добора урона.';
}

export function generateGuide(hero: Hero, enemyPicks: Hero[]): GeneratedGuide {
  const curated = CARRY_GUIDES[hero.localizedName];
  const enemyTags = new Set<HeroTag>();
  for (const e of enemyPicks) for (const t of e.tags) enemyTags.add(t);

  return {
    title: `${hero.localizedName} — гайд`,
    roleLine: `Роли (OpenDota): ${hero.roles.join(', ') || '—'} · ${hero.attackType === 'Ranged' ? 'дальний бой' : 'ближний бой'}`,
    laning: curated?.laning ?? genericLaningTip(hero),
    skillOrder: curated?.skillOrder ?? genericSkillOrder(hero),
    startingItems: STARTING_ITEMS_BY_ATTR[hero.primaryAttr],
    coreItems: curated?.coreItems ?? genericCoreItems(hero),
    situationalItems: itemsForEnemyTags(enemyTags),
    combo: curated?.combo ?? genericCombo(hero),
  };
}
