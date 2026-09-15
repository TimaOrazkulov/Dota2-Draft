import type { ReactNode } from 'react';

interface Props {
  modeLabel: string;
  onExit: () => void;
  children?: ReactNode;
}

export function TopBar({ modeLabel, onExit, children }: Props) {
  return (
    <div className="top-bar">
      <div className="top-bar__title">
        <span className="top-bar__app">Dota 2 Draft Helper</span>
        <span className="top-bar__mode">{modeLabel}</span>
      </div>
      <div className="top-bar__actions">
        {children}
        <button className="btn" onClick={onExit}>
          Сменить режим
        </button>
      </div>
    </div>
  );
}
