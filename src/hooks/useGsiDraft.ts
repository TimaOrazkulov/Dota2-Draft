import { useEffect, useRef, useState } from 'react';

export interface GsiTeam {
  teamNum: 2 | 3;
  homeTeam: boolean; // true = Radiant
  bans: number[]; // Dota hero ids, in the order they happened
  picks: number[];
}

export interface GsiDraft {
  activeteam: number | null;
  isPickPhase: boolean;
  teams: GsiTeam[];
}

interface GsiState {
  status: 'connecting' | 'connected' | 'unreachable';
  draft: GsiDraft | null;
  lastUpdated: number;
}

const GSI_SERVER_URL = 'http://127.0.0.1:53000/state';
const POLL_INTERVAL_MS = 1000;

// Polls the local gsi-server (see gsi-server/README.md) for the live draft
// state Dota 2 itself is pushing via Game State Integration. Only active
// while `enabled` is true, so it doesn't do anything unless the user has
// actually picked the GSI mode.
export function useGsiDraft(enabled: boolean): GsiState {
  const [state, setState] = useState<GsiState>({ status: 'connecting', draft: null, lastUpdated: 0 });
  const failCountRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(GSI_SERVER_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { draft: GsiDraft | null; lastUpdated: number };
        if (cancelled) return;
        failCountRef.current = 0;
        setState({ status: 'connected', draft: data.draft, lastUpdated: data.lastUpdated });
      } catch {
        if (cancelled) return;
        failCountRef.current += 1;
        setState((prev) => ({
          ...prev,
          status: failCountRef.current >= 3 ? 'unreachable' : prev.status,
        }));
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [enabled]);

  return state;
}
