import { useEffect, useState } from 'react';
import type { Hero } from '../types';
import { loadHeroes } from '../lib/heroData';

interface HeroesState {
  heroes: Hero[];
  loading: boolean;
  error: string | null;
}

export function useHeroes(): HeroesState {
  const [state, setState] = useState<HeroesState>({ heroes: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    loadHeroes()
      .then((heroes) => {
        if (!cancelled) setState({ heroes, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            heroes: [],
            loading: false,
            error: err instanceof Error ? err.message : 'Не удалось загрузить список героев',
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
