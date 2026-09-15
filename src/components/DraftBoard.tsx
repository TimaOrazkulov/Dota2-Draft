import { useEffect, useMemo, useState } from 'react';
import type { Hero } from '../types';
import { useDraft } from '../hooks/useDraft';
import { TOTAL_STEPS } from '../data/captainsMode';
import { rankCandidates, rankBanThreats } from '../lib/recommend';
import { useMatchups } from '../hooks/useMatchups';
import { TeamColumn } from './TeamColumn';
import { HeroGrid } from './HeroGrid';
import { SuggestionPanel } from './SuggestionPanel';
import { GuidePanel } from './GuidePanel';
import { TopBar } from './TopBar';
import { matchesMyPosition, positionPanelTitle } from '../lib/positions';

interface Props {
  heroes: Hero[];
  myPosition: number;
  mySideFirst: boolean;
  onNewDraft: () => void;
}

const BAN_SLOTS = 6;
const PICK_SLOTS = 5;

export function DraftBoard({ heroes, myPosition, mySideFirst, onNewDraft }: Props) {
  const draft = useDraft(mySideFirst);
  const heroById = useMemo(() => new Map(heroes.map((h) => [h.id, h])), [heroes]);
  const [guideHeroId, setGuideHeroId] = useState<number | null>(null);

  const resolve = (entries: { heroId: number }[]) => entries.map((e) => heroById.get(e.heroId) ?? null);

  const myBans = resolve(draft.myBans);
  const enemyBans = resolve(draft.enemyBans);
  const myPicksHeroes = resolve(draft.myPicks).filter(Boolean) as Hero[];
  const enemyPicksHeroes = resolve(draft.enemyPicks).filter(Boolean) as Hero[];

  const myBanSlots = Array.from({ length: BAN_SLOTS }, (_, i) => myBans[i] ?? null);
  const enemyBanSlots = Array.from({ length: BAN_SLOTS }, (_, i) => enemyBans[i] ?? null);
  const myPickSlots = Array.from({ length: PICK_SLOTS }, (_, i) => myPicksHeroes[i] ?? null);
  const enemyPickSlots = Array.from({ length: PICK_SLOTS }, (_, i) => enemyPicksHeroes[i] ?? null);

  const positionPool = useMemo(
    () => heroes.filter((h) => matchesMyPosition(h.positions, myPosition)),
    [heroes, myPosition],
  );

  // Real match-outcome win rates (OpenDota), anchored on whichever heroes
  // are already on the board — cheap (a handful of fetches, not the whole
  // pool) and feeds both the pick suggestions and the ban threats below.
  const boardHeroIds = useMemo(
    () => [...myPicksHeroes, ...enemyPicksHeroes].map((h) => h.id),
    [myPicksHeroes, enemyPicksHeroes],
  );
  const { getMatchup } = useMatchups(boardHeroIds);

  const suggestions = useMemo(
    () => rankCandidates(positionPool, enemyPicksHeroes, myPicksHeroes, draft.usedHeroIds, { getMatchup }),
    [positionPool, enemyPicksHeroes, myPicksHeroes, draft.usedHeroIds, getMatchup],
  );

  // Backed by structural counters once there are picks to react to, and by
  // live OpenDota win rate before that — so even ban #1 has a real signal.
  const banThreats = useMemo(
    () => rankBanThreats(heroes, myPicksHeroes, enemyPicksHeroes, draft.usedHeroIds, { getMatchup }),
    [heroes, myPicksHeroes, enemyPicksHeroes, draft.usedHeroIds, getMatchup],
  );

  // Auto-open the guide the moment my team locks in a hero for my position.
  useEffect(() => {
    const lastMine = [...draft.myPicks]
      .reverse()
      .find((e) => matchesMyPosition(heroById.get(e.heroId)?.positions ?? [], myPosition));
    if (lastMine) setGuideHeroId(lastMine.heroId);
  }, [draft.myPicks, heroById, myPosition]);

  const guideHero = guideHeroId != null ? heroById.get(guideHeroId) ?? null : null;

  const step = draft.currentStep;
  const turnLabel = draft.isComplete
    ? 'Драфт завершён'
    : step
      ? `Шаг ${draft.currentStepIndex + 1}/${TOTAL_STEPS}: ${step.action === 'ban' ? 'Бан' : 'Пик'} — ${
          step.team === 'my' ? 'моя команда' : 'противник'
        }`
      : '';

  return (
    <div className="draft-board">
      <TopBar modeLabel="Captains Mode" onExit={onNewDraft}>
        <button className="btn" onClick={draft.undo} disabled={draft.currentStepIndex === 0}>
          Отменить шаг
        </button>
      </TopBar>

      <div className={`turn-banner ${draft.isComplete ? 'turn-banner--done' : step?.team === 'my' ? 'turn-banner--mine' : 'turn-banner--enemy'}`}>
        {turnLabel}
      </div>

      <div className="draft-board__teams">
        <TeamColumn
          title="Моя команда"
          isMine
          bans={myBanSlots}
          picks={myPickSlots}
          highlightAction={step?.team === 'my' ? step.action : null}
          onSelectPick={(h) => setGuideHeroId(h.id)}
        />
        <TeamColumn
          title="Противник"
          isMine={false}
          bans={enemyBanSlots}
          picks={enemyPickSlots}
          highlightAction={step?.team === 'enemy' ? step.action : null}
          onSelectPick={(h) => setGuideHeroId(h.id)}
        />
      </div>

      {!draft.isComplete && step?.team === 'my' && step.action === 'pick' && (
        <SuggestionPanel
          suggestions={suggestions}
          onPick={draft.pickOrBan}
          title={`Топ героев на ${positionPanelTitle(myPosition)}`}
          emptyText="Нет доступных героев."
        />
      )}

      {!draft.isComplete && step?.team === 'my' && step.action === 'ban' && (
        <SuggestionPanel
          suggestions={banThreats}
          onPick={draft.pickOrBan}
          title="Топ угроз — кого банить"
          actionLabel="Забанить"
          labels={{
            reason: 'Угрожает вашей команде',
            synergy: 'Усилит пики противника',
            risk: 'У вас уже есть ответ',
          }}
        />
      )}

      {!draft.isComplete && (
        <HeroGrid
          heroes={heroes}
          usedHeroIds={draft.usedHeroIds}
          disabled={draft.isComplete}
          myPosition={myPosition}
          onSelect={(h) => draft.pickOrBan(h.id)}
        />
      )}

      {guideHero && (
        <GuidePanel hero={guideHero} enemyPicks={enemyPicksHeroes} onClose={() => setGuideHeroId(null)} />
      )}
    </div>
  );
}
