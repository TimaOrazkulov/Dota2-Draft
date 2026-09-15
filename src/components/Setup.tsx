import { useState } from 'react';
import { POSITION_OPTIONS, POSITION_NAMES, ANY_POSITION } from '../lib/positions';

export type DraftConfig =
  | { mode: 'allpick'; myPosition: number }
  | { mode: 'captains'; myPosition: number; mySideFirst: boolean }
  | { mode: 'gsi'; myPosition: number; myIsRadiant: boolean };

interface Props {
  onStart: (config: DraftConfig) => void;
}

type Step =
  | { name: 'position' }
  | { name: 'mode'; myPosition: number }
  | { name: 'captains-first'; myPosition: number }
  | { name: 'gsi-side'; myPosition: number };

export function Setup({ onStart }: Props) {
  const [step, setStep] = useState<Step>({ name: 'position' });

  if (step.name === 'position') {
    return (
      <div className="setup">
        <h1>Dota 2 Draft Helper</h1>
        <p className="setup-sub">
          Трекер драфта с подсказками контрпиков и кратким гайдом на выбранного героя.
        </p>
        <p className="setup-question">На какой позиции вы играете?</p>
        <div className="setup-positions">
          {POSITION_OPTIONS.map((p) => (
            <button key={p} className="mode-card mode-card--position" onClick={() => setStep({ name: 'mode', myPosition: p })}>
              <span className="mode-card__title">{p} — {POSITION_NAMES[p]}</span>
            </button>
          ))}
          <button
            className="mode-card mode-card--position"
            onClick={() => setStep({ name: 'mode', myPosition: ANY_POSITION })}
          >
            <span className="mode-card__title">Любая позиция</span>
          </button>
        </div>
        <p className="setup-hint">
          Подсказки будут искать героев именно на эту позицию и объяснять, против какого вражеского пика и с
          каким союзным пиком выбранный герой хорош.
        </p>
      </div>
    );
  }

  if (step.name === 'mode') {
    return (
      <div className="setup">
        <h1>Dota 2 Draft Helper</h1>
        <p className="setup-question">Какой режим драфта?</p>
        <div className="setup-modes setup-modes--three">
          <button className="mode-card" onClick={() => onStart({ mode: 'allpick', myPosition: step.myPosition })}>
            <span className="mode-card__title">All Pick</span>
            <span className="mode-card__desc">
              Без банов и порядка ходов — свободно отмечайте пики обеих команд по мере игры.
            </span>
          </button>
          <button className="mode-card" onClick={() => setStep({ name: 'captains-first', myPosition: step.myPosition })}>
            <span className="mode-card__title">Captains Mode</span>
            <span className="mode-card__desc">
              Пошаговая последовательность банов и пиков как в капитанском режиме — отмечаете вручную.
            </span>
          </button>
          <button className="mode-card" onClick={() => setStep({ name: 'gsi-side', myPosition: step.myPosition })}>
            <span className="mode-card__title">GSI · авто из игры</span>
            <span className="mode-card__desc">
              Баны и пики считываются прямо из Dota 2 — нужен запущенный gsi-server (см. README).
            </span>
          </button>
        </div>
        <button className="btn btn-back" onClick={() => setStep({ name: 'position' })}>
          ← Назад к выбору позиции
        </button>
      </div>
    );
  }

  if (step.name === 'gsi-side') {
    return (
      <div className="setup">
        <h1>GSI · авто из игры</h1>
        <p className="setup-question">За какую сторону вы играете в этой игре?</p>
        <div className="setup-actions">
          <button
            className="btn btn-primary"
            onClick={() => onStart({ mode: 'gsi', myPosition: step.myPosition, myIsRadiant: true })}
          >
            Radiant
          </button>
          <button
            className="btn"
            onClick={() => onStart({ mode: 'gsi', myPosition: step.myPosition, myIsRadiant: false })}
          >
            Dire
          </button>
        </div>
        <p className="setup-hint">
          Перед этим: запустите <code>gsi-server</code> (см. <code>gsi-server/README.md</code>) и добавьте Dota
          2 launch option <code>-gamestateintegration</code>. Баны/пики появятся сами по ходу капитанского
          режима — ничего кликать не нужно.
        </p>
        <button className="btn btn-back" onClick={() => setStep({ name: 'mode', myPosition: step.myPosition })}>
          ← Назад к выбору режима
        </button>
      </div>
    );
  }

  return (
    <div className="setup">
      <h1>Captains Mode</h1>
      <p className="setup-question">Кто действует первым в этом драфте?</p>
      <div className="setup-actions">
        <button
          className="btn btn-primary"
          onClick={() => onStart({ mode: 'captains', myPosition: step.myPosition, mySideFirst: true })}
        >
          Моя команда
        </button>
        <button
          className="btn"
          onClick={() => onStart({ mode: 'captains', myPosition: step.myPosition, mySideFirst: false })}
        >
          Команда противника
        </button>
      </div>
      <p className="setup-hint">
        Порядок фаз соответствует стандартной последовательности Captains Mode (12 банов + 10 пиков). Если в
        7.41e порядок отличается, отмечайте баны/пики так, как они реально происходят в игре — счётчик шагов
        сам подстроится.
      </p>
      <button className="btn btn-back" onClick={() => setStep({ name: 'mode', myPosition: step.myPosition })}>
        ← Назад к выбору режима
      </button>
    </div>
  );
}
