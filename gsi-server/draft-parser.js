// Pure parsing of Dota 2's GSI draft payload — no I/O, easy to unit test.
//
// Safety boundary (see README.md): this only ever reads `body.draft`. It
// deliberately doesn't know how to read `body.player`/`body.hero`/anything
// player-identifying, because the .cfg this pairs with never requests those
// components in the first place.

export function readTeamSlots(teamObj, prefix, maxIndex) {
  const ids = [];
  for (let i = 0; i <= maxIndex; i++) {
    const id = teamObj?.[`${prefix}${i}_id`];
    if (typeof id === 'number' && id > 0) ids.push(id);
  }
  return ids;
}

export function extractDraft(body) {
  const draft = body && typeof body === 'object' ? body.draft : null;
  if (!draft || typeof draft !== 'object') return null;

  const teams = [2, 3].map((teamNum) => {
    const t = draft[`team${teamNum}`] ?? {};
    return {
      teamNum,
      homeTeam: t.home_team === true,
      bans: readTeamSlots(t, 'ban', 5),
      picks: readTeamSlots(t, 'pick', 4),
    };
  });

  return {
    activeteam: typeof draft.activeteam === 'number' ? draft.activeteam : null,
    isPickPhase: draft.pick === true,
    teams,
  };
}
