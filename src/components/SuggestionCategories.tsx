import type { PositionSuggestions } from '../lib/recommend';
import { POSITION_NAMES } from '../lib/positions';
import { SuggestionPanel } from './SuggestionPanel';

interface Props {
  byPosition: PositionSuggestions[];
  onPick: (heroId: number) => void;
  emptyText?: string;
  actionLabel?: string;
  limit?: number;
}

export function SuggestionCategories({ byPosition, onPick, emptyText, actionLabel, limit = 8 }: Props) {
  return (
    <div className="suggestion-categories">
      {byPosition.map(({ position, suggestions }) => (
        <SuggestionPanel
          key={position}
          suggestions={suggestions}
          onPick={onPick}
          title={`Поз. ${position} — ${POSITION_NAMES[position]}`}
          emptyText={emptyText}
          actionLabel={actionLabel}
          limit={limit}
          hidePositionLabel
        />
      ))}
    </div>
  );
}
