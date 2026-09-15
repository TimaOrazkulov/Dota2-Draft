import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createGsiServer } from './http-server.js';

let server;
let baseUrl;

beforeEach(async () => {
  server = createGsiServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

afterEach(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('GET /health', () => {
  it('responds 200 "ok"', async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('ok');
  });
});

describe('GET /state', () => {
  it('starts with no draft and lastUpdated 0', async () => {
    const res = await fetch(`${baseUrl}/state`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ draft: null, lastUpdated: 0 });
  });

  it('reflects a draft after a POST', async () => {
    const payload = {
      draft: {
        activeteam: 2,
        pick: false,
        team2: { home_team: true, ban0_id: 8 },
        team3: { home_team: false },
      },
    };
    const post = await fetch(baseUrl, { method: 'POST', body: JSON.stringify(payload) });
    expect(post.status).toBe(200);
    expect(await post.text()).toBe('ok');

    const state = await (await fetch(`${baseUrl}/state`)).json();
    expect(state.draft.activeteam).toBe(2);
    expect(state.draft.teams[0].bans).toEqual([8]);
    expect(state.lastUpdated).toBeGreaterThan(0);
  });

  it('keeps the previous draft if a later POST is malformed JSON', async () => {
    await fetch(baseUrl, {
      method: 'POST',
      body: JSON.stringify({ draft: { activeteam: 3, team2: {}, team3: {} } }),
    });
    const before = await (await fetch(`${baseUrl}/state`)).json();

    const bad = await fetch(baseUrl, { method: 'POST', body: 'not json at all' });
    expect(bad.status).toBe(200); // Dota should never see an error from a bad frame

    const after = await (await fetch(`${baseUrl}/state`)).json();
    expect(after.draft).toEqual(before.draft);
  });

  it('ignores a POST body with no draft key without wiping existing state', async () => {
    await fetch(baseUrl, {
      method: 'POST',
      body: JSON.stringify({ draft: { activeteam: 3, team2: {}, team3: {} } }),
    });
    await fetch(baseUrl, { method: 'POST', body: JSON.stringify({ provider: { name: 'Dota 2' } }) });

    const state = await (await fetch(`${baseUrl}/state`)).json();
    expect(state.draft.activeteam).toBe(3);
  });
});

describe('CORS', () => {
  it('answers OPTIONS with 204 and permissive headers', async () => {
    const res = await fetch(baseUrl, { method: 'OPTIONS' });
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });

  it('sets Access-Control-Allow-Origin on normal responses too', async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });
});

describe('unknown routes', () => {
  it('404s a GET to an unrecognized path', async () => {
    const res = await fetch(`${baseUrl}/nope`);
    expect(res.status).toBe(404);
  });
});
