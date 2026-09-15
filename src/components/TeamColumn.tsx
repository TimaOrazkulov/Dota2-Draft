import type { Hero } from '../types';
import { HeroBadge } from './HeroBadge';

interface Props {
  title: string;
  isMine: boolean;
  bans?: (Hero | null)[];
  picks: (Hero | null)[];
  highlightAction?: 'ban' | 'pick' | null;
  onSelectPick?: (hero: Hero) => void;
  onRemovePick?: (hero: Hero) => void;
}

export function TeamColumn({ title, isMine, bans, picks, highlightAction, onSelectPick, onRemovePick }: Props) {
  return (
    <div className={`team-column ${isMine ? 'team-column--mine' : 'team-column--enemy'}`}>
      <h2>{title}</h2>
      {bans && (
        <div className="team-column__section">
          <span className="team-column__label">
            Баны {highlightAction === 'ban' ? <em>← сейчас</em> : null}
          </span>
          <div className="team-column__bans">
            {bans.map((h, i) => (
              <HeroBadge key={i} hero={h} size="sm" banned />
            ))}
          </div>
        </div>
      )}
      <div className="team-column__section">
        <span className="team-column__label">
          Пики {highlightAction === 'pick' ? <em>← сейчас</em> : null}
        </span>
        <div className="team-column__picks">
          {picks.map((h, i) => (
            <HeroBadge
              key={i}
              hero={h}
              size="md"
              empty={`#${i + 1}`}
              onClick={h && onSelectPick ? () => onSelectPick(h) : undefined}
              onRemove={h && onRemovePick ? () => onRemovePick(h) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
