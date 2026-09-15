import http from 'node:http';
import { extractDraft } from './draft-parser.js';

// Builds a (not-yet-listening) HTTP server that accepts Dota 2's GSI POSTs
// and serves the latest parsed draft over GET /state. Each call returns an
// independent server with its own in-memory state, which is what makes this
// cleanly testable — tests spin up their own instance on an ephemeral port
// instead of fighting over the real one.
export function createGsiServer() {
  let latestDraft = null;
  let lastUpdated = 0;

  return http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === 'POST') {
      let raw = '';
      req.on('data', (chunk) => {
        raw += chunk;
        // Dota's payload is small (draft-only); bail out if something is
        // sending way more than expected instead of buffering forever.
        if (raw.length > 1_000_000) req.destroy();
      });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          const draft = extractDraft(parsed);
          if (draft) {
            latestDraft = draft;
            lastUpdated = Date.now();
          }
        } catch (err) {
          console.error('Failed to parse GSI payload:', err.message);
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('ok');
      });
      return;
    }

    if (req.method === 'GET' && req.url === '/state') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ draft: latestDraft, lastUpdated }));
      return;
    }

    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('ok');
      return;
    }

    res.writeHead(404);
    res.end();
  });
}
