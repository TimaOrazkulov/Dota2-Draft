import type { Hero } from '../types';

interface Props {
  hero: Hero | null;
  size?: 'sm' | 'md' | 'lg';
  banned?: boolean;
  empty?: string;
  onClick?: () => void;
  onRemove?: () => void;
  active?: boolean;
}

export function HeroBadge({ hero, size = 'md', banned, empty, onClick, onRemove, active }: Props) {
  const cls = ['hero-badge', `hero-badge--${size}`, banned ? 'hero-badge--banned' : '', active ? 'hero-badge--active' : '']
    .filter(Boolean)
    .join(' ');

  if (!hero) {
    return (
      <div className={cls + ' hero-badge--empty'}>
        <span>{empty ?? ''}</span>
      </div>
    );
  }

  return (
    <div className={cls + (onClick ? ' hero-badge--clickable' : '')} onClick={onClick} title={hero.localizedName}>
      <div className="hero-badge__frame">
        <img src={hero.img} alt={hero.localizedName} loading="lazy" />
        {banned && <span className="hero-badge__ban-slash" />}
      </div>
      {size !== 'sm' && <span className="hero-badge__name">{hero.localizedName}</span>}
      {onRemove && (
        <button
          className="hero-badge__remove"
          title="Убрать"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
