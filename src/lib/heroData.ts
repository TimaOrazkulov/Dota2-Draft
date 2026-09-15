import type { Hero, HeroTag } from '../types';
import { HERO_TAG_OVERLAY } from '../data/heroTagOverlay';
import { HERO_POSITION_OVERLAY } from '../data/heroPositions';

const OPENDOTA_HEROSTATS_URL = 'https://api.opendota.com/api/heroStats';
const IMG_BASE = 'https://cdn.cloudflare.steamstatic.com';
const CACHE_KEY = 'dota-draft:heroes-cache-v5';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 1 day

interface OpenDotaHero {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
  img: string;
  icon: string;
  [bracketField: string]: unknown; // '1_pick', '1_win', ... '8_pick', '8_win'
}

const MIN_META_SAMPLE = 300;

// OpenDota's *_pick/*_win fields are bucketed by skill bracket 1..8
// (Herald..Immortal). We want a "current meta at a serious skill level"
// signal, not a pub-stomp-skewed one, so we sum only bracket 7+ (Divine and
// Immortal) — falling back to the full 1..8 sum when that high-bracket
// sample is too thin (bracket 8/Immortal is frequently 0 in OpenDota's data,
// so in practice this is mostly bracket 7/Divine).
function sumBrackets(h: OpenDotaHero, from: number, to: number): { picks: number; wins: number } {
  let picks = 0;
  let wins = 0;
  for (let bracket = from; bracket <= to; bracket++) {
    picks += Number(h[`${bracket}_pick`] ?? 0);
    wins += Number(h[`${bracket}_win`] ?? 0);
  }
  return { picks, wins };
}

function computeMetaStats(h: OpenDotaHero): { winRate?: number; matches?: number; isHighSkill?: boolean } {
  const highSkill = sumBrackets(h, 7, 8);
  const isHighSkill = highSkill.picks >= MIN_META_SAMPLE;
  const source = isHighSkill ? highSkill : sumBrackets(h, 1, 8);
  if (source.picks < MIN_META_SAMPLE) return {};
  return { winRate: (source.wins / source.picks) * 100, matches: source.picks, isHighSkill };
}

// Deliberately doesn't map OpenDota's 'Disabler' role to our 'hardDisable' tag:
// OpenDota applies it to any soft slow/silence too (e.g. Storm Spirit, Pangolier),
// which made the counter engine claim heroes "land long control" when they don't.
// hardDisable is precise enough that it's only set via the curated overlay.
function deriveAutoTags(h: OpenDotaHero): HeroTag[] {
  const tags = new Set<HeroTag>();
  if (h.attack_type === 'Ranged') tags.add('ranged');
  if (h.attack_type === 'Melee') tags.add('meleeShortRange');
  if (h.roles.includes('Escape')) tags.add('mobility');
  if (h.roles.includes('Nuker')) tags.add('burstMagic');
  if (h.roles.includes('Durable')) tags.add('tanky');
  if (h.roles.includes('Pusher')) {
    tags.add('pushLane');
    tags.add('waveclear');
  }
  return Array.from(tags);
}

// Fallback for heroes without a curated position entry — rough, but keeps
// every hero usable in the position filter instead of falling through.
function deriveFallbackPositions(h: OpenDotaHero): number[] {
  const roles = h.roles ?? [];
  if (roles.includes('Support') && !roles.includes('Carry')) return [4, 5];
  if (roles.includes('Carry')) return [1, 3];
  if (roles.includes('Initiator') || roles.includes('Durable')) return [3];
  if (roles.includes('Nuker')) return [2];
  return [3];
}

function toHero(h: OpenDotaHero): Hero {
  const auto = deriveAutoTags(h);
  const overlay = HERO_TAG_OVERLAY[h.localized_name] ?? [];
  const tags = Array.from(new Set([...auto, ...overlay]));
  const meta = computeMetaStats(h);
  const positions = HERO_POSITION_OVERLAY[h.localized_name] ?? deriveFallbackPositions(h);
  return {
    id: h.id,
    name: h.name,
    localizedName: h.localized_name,
    primaryAttr: (h.primary_attr as Hero['primaryAttr']) ?? 'all',
    attackType: (h.attack_type as Hero['attackType']) ?? 'Melee',
    roles: h.roles ?? [],
    img: IMG_BASE + h.img,
    icon: IMG_BASE + h.icon,
    tags,
    positions,
    metaWinRate: meta.winRate,
    metaMatches: meta.matches,
    metaIsHighSkill: meta.isHighSkill,
  };
}

export async function loadHeroes(): Promise<Hero[]> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as { at: number; heroes: Hero[] };
      if (Date.now() - parsed.at < CACHE_TTL_MS && parsed.heroes?.length) {
        return parsed.heroes;
      }
    }
  } catch {
    // ignore corrupt cache
  }

  const res = await fetch(OPENDOTA_HEROSTATS_URL);
  if (!res.ok) throw new Error(`OpenDota request failed: ${res.status}`);
  const raw = (await res.json()) as OpenDotaHero[];
  const heroes = raw.map(toHero).sort((a, b) => a.localizedName.localeCompare(b.localizedName));

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), heroes }));
  } catch {
    // ignore quota errors
  }

  return heroes;
}
