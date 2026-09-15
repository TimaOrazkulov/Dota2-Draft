import { createGsiServer } from './http-server.js';

// Local-only listener for Dota 2's Game State Integration draft feed.
//
// Safety boundary (see gsi-server/README.md for the full reasoning): the
// gamestate_integration_*.cfg this pairs with enables ONLY the "draft" data
// component. That's the same information already visible on everyone's
// screen and to every spectator during the draft — which heroes are being
// banned/picked, by which team, right now. This code deliberately never
// requests or reads anything about specific players, their Steam profiles,
// or their match history — the mechanism that actually got people banned
// (the 2024 "Overplus" ban wave) was abusing the Steam Web API to profile
// *opponents*, not reading the draft board. Don't add that here.
const PORT = 53000;
const HOST = '127.0.0.1';

const server = createGsiServer();

server.listen(PORT, HOST, () => {
  console.log(`Dota 2 GSI server listening on http://${HOST}:${PORT}`);
  console.log('Waiting for Dota 2 to POST draft data (make sure the .cfg is installed — see README.md)...');
});
