import { useEffect, useMemo, useState } from 'react';
import type { Hero, TeamId } from '../types';
import { useAllPick } from '../hooks/useAllPick';
import { rankCandidates } from '../lib/recommend';
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
  onExit: () => void;
}

const PICK_SLOTS = 5;

export function AllPickBoard({ heroes, myPosition, onExit }: Props) {
  const ap = useAllPick();
  const heroById = useMemo(() => new Map(heroes.map((h) => [h.id, h])), [heroes]);
  const [target, setTarget] = useState<TeamId>('my');
  const [guideHeroId, setGuideHeroId] = useState<number | null>(null);

  const resolve = (ids: number[]) => ids.map((id) => heroById.get(id)).filter(Boolean) as Hero[];
  const myPicksHeroes = resolve(ap.my);
  const enemyPicksHeroes = resolve(ap.enemy);

  const myPickSlots = Array.from({ length: PICK_SLOTS }, (_, i) => myPicksHeroes[i] ?? null);
  const enemyPickSlots = Array.from({ length: PICK_SLOTS }, (_, i) => enemyPicksHeroes[i] ?? null);

  const positionPool = useMemo(
    () => heroes.filter((h) => matchesMyPosition(h.positions, myPosition)),
    [heroes, myPosition],
  );
  const boardHeroIds = useMemo(
    () => [...myPicksHeroes, ...enemyPicksHeroes].map((h) => h.id),
    [myPicksHeroes, enemyPicksHeroes],
  );
  const { getMatchup } = useMatchups(boardHeroIds);

  const suggestions = useMemo(
    () => rankCandidates(positionPool, enemyPicksHeroes, myPicksHeroes, ap.usedHeroIds, { getMatchup }),
    [positionPool, enemyPicksHeroes, myPicksHeroes, ap.usedHeroIds, getMatchup],
  );

  useEffect(() => {
    const lastMine = [...ap.my].reverse().find((id) => matchesMyPosition(heroById.get(id)?.positions ?? [], myPosition));
    if (lastMine != null) setGuideHeroId(lastMine);
  }, [ap.my, heroById, myPosition]);

  const guideHero = guideHeroId != null ? heroById.get(guideHeroId) ?? null : null;

  const myFull = ap.my.length >= ap.maxPicks;
  const enemyFull = ap.enemy.length >= ap.maxPicks;

  const handleSelect = (hero: Hero) => {
    ap.addPick(target, hero.id);
    if (target === 'my' && ap.my.length + 1 >= ap.maxPicks && !enemyFull) setTarget('enemy');
    else if (target === 'enemy' && ap.enemy.length + 1 >= ap.maxPicks && !myFull) setTarget('my');
  };

  return (
    <div className="draft-board">
      <TopBar modeLabel="All Pick" onExit={onExit} />

      <div className="target-switch">
        <span className="target-switch__label">Добавляю героя в:</span>
        <button
          className={`segmented ${target === 'my' ? 'segmented--active' : ''}`}
          onClick={() => setTarget('my')}
          disabled={myFull}
        >
          Моя команда ({ap.my.length}/{ap.maxPicks})
        </button>
        <button
          className={`segmented segmented--enemy ${target === 'enemy' ? 'segmented--active' : ''}`}
          onClick={() => setTarget('enemy')}
          disabled={enemyFull}
        >
          Противник ({ap.enemy.length}/{ap.maxPicks})
        </button>
      </div>

      <div className="draft-board__teams">
        <TeamColumn
          title="Моя команда"
          isMine
          picks={myPickSlots}
          onSelectPick={(h) => setGuideHeroId(h.id)}
          onRemovePick={(h) => ap.removePick('my', h.id)}
        />
        <TeamColumn
          title="Противник"
          isMine={false}
          picks={enemyPickSlots}
          onSelectPick={(h) => setGuideHeroId(h.id)}
          onRemovePick={(h) => ap.removePick('enemy', h.id)}
        />
      </div>

      {!myFull && (
        <SuggestionPanel
          suggestions={suggestions}
          onPick={(heroId) => handleSelect(heroById.get(heroId) as Hero)}
          title={`Топ героев на ${positionPanelTitle(myPosition)} для моей команды`}
          emptyText="Нет доступных героев."
        />
      )}

      <HeroGrid
        heroes={heroes}
        usedHeroIds={ap.usedHeroIds}
        disabled={false}
        myPosition={myPosition}
        onSelect={handleSelect}
      />

      {guideHero && (
        <GuidePanel hero={guideHero} enemyPicks={enemyPicksHeroes} onClose={() => setGuideHeroId(null)} />
      )}
    </div>
  );
}
