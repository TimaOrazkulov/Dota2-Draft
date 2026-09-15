# Dota 2 Draft Helper — GSI server

Reads the live draft (bans/picks) straight out of Dota 2 while you're in
Captains Mode, using Valve's own Game State Integration (GSI) feature —
no memory reading, no process injection, no hooking anything.

## Is this safe?

Yes, with one hard rule this project follows: **only read the draft board,
never look up specific players.**

- GSI is a Valve-built feature. The *game itself* POSTs its own state to a
  local HTTP endpoint you point it at via a `.cfg` file inside Dota's own
  install folder. Nothing reads Dota's memory or injects any code.
- The `.cfg` this installs enables **only** the `draft` data component —
  not `player`, not `hero`, nothing about specific accounts. The payload
  physically cannot contain anything except "which hero was banned/picked,
  by which team, right now" — which is already visible on screen to both
  teams and every spectator. It's the same as transcribing what you see.
- The actual VAC ban wave people remember (Feb 2024, "Overplus") was
  **not** about GSI — it was software abusing the **Steam Web API to look
  up opponents' most-played heroes** before the draft, to preemptively
  ban/counter specific players. That's profiling real people using hidden
  information. This tool never touches the Steam Web API and never knows
  who your opponents are — it only mirrors the draft board.
- Dota Coach (built on Overwolf, "in collaboration with Valve and the
  Dota 2 team") uses this same GSI mechanism and documents that it won't
  get you banned.

If Valve ever changes this, the fix is deleting one `.cfg` file — nothing
else about your account or client is touched.

## Setup

1. **Install the config file** (writes into your Dota 2 folder):

   ```
   cd gsi-server
   npm run install-config
   ```

   If it can't find your Steam library automatically, pass the path to
   your `dota 2 beta` folder directly:

   ```
   node install-config.js "D:\SteamLibrary\steamapps\common\dota 2 beta"
   ```

2. **Add the Dota 2 launch option** `-gamestateintegration`
   (Steam → right-click Dota 2 → Properties → Launch Options).

3. **Start the server** (leave it running while you play):

   ```
   npm start
   ```

   It listens on `http://127.0.0.1:53000` and only talks to your own
   machine.

4. In the Dota 2 Draft Helper web app, pick the **"GSI (авто из игры)"**
   mode and select Radiant/Dire. Bans and picks will fill in automatically
   as your Captains Mode draft happens.

## Verifying it's receiving data

```
curl http://127.0.0.1:53000/state
```

Before a draft starts this returns `{"draft":null,...}`. During a
Captains Mode draft it should start reflecting `activeteam`, bans, and
picks within a second or two of each action.

## Code layout

- `draft-parser.js` — pure parsing of the GSI JSON payload into our draft
  shape. No I/O, so it's the easiest place to check the safety boundary
  (it only ever reads `body.draft`, nothing player-identifying).
- `http-server.js` — the HTTP listener (`createGsiServer()`), built as a
  factory so tests can spin up isolated instances on ephemeral ports.
- `server.js` — thin entry point: creates a server and listens on
  `127.0.0.1:53000`. This is what `npm start` runs.
- `install-config.js` — writes the `.cfg`; exports its logic
  (`candidateRoots`, `installConfig`) for testing and only runs as a CLI
  when executed directly (not when imported).

## Tests

```
npm run test
```

Covers the draft payload parser, the HTTP endpoints (via real requests to
an ephemeral local port — no mocking of `http`), and the config installer's
cross-platform path logic (Windows/macOS/Linux, exercised with a fake
filesystem so it doesn't touch a real Steam install) plus one real-disk
integration check.
