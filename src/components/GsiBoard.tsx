import { useEffect, useMemo, useState } from 'react';
import type { Hero } from '../types';
import { useGsiDraft } from '../hooks/useGsiDraft';
import { rankCandidates, rankBanThreats } from '../lib/recommend';
import { useMatchups } from '../hooks/useMatchups';
import { TeamColumn } from './TeamColumn';
import { SuggestionPanel } from './SuggestionPanel';
import { GuidePanel } from './GuidePanel';
import { TopBar } from './TopBar';
import { matchesMyPosition, positionPanelTitle } from '../lib/positions';

interface Props {
  heroes: Hero[];
  myPosition: number;
  myIsRadiant: boolean;
  onExit: () => void;
}

const BAN_SLOTS = 6;
const PICK_SLOTS = 5;

export function GsiBoard({ heroes, myPosition, myIsRadiant, onExit }: Props) {
  const { status, draft } = useGsiDraft(true);
  const heroById = useMemo(() => new Map(heroes.map((h) => [h.id, h])), [heroes]);
  const [guideHeroId, setGuideHeroId] = useState<number | null>(null);

  const myTeam = draft?.teams.find((t) => t.homeTeam === myIsRadiant) ?? null;
  const enemyTeam = draft?.teams.find((t) => t.homeTeam !== myIsRadiant) ?? null;

  const resolve = (ids: number[]) => ids.map((id) => heroById.get(id)).filter(Boolean) as Hero[];
  const myBansHeroes = resolve(myTeam?.bans ?? []);
  const enemyBansHeroes = resolve(enemyTeam?.bans ?? []);
  const myPicksHeroes = resolve(myTeam?.picks ?? []);
  const enemyPicksHeroes = resolve(enemyTeam?.picks ?? []);
  const usedHeroIds = useMemo(
    () => new Set([...myBansHeroes, ...enemyBansHeroes, ...myPicksHeroes, ...enemyPicksHeroes].map((h) => h.id)),
    [myBansHeroes, enemyBansHeroes, myPicksHeroes, enemyPicksHeroes],
  );

  const myBanSlots = Array.from({ length: BAN_SLOTS }, (_, i) => myBansHeroes[i] ?? null);
  const enemyBanSlots = Array.from({ length: BAN_SLOTS }, (_, i) => enemyBansHeroes[i] ?? null);
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
    () => rankCandidates(positionPool, enemyPicksHeroes, myPicksHeroes, usedHeroIds, { getMatchup }),
    [positionPool, enemyPicksHeroes, myPicksHeroes, usedHeroIds, getMatchup],
  );
  const banThreats = useMemo(
    () => rankBanThreats(heroes, myPicksHeroes, enemyPicksHeroes, usedHeroIds, { getMatchup }),
    [heroes, myPicksHeroes, enemyPicksHeroes, usedHeroIds, getMatchup],
  );

  // Auto-open the guide the moment my team locks in a hero for my position.
  useEffect(() => {
    const lastMine = [...myPicksHeroes].reverse().find((h) => matchesMyPosition(h.positions, myPosition));
    if (lastMine) setGuideHeroId(lastMine.id);
  }, [myPicksHeroes, myPosition]);

  const guideHero = guideHeroId != null ? heroById.get(guideHeroId) ?? null : null;

  const isMyTurn = draft != null && myTeam != null && draft.activeteam === myTeam.teamNum;
  const currentAction = draft?.isPickPhase ? 'pick' : 'ban';

  let turnLabel: string;
  if (status === 'unreachable') {
    turnLabel = 'Нет связи с gsi-server — проверьте, что он запущен (см. gsi-server/README.md)';
  } else if (status === 'connecting' || !draft) {
    turnLabel = 'Ожидание данных из игры... начните драфт в Captains Mode';
  } else {
    turnLabel = `${currentAction === 'ban' ? 'Бан' : 'Пик'} — ${isMyTurn ? 'моя команда' : 'противник'}`;
  }

  return (
    <div className="draft-board">
      <TopBar modeLabel="GSI · авто из игры" onExit={onExit} />

      <div
        className={`turn-banner ${
          status === 'unreachable' ? 'turn-banner--enemy' : isMyTurn ? 'turn-banner--mine' : 'turn-banner--done'
        }`}
      >
        {turnLabel}
      </div>

      <div className="draft-board__teams">
        <TeamColumn
          title="Моя команда"
          isMine
          bans={myBanSlots}
          picks={myPickSlots}
          highlightAction={isMyTurn ? currentAction : null}
          onSelectPick={(h) => setGuideHeroId(h.id)}
        />
        <TeamColumn
          title="Противник"
          isMine={false}
          bans={enemyBanSlots}
          picks={enemyPickSlots}
          highlightAction={!isMyTurn ? currentAction : null}
          onSelectPick={(h) => setGuideHeroId(h.id)}
        />
      </div>

      {isMyTurn && currentAction === 'pick' && (
        <SuggestionPanel
          suggestions={suggestions}
          onPick={setGuideHeroId}
          title={`Топ героев на ${positionPanelTitle(myPosition)}`}
          emptyText="Нет доступных героев."
          actionLabel="Посмотреть гайд"
        />
      )}

      {isMyTurn && currentAction === 'ban' && (
        <SuggestionPanel
          suggestions={banThreats}
          onPick={setGuideHeroId}
          title="Топ угроз — кого банить"
          actionLabel="Посмотреть гайд"
          labels={{
            reason: 'Угрожает вашей команде',
            synergy: 'Усилит пики противника',
            risk: 'У вас уже есть ответ',
          }}
        />
      )}

      {guideHero && (
        <GuidePanel hero={guideHero} enemyPicks={enemyPicksHeroes} onClose={() => setGuideHeroId(null)} />
      )}
    </div>
  );
}
