// Curated per-hero notes for the most commonly picked carries, keyed by
// OpenDota `localized_name`. Deliberately mechanic/priority-based rather
// than numeric (no specific item costs/stats), so it doesn't rot each patch.
// Heroes not listed fall back to the generic template in `lib/guide.ts`.
export interface CarryGuideEntry {
  laning: string;
  skillOrder: string;
  coreItems: string;
  combo: string;
}

export const CARRY_GUIDES: Record<string, CarryGuideEntry> = {
  'Anti-Mage': {
    laning: 'Фармьте вне контакта, копите Battle Fury золото/опыт. Избегайте стычек до фарма.',
    skillOrder: 'Mana Break и Blink почти поровну, Spell Shield по левелапу, ультимейт при каждой возможности.',
    coreItems: 'Battle Fury → Manta Style → Abyssal Blade/Skadi по ситуации.',
    combo: 'Blink в бэклайн на кастера, добить Mana Break-ом от истощения маны.',
  },
  Juggernaut: {
    laning: 'Агрессивный ближний лайнер, харрасите Blade Fury (спелл-иммунитет во время каста).',
    skillOrder: 'Blade Fury макс первым, Healing Ward по левелапу, ультимейт как только доступен.',
    coreItems: 'Power Treads → Battle Fury/Manta Style → BKB по ситуации.',
    combo: 'Omnislash на изолированную цель или для инициации тимфайта.',
  },
  'Phantom Assassin': {
    laning: 'Пассивно фармьте, избегайте лишних трейдов до BKB — низкий HP-пул до этого.',
    skillOrder: 'Stifling Dagger макс, Blur по левелапу, ультимейт на 6/12/18.',
    coreItems: 'Power Treads → Battle Fury/Desolator → BKB → Abyssal Blade.',
    combo: 'Dagger издалека, добор криткой Coup de Grace.',
  },
  'Faceless Void': {
    laning: 'Фармьте до тимфайтов, Time Walk для безопасного харасса и отхода.',
    skillOrder: 'Time Walk и Time Lock почти поровну, Backtrack по левелапу, ультимейт как доступен.',
    coreItems: 'Power Treads/Phase Boots → Battle Fury → BKB → Butterfly.',
    combo: 'Chronosphere для инициации тимфайта, входите внутрь и добивайте.',
  },
  Spectre: {
    laning: 'Тяжёлый ранний лайн, фармьте Radiance, не форсируйте стычки без Haunt.',
    skillOrder: 'Spectral Dagger и Dispersion почти поровну, ультимейт при каждой возможности.',
    coreItems: 'Radiance → Power Treads → Diffusal Blade/Manta по ситуации.',
    combo: 'Haunt на весь тимфайт врага, Reality-теле в момент, когда решится бой.',
  },
  Terrorblade: {
    laning: 'Фармьте иллюзиями Metamorphosis на второй линии, Sunder — страховка от смерти.',
    skillOrder: 'Metamorphosis и Reflection почти поровну, ультимейт (Illusions) как доступен.',
    coreItems: 'Treads → Battle Fury (на иллюзиях) → Manta Style → BKB.',
    combo: 'Sunder с саппортом/танком, чтобы избежать гибели и продолжить фарм.',
  },
  Medusa: {
    laning: 'Играйте на Mana Shield, безопасно фармите — HP-пул большой за счёт маны.',
    skillOrder: 'Mystic Snake и Mana Shield почти поровну, Split Shot по левелапу.',
    coreItems: 'Power Treads → Manta Style → Skadi → Butterfly.',
    combo: 'Stone Gaze при инициации на вас, откидывайте Mystic Snake для восстановления маны.',
  },
  'Naga Siren': {
    laning: 'Фармьте с иллюзиями Mirror Image, избегайте стычек до Song of the Siren.',
    skillOrder: 'Mirror Image и Riptide почти поровну, ультимейт как доступен.',
    coreItems: 'Treads/Manta Style → Battle Fury на иллюзиях → Radiance/BKB.',
    combo: 'Song of the Siren, чтобы обезопасить тимфайт/пуш, пока фармите.',
  },
  Luna: {
    laning: 'Харрасите Lucent Beam, но не переусердствуйте — низкая база HP.',
    skillOrder: 'Lucent Beam и Moon Glaives почти поровну, ультимейт как доступен.',
    coreItems: 'Power Treads → Battle Fury/Manta Style → BKB.',
    combo: 'Eclipse во время удачной стычки для максимального АоЕ-урона.',
  },
  Gyrocopter: {
    laning: 'Ranged carry с харассом Homing Missile, безопасно доминируйте на линии.',
    skillOrder: 'Flak Cannon и Homing Missile почти поровну, ультимейт как доступен.',
    coreItems: 'Power Treads → Aghanim\'s Scepter → BKB/Butterfly.',
    combo: 'Flak Cannon в групповых стычках, Homing Missile для снятия предметов/лечения.',
  },
  Sven: {
    laning: 'Крепкий ближний керри, Storm Bolt даёт харасс и контроль на линии.',
    skillOrder: 'Storm Bolt и Warcry почти поровну, ультимейт как доступен.',
    coreItems: 'Power Treads → Battle Fury/Echo Sabre → BKB → Daedalus.',
    combo: 'Storm Bolt на цель → Great Cleave в толпе врагов.',
  },
  'Troll Warlord': {
    laning: 'Фармьте Whirling Axes издалека, переключайтесь в мили для бурста.',
    skillOrder: 'Whirling Axes и Fervor почти поровну, ультимейт как доступен.',
    coreItems: 'Power Treads → Battle Fury/Echo Sabre → BKB → Assault Cuirass.',
    combo: 'Battle Trance перед тимфайтом для максимального DPS.',
  },
  Lifestealer: {
    laning: 'Rage даёт спелл-иммунитет для агрессии, харрасите Feast-ом.',
    skillOrder: 'Feast и Rage почти поровну, ультимейт (Infest) по ситуации.',
    coreItems: 'Power Treads → Sange and Yasha/Armlet → BKB.',
    combo: 'Rage перед входом в контроль врага, Open Wounds для дозволивания.',
  },
  'Wraith King': {
    laning: 'Крепкий лайнер, Reincarnation прощает ошибки — играйте агрессивно.',
    skillOrder: 'Wraithfire Blast и Mortal Strike почти поровну, ультимейт как доступен.',
    coreItems: 'Power Treads → Armlet/Battle Fury → BKB → Radiance/Assault.',
    combo: 'Wraithfire Blast для стана-инициации, крит-шансы делают доп. урон.',
  },
  'Chaos Knight': {
    laning: 'Chaos Bolt даёт харасс и контроль, фармьте под Phantasm иллюзиями.',
    skillOrder: 'Chaos Bolt и Chaos Strike почти поровну, ультимейт как доступен.',
    coreItems: 'Power Treads → Armlet/Battle Fury → BKB → Assault Cuirass.',
    combo: 'Chaos Bolt на цель → Phantasm перед решающим тимфайтом.',
  },
  Tiny: {
    laning: 'Гроу даёт урон и НР, кидайте деревья для харасса.',
    skillOrder: 'Avalanche и Toss почти поровну, Grow по левелапу как можно раньше.',
    coreItems: 'Boots → Blink Dagger/Echo Sabre → BKB → Aghanim\'s Scepter.',
    combo: 'Avalanche → Toss комбо для бурста и контроля.',
  },
  Slark: {
    laning: 'Играйте осторожно на линии, силу набираете от Essence Shift после убийств.',
    skillOrder: 'Pounce и Dark Pact почти поровну, ультимейт как доступен.',
    coreItems: 'Power Treads → Shadow Blade/Falcon Blade → BKB/Silver Edge.',
    combo: 'Dark Pact снимает диспелом дебаффы, Pounce для инициации/побега.',
  },
  Weaver: {
    laning: 'Играйте на дистанции, Shukuchi для харасса и безопасного забега.',
    skillOrder: 'Shukuchi и Geminate Attack почти поровну, ультимейт как доступен.',
    coreItems: 'Power Treads → Diffusal Blade/Skadi → BKB.',
    combo: 'Time Lapse откатывает урон/дебаффы — держите как страховку.',
  },
  Ursa: {
    laning: 'Overpower стакается на атаках — фармьте нейтралов агрессивно.',
    skillOrder: 'Earthshock/Fury Swipes и Overpower почти поровну, ультимейт как доступен.',
    coreItems: 'Power Treads → Blink Dagger/Echo Sabre → BKB.',
    combo: 'Enrage (спелл-иммунитет) → Overpower стаки на цель.',
  },
  'Templar Assassin': {
    laning: 'Harass Psi Blades через деревья/юнитов, Refraction для безопасного трейда.',
    skillOrder: 'Refraction и Psi Blades почти поровну, ультимейт как доступен.',
    coreItems: 'Power Treads → Blink Dagger → Desolator/BKB.',
    combo: 'Meld для скрытого бурста, Refraction перед входом в бой.',
  },
  Riki: {
    laning: 'Играйте от невидимости, забирайте килы саппортам.',
    skillOrder: 'Blink Strike и Tricks of the Trade почти поровну, ультимейт как доступен.',
    coreItems: 'Power Treads → Diffusal Blade → Desolator/BKB.',
    combo: 'Smoke Screen перед бурстом, атака из невидимости для крита.',
  },
  'Void Spirit': {
    laning: 'Мобильный ранний харасс через Resonant Pulse и Aether Remnant.',
    skillOrder: 'Resonant Pulse и Aether Remnant почти поровну, ультимейт как доступен.',
    coreItems: 'Boots → Kaya and Sange → BKB → Aghanim\'s Scepter.',
    combo: 'Aether Remnant задерживает цель, Dissimilate для добора.',
  },
  'Ember Spirit': {
    laning: 'Sleight of Fist для харасса волны и линии одновременно.',
    skillOrder: 'Flame Guard и Sleight of Fist почти поровну, ультимейт как доступен.',
    coreItems: 'Boots → Maelstrom/Kaya and Sange → BKB/Aghanim\'s Scepter.',
    combo: 'Fire Remnant для мобильности/побега, Sleight of Fist для бурста по толпе.',
  },
  'Storm Spirit': {
    laning: 'Играйте на мане — Ball Lightning дорогая по мане, фармьте таймингово.',
    skillOrder: 'Ball Lightning и Overload почти поровну, ультимейт как доступен.',
    coreItems: 'Boots → Bottle/Null Talismans → Kaya and Sange → BKB.',
    combo: 'Ball Lightning в бэклайн на цель с малым HP.',
  },
  Morphling: {
    laning: 'Waveform для харасса и мобильности, копите привилегированные статы.',
    skillOrder: 'Waveform и Adaptive Strike почти поровну, ультимейт (Morph) как доступен.',
    coreItems: 'Power Treads → Dragon Lance/Skadi → BKB → Butterfly.',
    combo: 'Adaptive Strike + Waveform репозиция для добора.',
  },
  'Drow Ranger': {
    laning: 'Играйте максимально пассивно, харрасите Frost Arrows издалека.',
    skillOrder: 'Frost Arrows и Multishot почти поровну, аура (Precision Aura) по левелапу.',
    coreItems: 'Power Treads → Dragon Lance/Maelstrom → BKB/Silver Edge.',
    combo: 'Multishot в узких проходах, Gust для контроля на добор.',
  },
  Sniper: {
    laning: 'Максимальная дистанция атаки, держитесь за спинами союзников.',
    skillOrder: 'Headshot и Take Aim почти поровну, ультимейт как доступен.',
    coreItems: 'Power Treads → Dragon Lance/Maelstrom → BKB → Butterfly.',
    combo: 'Assassinate для добора издалека, Shrapnel для контроля территории.',
  },
  'Shadow Fiend': {
    laning: 'Фармьте душами Necromastery агрессивно, харрасите Shadowraze.',
    skillOrder: 'Shadowraze макс первым, ультимейт (Requiem) как доступен.',
    coreItems: 'Power Treads → Battle Fury/Maelstrom → BKB.',
    combo: 'Requiem of Souls добавляет урон за собранные души — сначала фарм, потом бой.',
  },
  Invoker: {
    laning: 'Гибкий керри/мидер, ротируйте заклинания под ситуацию (Quas-Wex для мобильности/контроля).',
    skillOrder: 'Приоритет орбов зависит от стиля: Quas-Wex для контроля/мобильности, Exort для бурста.',
    coreItems: 'Boots → Aghanim\'s Scepter → BKB/Octarine Core.',
    combo: 'Sun Strike для добора издалека, Tornado+EMP для АоЕ-контроля/маноснятия.',
  },
  Tinker: {
    laning: 'Фармьте безопасно на дистанции, используйте March of the Machines/Laser для харасса.',
    skillOrder: 'Laser и March of the Machines почти поровну, ультимейт для перезарядки предметов.',
    coreItems: 'Boots of Travel → Octarine Core → Aghanim\'s Scepter.',
    combo: 'Rearm перезаряжает Blink+бомбы для быстрого добора и отхода.',
  },
  'Dragon Knight': {
    laning: 'Крепкий лайнер, Breathe Fire для харасса волны и героев.',
    skillOrder: 'Breathe Fire и Dragon Blood почти поровну, ультимейт (Elder Dragon Form) как доступен.',
    coreItems: 'Power Treads → Blink Dagger/Desolator → BKB.',
    combo: 'Elder Dragon Form даёт дальний бой и АоЕ — переходите в бой на форме.',
  },
  'Queen of Pain': {
    laning: 'Играйте на мане, харрасите Shadow Strike, разрывайте дистанцию Blink.',
    skillOrder: 'Shadow Strike и Blink почти поровну, ультимейт как доступен.',
    coreItems: 'Boots → Kaya and Sange → BKB/Aghanim\'s Scepter.',
    combo: 'Blink + Sonic Wave по толпе для АоЕ-бурста.',
  },
  Leshrac: {
    laning: 'Split Earth и Diabolic Edict дают сильный харасс по волне и героям.',
    skillOrder: 'Split Earth и Lightning Storm почти поровну, ультимейт (Pulse Nova) по левелапу.',
    coreItems: 'Boots → Aghanim\'s Scepter → BKB/Shiva\'s Guard.',
    combo: 'Split Earth для стана-инициации, Diabolic Edict добивает толпу.',
  },
  'Lone Druid': {
    laning: 'Играйте медведем на линии, сами оставайтесь в безопасности.',
    skillOrder: 'Spirit Bear навыки медведя почти поровну, ультимейт (True Form) как доступен.',
    coreItems: 'На медведя: Power Treads → Battle Fury → BKB.',
    combo: 'Synergy связывает бонусы медведя с собой — держите оба живыми.',
  },
  Marci: {
    laning: 'Sidekick даёт защиту союзнику, Rebound для мобильности и харасса.',
    skillOrder: 'Rebound и Guardian почти поровну, ультимейт как доступен.',
    coreItems: 'Boots → Echo Sabre → BKB/Aghanim\'s Scepter.',
    combo: 'Unleash для бурста после разгона, Rebound для побега/погони.',
  },
  Pangolier: {
    laning: 'Swashbuckle для харасса волны, Rolling Thunder — спелл-иммунитет и контроль.',
    skillOrder: 'Swashbuckle и Shield Crash почти поровну, ультимейт как доступен.',
    coreItems: 'Boots → Echo Sabre/Silver Edge → BKB не нужен (своя иммунность на ульте).',
    combo: 'Rolling Thunder для инициации тимфайта под спелл-иммунитетом.',
  },
  Brewmaster: {
    laning: 'Крепкий лайнер, Cinder Brew + Thunder Clap для харасса и контроля.',
    skillOrder: 'Cinder Brew и Thunder Clap почти поровну, ультимейт (Primal Split) как доступен.',
    coreItems: 'Power Treads → Blink Dagger → BKB/Aghanim\'s Scepter.',
    combo: 'Primal Split для мощного тимфайт-импакта на пике боя.',
  },
  Dawnbreaker: {
    laning: 'Крепкий лайнер, Fire Wreath для харасса и мобильности.',
    skillOrder: 'Fire Wreath и Celestial Hammer почти поровну, ультимейт как доступен.',
    coreItems: 'Power Treads → Echo Sabre/Silver Edge → BKB.',
    combo: 'Solar Guardian для глобального импакта и лечения на тимфайте.',
  },
  Muerta: {
    laning: 'Играйте на дистанции, Dead Shot для харасса и контроля.',
    skillOrder: 'Dead Shot и Gunslinger почти поровну, ультимейт как доступен.',
    coreItems: 'Power Treads → Maelstrom/Dragon Lance → BKB.',
    combo: 'The Calling для АоЕ-разрыва позиций перед добором.',
  },
};
