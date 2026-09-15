import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAllPick } from './useAllPick';

describe('useAllPick (All Pick)', () => {
  it('starts empty on both sides', () => {
    const { result } = renderHook(() => useAllPick());
    expect(result.current.my).toEqual([]);
    expect(result.current.enemy).toEqual([]);
    expect(result.current.usedHeroIds.size).toBe(0);
    expect(result.current.maxPicks).toBe(5);
  });

  it('adds a pick to the requested team', () => {
    const { result } = renderHook(() => useAllPick());
    act(() => result.current.addPick('my', 1));
    expect(result.current.my).toEqual([1]);
    expect(result.current.enemy).toEqual([]);
    expect(result.current.usedHeroIds.has(1)).toBe(true);
  });

  it('keeps my and enemy picks independent', () => {
    const { result } = renderHook(() => useAllPick());
    act(() => result.current.addPick('my', 1));
    act(() => result.current.addPick('enemy', 2));
    expect(result.current.my).toEqual([1]);
    expect(result.current.enemy).toEqual([2]);
  });

  it('refuses to add a hero that is already picked by either side', () => {
    const { result } = renderHook(() => useAllPick());
    act(() => result.current.addPick('my', 1));
    act(() => result.current.addPick('enemy', 1)); // same hero, other team
    expect(result.current.enemy).toEqual([]);

    act(() => result.current.addPick('my', 1)); // same hero, same team again
    expect(result.current.my).toEqual([1]);
  });

  it('caps each side at maxPicks (5) and ignores further adds', () => {
    const { result } = renderHook(() => useAllPick());
    for (let id = 1; id <= 5; id++) {
      act(() => result.current.addPick('my', id));
    }
    expect(result.current.my).toEqual([1, 2, 3, 4, 5]);

    act(() => result.current.addPick('my', 6));
    expect(result.current.my).toEqual([1, 2, 3, 4, 5]);
    expect(result.current.usedHeroIds.has(6)).toBe(false);
  });

  it('lets each side independently reach maxPicks', () => {
    const { result } = renderHook(() => useAllPick());
    for (let id = 1; id <= 5; id++) act(() => result.current.addPick('my', id));
    for (let id = 11; id <= 15; id++) act(() => result.current.addPick('enemy', id));

    expect(result.current.my).toHaveLength(5);
    expect(result.current.enemy).toHaveLength(5);
    expect(result.current.usedHeroIds.size).toBe(10);
  });

  it('removePick removes only from the specified team', () => {
    const { result } = renderHook(() => useAllPick());
    act(() => result.current.addPick('my', 1));
    act(() => result.current.addPick('enemy', 2));

    act(() => result.current.removePick('my', 1));
    expect(result.current.my).toEqual([]);
    expect(result.current.enemy).toEqual([2]);
    expect(result.current.usedHeroIds.has(1)).toBe(false);
  });

  it('removing a hero frees the id up for either side again', () => {
    const { result } = renderHook(() => useAllPick());
    act(() => result.current.addPick('my', 1));
    act(() => result.current.removePick('my', 1));
    act(() => result.current.addPick('enemy', 1));
    expect(result.current.enemy).toEqual([1]);
  });

  it('removing a hero id that is not present is a safe no-op', () => {
    const { result } = renderHook(() => useAllPick());
    act(() => result.current.addPick('my', 1));
    act(() => result.current.removePick('my', 999));
    expect(result.current.my).toEqual([1]);
  });

  it('reset clears both sides', () => {
    const { result } = renderHook(() => useAllPick());
    act(() => result.current.addPick('my', 1));
    act(() => result.current.addPick('enemy', 2));

    act(() => result.current.reset());
    expect(result.current.my).toEqual([]);
    expect(result.current.enemy).toEqual([]);
    expect(result.current.usedHeroIds.size).toBe(0);
  });
});
