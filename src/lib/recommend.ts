import type { Hero, Suggestion } from '../types';
import { COUNTER_RULES } from '../data/counterRules';
import { SYNERGY_RULES } from '../data/synergyRules';
import { COMPOSITION_ASPECTS, hasAspect } from '../data/teamAspects';
import { formatPositions } from './positions';

function ruleApplies(rule: (typeof COUNTER_RULES)[number], attacker: Hero, victim: Hero): boolean {
  if (!rule.attackerTags.some((t) => attacker.tags.includes(t))) return false;
  if (rule.victimHasTag && !victim.tags.includes(rule.victimHasTag)) return false;
  if (rule.victimLacksAllTags && rule.victimLacksAllTags.some((t) => victim.tags.includes(t))) return false;
  return true;
}

interface Matchup {
  score: number;
  reasons: string[];
  risks: string[];
}

function matchupAgainst(candidate: Hero, enemy: Hero): Matchup {
  let score = 0;
  const reasons: string[] = [];
  const risks: string[] = [];

  for (const rule of COUNTER_RULES) {
    if (ruleApplies(rule, candidate, enemy)) {
      score += rule.weight;
      reasons.push(rule.reason(enemy.localizedName));
    }
    if (ruleApplies(rule, enemy, candidate)) {
      score -= rule.weight * 0.8;
      risks.push(rule.reason(enemy.localizedName));
    }
  }

  return { score, reasons, risks };
}

function synergyWith(candidate: Hero, ally: Hero): { score: number; synergies: string[] } {
  let score = 0;
  const synergies: string[] = [];
  for (const rule of SYNERGY_RULES) {
    if (rule.candidateTags.some((t) => candidate.tags.includes(t)) && ally.tags.includes(rule.allyHasTag)) {
      score += rule.weight;
      synergies.push(rule.reason(ally.localizedName));
    }
  }
  return { score, synergies };
}

// Draft-balance nudge: does the candidate cover something your current picks
// are short on (control, teamfight AoE, sustain, detection, mobility,
// frontline, or a farm-priority position-1 core)? Independent of the enemy
// draft — this is about not ending up with five heroes doing the same job.
function teamBalanceBonus(candidate: Hero, allyPicks: Hero[]): { score: number; note?: string } {
  if (allyPicks.length === 0) return { score: 0 };
  let score = 0;
  let note: string | undefined;

  for (const aspect of COMPOSITION_ASPECTS) {
    const covered = allyPicks.filter((h) => hasAspect(h, aspect)).length;
    if (covered >= aspect.target) continue;
    if (hasAspect(candidate, aspect)) {
      score += aspect.weight;
      note ??= `Баланс: нужен ${aspect.label}`;
    }
  }

  const farmCore = allyPicks.filter((h) => h.positions.includes(1)).length;
  if (farmCore < 1 && candidate.positions.includes(1)) {
    score += 1;
    note ??= 'Баланс: нужен фарм-керри';
  }

  return { score, note };
}

function dedupe(items: string[]): string[] {
  return Array.from(new Set(items));
}

export function rankCandidates(
  candidates: Hero[],
  enemyPicks: Hero[],
  allyPicks: Hero[],
  excludedIds: Set<number>,
  options: { metaWeight?: number } = {},
): Suggestion[] {
  const metaWeight = options.metaWeight ?? 0.3;
  const pool = candidates.filter((h) => !excludedIds.has(h.id));

  const suggestions: Suggestion[] = pool.map((hero) => {
    let score = 0;
    const reasons: string[] = [];
    const risks: string[] = [];
    const synergies: string[] = [];
    let metaNote: string | undefined;

    for (const enemy of enemyPicks) {
      const m = matchupAgainst(hero, enemy);
      score += m.score;
      reasons.push(...m.reasons);
      risks.push(...m.risks);
    }

    for (const ally of allyPicks) {
      const s = synergyWith(hero, ally);
      score += s.score;
      synergies.push(...s.synergies);
    }

    const balance = teamBalanceBonus(hero, allyPicks);
    score += balance.score;

    if (metaWeight && hero.metaWinRate != null) {
      const delta = hero.metaWinRate - 50;
      score += metaWeight * delta;
      if (delta >= 1.5) {
        metaNote = `Мета${hero.metaIsHighSkill ? ' (Divine+)' : ''}: ${hero.metaWinRate.toFixed(1)}% WR`;
      }
    }

    return {
      hero,
      score,
      reasons: dedupe(reasons).slice(0, 4),
      risks: dedupe(risks).slice(0, 2),
      synergies: dedupe(synergies).slice(0, 3),
      metaNote,
      positionLabel: formatPositions(hero.positions),
      balanceNote: balance.note,
    };
  });

  return suggestions.sort((a, b) => b.score - a.score);
}

// Ban-phase framing: which available heroes are the biggest threat to ban
// away? Same scoring, just viewed from the other side — "candidate" here is
// a hypothetical enemy pick, so it's scored against MY picks (as the thing
// it would counter), WITH the enemy's existing picks (as its synergy), and
// against the ENEMY's composition gaps (denying them what they're missing
// is also a legitimate reason to ban). Not restricted to the Carry pool
// since a ban-worthy threat can be any role. A live OpenDota win-rate term
// is folded in too, so the very first ban of the draft (before anyone's
// picked anything, and the counter engine has nothing to work with) still
// ranks by who's actually strong in the current meta, instead of coming up
// empty.
export function rankBanThreats(
  allHeroes: Hero[],
  myPicks: Hero[],
  enemyPicks: Hero[],
  excludedIds: Set<number>,
): Suggestion[] {
  return rankCandidates(allHeroes, myPicks, enemyPicks, excludedIds, { metaWeight: 0.5 });
}
