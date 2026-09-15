import { useMemo, useState } from 'react';
import type { Hero } from '../types';
import { HeroBadge } from './HeroBadge';
import { ANY_POSITION, matchesMyPosition } from '../lib/positions';

interface Props {
  heroes: Hero[];
  usedHeroIds: Set<number>;
  disabled: boolean;
  onSelect: (hero: Hero) => void;
  myPosition?: number;
}

const ATTR_FILTERS: { label: string; value: Hero['primaryAttr'] | 'all' }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Сила', value: 'str' },
  { label: 'Ловкость', value: 'agi' },
  { label: 'Интеллект', value: 'int' },
];

export function HeroGrid({ heroes, usedHeroIds, disabled, onSelect, myPosition }: Props) {
  const [query, setQuery] = useState('');
  const [attrFilter, setAttrFilter] = useState<Hero['primaryAttr'] | 'all'>('all');
  const [positionOnly, setPositionOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return heroes.filter((h) => {
      if (attrFilter !== 'all' && h.primaryAttr !== attrFilter) return false;
      if (positionOnly && myPosition != null && !matchesMyPosition(h.positions, myPosition)) return false;
      if (q && !h.localizedName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [heroes, query, attrFilter, positionOnly, myPosition]);

  return (
    <div className="hero-grid-wrap">
      <div className="hero-grid__controls">
        <input
          className="hero-grid__search"
          placeholder="Поиск героя..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="hero-grid__attrs">
          {ATTR_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`chip ${attrFilter === f.value ? 'chip--active' : ''}`}
              onClick={() => setAttrFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
          {myPosition != null && myPosition !== ANY_POSITION && (
            <button className={`chip ${positionOnly ? 'chip--active' : ''}`} onClick={() => setPositionOnly((v) => !v)}>
              Только моя позиция
            </button>
          )}
        </div>
      </div>
      <div className="hero-grid">
        {filtered.map((hero) => {
          const used = usedHeroIds.has(hero.id);
          return (
            <button
              key={hero.id}
              className="hero-grid__item"
              disabled={used || disabled}
              onClick={() => onSelect(hero)}
            >
              <HeroBadge hero={hero} size="sm" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
