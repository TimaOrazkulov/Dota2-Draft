import type { Suggestion } from '../types';

interface GroupLabels {
  reason: string;
  synergy: string;
  risk: string;
}

interface Props {
  suggestions: Suggestion[];
  onPick: (heroId: number) => void;
  title?: string;
  emptyText?: string;
  actionLabel?: string;
  labels?: GroupLabels;
}

const DEFAULT_LABELS: GroupLabels = {
  reason: 'Контрит',
  synergy: 'Комбо со своими',
  risk: 'Риск',
};

export function SuggestionPanel({
  suggestions,
  onPick,
  title = 'Топ контрпиков',
  emptyText = 'Нет доступных героев.',
  actionLabel,
  labels = DEFAULT_LABELS,
}: Props) {
  const top = suggestions.slice(0, 5);
  const maxScore = Math.max(1, ...top.map((s) => Math.abs(s.score)));

  return (
    <div className="suggestion-panel">
      <h3>{title}</h3>
      {top.length === 0 && <p className="muted">{emptyText}</p>}
      <div className="suggestion-panel__list">
        {top.map((s, i) => {
          const barPct = Math.max(4, Math.min(100, (Math.max(0, s.score) / maxScore) * 100));
          return (
            <div
              key={s.hero.id}
              className="suggestion-card"
              onClick={() => onPick(s.hero.id)}
              title={actionLabel}
            >
              <div className="suggestion-card__rank">{i + 1}</div>
              <div className="suggestion-card__body">
                <div className="suggestion-card__head">
                  <span className="suggestion-card__name">{s.hero.localizedName}</span>
                  <span className="suggestion-card__score">{s.score.toFixed(1)}</span>
                </div>
                {s.positionLabel && <div className="suggestion-card__position">{s.positionLabel}</div>}
                <div className="suggestion-card__bar-track">
                  <div className="suggestion-card__bar-fill" style={{ width: `${barPct}%` }} />
                </div>
                <div className="suggestion-card__badges">
                  {s.metaNote && <span className="suggestion-card__meta">{s.metaNote}</span>}
                  {s.balanceNote && <span className="suggestion-card__balance">{s.balanceNote}</span>}
                </div>
                {s.reasons.length > 0 && (
                  <div className="suggestion-card__group suggestion-card__group--reason">
                    <span className="suggestion-card__group-label">{labels.reason}</span>
                    <ul>
                      {s.reasons.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {s.synergies.length > 0 && (
                  <div className="suggestion-card__group suggestion-card__group--synergy">
                    <span className="suggestion-card__group-label">{labels.synergy}</span>
                    <ul>
                      {s.synergies.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {s.risks.length > 0 && (
                  <div className="suggestion-card__group suggestion-card__group--risk">
                    <span className="suggestion-card__group-label">{labels.risk}</span>
                    <ul>
                      {s.risks.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
