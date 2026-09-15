import { useMemo, useState } from 'react';
import type { TeamId } from '../types';

const MAX_PICKS = 5;

export function useAllPick() {
  const [my, setMy] = useState<number[]>([]);
  const [enemy, setEnemy] = useState<number[]>([]);

  const usedHeroIds = useMemo(() => new Set([...my, ...enemy]), [my, enemy]);

  const addPick = (team: TeamId, heroId: number) => {
    if (usedHeroIds.has(heroId)) return;
    if (team === 'my') {
      if (my.length >= MAX_PICKS) return;
      setMy((prev) => [...prev, heroId]);
    } else {
      if (enemy.length >= MAX_PICKS) return;
      setEnemy((prev) => [...prev, heroId]);
    }
  };

  const removePick = (team: TeamId, heroId: number) => {
    if (team === 'my') setMy((prev) => prev.filter((id) => id !== heroId));
    else setEnemy((prev) => prev.filter((id) => id !== heroId));
  };

  const reset = () => {
    setMy([]);
    setEnemy([]);
  };

  return { my, enemy, usedHeroIds, addPick, removePick, reset, maxPicks: MAX_PICKS };
}
