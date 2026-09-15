import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDraft } from './useDraft';
import { TOTAL_STEPS } from '../data/captainsMode';

describe('useDraft (Captains Mode)', () => {
  it('starts at step 0, not complete, with the expected sequence length', () => {
    const { result } = renderHook(() => useDraft(true));
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.sequence).toHaveLength(TOTAL_STEPS);
    expect(TOTAL_STEPS).toBe(22);
  });

  it('opens with my team banning when mySideFirst is true', () => {
    const { result } = renderHook(() => useDraft(true));
    expect(result.current.currentStep).toEqual({ team: 'my', action: 'ban' });
  });

  it('opens with the enemy banning when mySideFirst is false', () => {
    const { result } = renderHook(() => useDraft(false));
    expect(result.current.currentStep).toEqual({ team: 'enemy', action: 'ban' });
  });

  it('splits the 22-step sequence into 6 bans + 5 picks per side', () => {
    const { result } = renderHook(() => useDraft(true));
    const byTeamAction = (team: 'my' | 'enemy', action: 'ban' | 'pick') =>
      result.current.sequence.filter((s) => s.team === team && s.action === action).length;

    expect(byTeamAction('my', 'ban')).toBe(6);
    expect(byTeamAction('enemy', 'ban')).toBe(6);
    expect(byTeamAction('my', 'pick')).toBe(5);
    expect(byTeamAction('enemy', 'pick')).toBe(5);
  });

  it('records each pickOrBan against the current step and advances', () => {
    const { result } = renderHook(() => useDraft(true));

    act(() => result.current.pickOrBan(1)); // step 0: my ban
    expect(result.current.currentStepIndex).toBe(1);
    expect(result.current.myBans).toHaveLength(1);
    expect(result.current.myBans[0].heroId).toBe(1);

    act(() => result.current.pickOrBan(2)); // step 1: enemy ban
    expect(result.current.enemyBans).toHaveLength(1);
    expect(result.current.enemyBans[0].heroId).toBe(2);
  });

  it('tracks usedHeroIds across every ban and pick', () => {
    const { result } = renderHook(() => useDraft(true));
    act(() => result.current.pickOrBan(10));
    act(() => result.current.pickOrBan(20));
    expect(result.current.usedHeroIds).toEqual(new Set([10, 20]));
  });

  it('separates my/enemy picks and bans correctly across a partial draft', () => {
    const { result } = renderHook(() => useDraft(true));
    // Steps 0-5: my ban, enemy ban, my ban, enemy ban, my pick, enemy pick
    const heroIds = [1, 2, 3, 4, 5, 6];
    for (const id of heroIds) act(() => result.current.pickOrBan(id));

    expect(result.current.myBans.map((e) => e.heroId)).toEqual([1, 3]);
    expect(result.current.enemyBans.map((e) => e.heroId)).toEqual([2, 4]);
    expect(result.current.myPicks.map((e) => e.heroId)).toEqual([5]);
    expect(result.current.enemyPicks.map((e) => e.heroId)).toEqual([6]);
  });

  it('becomes complete only after all 22 steps, not before', () => {
    const { result } = renderHook(() => useDraft(true));
    for (let i = 0; i < TOTAL_STEPS - 1; i++) {
      act(() => result.current.pickOrBan(i + 1));
    }
    expect(result.current.isComplete).toBe(false);
    expect(result.current.currentStep).not.toBeNull();

    act(() => result.current.pickOrBan(999));
    expect(result.current.isComplete).toBe(true);
    expect(result.current.currentStep).toBeNull();
  });

  it('ignores further pickOrBan calls once the draft is complete', () => {
    const { result } = renderHook(() => useDraft(true));
    for (let i = 0; i < TOTAL_STEPS; i++) {
      act(() => result.current.pickOrBan(i + 1));
    }
    expect(result.current.currentStepIndex).toBe(TOTAL_STEPS);

    act(() => result.current.pickOrBan(12345));
    expect(result.current.currentStepIndex).toBe(TOTAL_STEPS);
    expect(result.current.usedHeroIds.has(12345)).toBe(false);
  });

  it('undo removes the last entry and rewinds the step', () => {
    const { result } = renderHook(() => useDraft(true));
    act(() => result.current.pickOrBan(1));
    act(() => result.current.pickOrBan(2));
    expect(result.current.currentStepIndex).toBe(2);

    act(() => result.current.undo());
    expect(result.current.currentStepIndex).toBe(1);
    expect(result.current.myBans.map((e) => e.heroId)).toEqual([1]);
    expect(result.current.currentStep).toEqual({ team: 'enemy', action: 'ban' });
  });

  it('undo on a fresh draft is a safe no-op', () => {
    const { result } = renderHook(() => useDraft(true));
    act(() => result.current.undo());
    expect(result.current.currentStepIndex).toBe(0);
  });

  it('reset clears history and can flip who acts first', () => {
    const { result } = renderHook(() => useDraft(true));
    act(() => result.current.pickOrBan(1));
    act(() => result.current.pickOrBan(2));

    act(() => result.current.reset(false));
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.usedHeroIds.size).toBe(0);
    expect(result.current.currentStep).toEqual({ team: 'enemy', action: 'ban' });
  });
});
