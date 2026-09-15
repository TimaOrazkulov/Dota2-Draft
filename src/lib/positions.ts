export const ANY_POSITION = 0;

export const POSITION_NAMES: Record<number, string> = {
  1: 'Керри',
  2: 'Мидлейнер',
  3: 'Оффлейнер',
  4: 'Полусаппорт',
  5: 'Хардсаппорт',
};

export const POSITION_OPTIONS = [1, 2, 3, 4, 5];

export function formatPositions(positions: number[] | undefined): string {
  if (!positions || positions.length === 0) return '';
  const nums = positions.join('/');
  const names = positions.map((p) => POSITION_NAMES[p]).join('/');
  return `Поз. ${nums} — ${names}`;
}

export function matchesMyPosition(heroPositions: number[], myPosition: number): boolean {
  return myPosition === ANY_POSITION || heroPositions.includes(myPosition);
}

export function positionPanelTitle(myPosition: number): string {
  return myPosition === ANY_POSITION ? 'любую позицию' : `позицию ${myPosition} (${POSITION_NAMES[myPosition]})`;
}
