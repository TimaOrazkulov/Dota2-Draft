import { useMemo, useReducer } from 'react';
import type { DraftEntry, DraftState } from '../types';
import { buildDraftSequence, TOTAL_STEPS } from '../data/captainsMode';

type Action = { type: 'pick-or-ban'; heroId: number } | { type: 'undo' } | { type: 'reset'; mySideFirst: boolean };

function reducer(state: DraftState, action: Action): DraftState {
  switch (action.type) {
    case 'pick-or-ban': {
      const sequence = buildDraftSequence(state.mySideFirst);
      const stepIndex = state.entries.length;
      if (stepIndex >= sequence.length) return state;
      const step = sequence[stepIndex];
      const entry: DraftEntry = { step: stepIndex, team: step.team, action: step.action, heroId: action.heroId };
      return { ...state, entries: [...state.entries, entry] };
    }
    case 'undo':
      return { ...state, entries: state.entries.slice(0, -1) };
    case 'reset':
      return { mySideFirst: action.mySideFirst, entries: [] };
    default:
      return state;
  }
}

export function useDraft(mySideFirst: boolean) {
  const [state, dispatch] = useReducer(reducer, { mySideFirst, entries: [] });

  const sequence = useMemo(() => buildDraftSequence(state.mySideFirst), [state.mySideFirst]);
  const currentStepIndex = state.entries.length;
  const currentStep = currentStepIndex < sequence.length ? sequence[currentStepIndex] : null;
  const isComplete = currentStepIndex >= TOTAL_STEPS;

  const usedHeroIds = useMemo(() => new Set(state.entries.map((e) => e.heroId)), [state.entries]);

  const myPicks = state.entries.filter((e) => e.team === 'my' && e.action === 'pick');
  const enemyPicks = state.entries.filter((e) => e.team === 'enemy' && e.action === 'pick');
  const myBans = state.entries.filter((e) => e.team === 'my' && e.action === 'ban');
  const enemyBans = state.entries.filter((e) => e.team === 'enemy' && e.action === 'ban');

  return {
    state,
    sequence,
    currentStepIndex,
    currentStep,
    isComplete,
    usedHeroIds,
    myPicks,
    enemyPicks,
    myBans,
    enemyBans,
    pickOrBan: (heroId: number) => dispatch({ type: 'pick-or-ban', heroId }),
    undo: () => dispatch({ type: 'undo' }),
    reset: (mySideFirstNext: boolean) => dispatch({ type: 'reset', mySideFirst: mySideFirstNext }),
  };
}
