import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Writes the GSI config file Dota 2 reads on startup. It only turns on the
// "draft" data component — no player/hero/map data — see README.md for why
// that's the deliberate safety boundary.
export const CFG_NAME = 'gamestate_integration_dota2draft.cfg';
export const CFG_CONTENT = `"dota2-gsi Configuration"
{
    "uri"       "http://127.0.0.1:53000/"
    "timeout"   "5.0"
    "buffer"    "0.1"
    "throttle"  "0.1"
    "heartbeat" "30.0"
    "data"
    {
        "provider"  "1"
        "draft"     "1"
    }
}
`;

// Node's `path` module is fixed to the *running* OS unless you reach for
// path.win32/path.posix explicitly — which is what lets us unit-test the
// Windows path logic from a Mac/Linux dev machine without it silently
// falling back to POSIX joining.
function pathFor(platform) {
  return platform === 'win32' ? path.win32 : path.posix;
}

export function candidateRoots(platform = process.platform, home = os.homedir()) {
  const p = pathFor(platform);
  const relSuffix = p.join('steamapps', 'common', 'dota 2 beta');

  if (platform === 'darwin') {
    return [p.join(home, 'Library', 'Application Support', 'Steam', relSuffix)];
  }
  if (platform === 'win32') {
    const drives = ['C:', 'D:', 'E:', 'F:'];
    const steamDirs = ['Program Files (x86)/Steam', 'Program Files/Steam', 'Steam', 'SteamLibrary'];
    const out = [];
    for (const drive of drives) {
      for (const steamDir of steamDirs) {
        out.push(p.join(`${drive}\\`, steamDir, relSuffix));
      }
    }
    return out;
  }
  // Linux
  return [p.join(home, '.steam', 'steam', relSuffix), p.join(home, '.local', 'share', 'Steam', relSuffix)];
}

// `fsImpl` is injectable so tests can simulate "found it" / "wrote the file"
// without touching the real disk or a real Steam install.
export function installConfig(customRoot, { platform = process.platform, home = os.homedir(), fsImpl = fs } = {}) {
  const p = pathFor(platform);
  const roots = customRoot ? [customRoot] : candidateRoots(platform, home);

  for (const root of roots) {
    if (!fsImpl.existsSync(root)) continue;
    const gsiDir = p.join(root, 'game', 'dota', 'cfg', 'gamestate_integration');
    fsImpl.mkdirSync(gsiDir, { recursive: true });
    const target = p.join(gsiDir, CFG_NAME);
    fsImpl.writeFileSync(target, CFG_CONTENT, 'utf8');
    return target;
  }
  return null;
}

const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMainModule) {
  const customRoot = process.argv[2];
  const target = installConfig(customRoot);
  if (target) {
    console.log(`Installed GSI config at: ${target}`);
  } else {
    console.log('Could not auto-detect your Dota 2 install folder in the usual Steam locations.');
    console.log('Run again with the path to your "dota 2 beta" folder, e.g.:');
    console.log('  node install-config.js "D:\\SteamLibrary\\steamapps\\common\\dota 2 beta"');
    console.log('  node install-config.js "/Users/you/Library/Application Support/Steam/steamapps/common/dota 2 beta"');
    process.exitCode = 1;
  }
}
