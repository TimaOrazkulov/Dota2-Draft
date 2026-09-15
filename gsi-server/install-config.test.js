import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { CFG_CONTENT, CFG_NAME, candidateRoots, installConfig } from './install-config.js';

function makeFakeFs(existingPaths) {
  const written = [];
  const dirsCreated = [];
  return {
    existsSync: (p) => existingPaths.has(p),
    mkdirSync: (p) => dirsCreated.push(p),
    writeFileSync: (p, content) => written.push({ path: p, content }),
    written,
    dirsCreated,
  };
}

describe('candidateRoots', () => {
  it('gives exactly one macOS Steam path under the given home dir', () => {
    const roots = candidateRoots('darwin', '/Users/tima');
    expect(roots).toEqual(['/Users/tima/Library/Application Support/Steam/steamapps/common/dota 2 beta']);
  });

  it('generates multiple Windows drive/Steam-folder combinations with backslashes', () => {
    const roots = candidateRoots('win32', 'C:\\Users\\tima');
    expect(roots).toContain('C:\\Program Files (x86)\\Steam\\steamapps\\common\\dota 2 beta');
    expect(roots).toContain('D:\\SteamLibrary\\steamapps\\common\\dota 2 beta');
    // Every candidate should be backslash-separated, not a POSIX/mixed path.
    for (const root of roots) {
      expect(root).not.toContain('/');
    }
  });

  it('gives two Linux Steam locations under the home dir', () => {
    const roots = candidateRoots('linux', '/home/tima');
    expect(roots).toEqual([
      '/home/tima/.steam/steam/steamapps/common/dota 2 beta',
      '/home/tima/.local/share/Steam/steamapps/common/dota 2 beta',
    ]);
  });
});

describe('installConfig (with a fake fs — no real disk access)', () => {
  it('returns null when none of the candidate roots exist', () => {
    const fakeFs = makeFakeFs(new Set());
    const result = installConfig(undefined, { platform: 'darwin', home: '/Users/tima', fsImpl: fakeFs });
    expect(result).toBeNull();
    expect(fakeFs.written).toHaveLength(0);
  });

  it('writes the cfg into the first matching candidate root, in game/dota/cfg/gamestate_integration', () => {
    const root = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\dota 2 beta';
    const fakeFs = makeFakeFs(new Set([root]));
    const target = installConfig(undefined, { platform: 'win32', home: 'C:\\Users\\tima', fsImpl: fakeFs });

    expect(target).toBe(`${root}\\game\\dota\\cfg\\gamestate_integration\\${CFG_NAME}`);
    expect(fakeFs.written).toEqual([{ path: target, content: CFG_CONTENT }]);
  });

  it('stops at the first existing root and never checks the rest', () => {
    const first = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\dota 2 beta';
    const fakeFs = makeFakeFs(new Set([first]));
    installConfig(undefined, { platform: 'win32', home: 'C:\\Users\\tima', fsImpl: fakeFs });
    expect(fakeFs.written).toHaveLength(1);
  });

  it('uses a caller-supplied custom root instead of the platform candidates', () => {
    const custom = '/some/custom/dota2/install';
    const fakeFs = makeFakeFs(new Set([custom]));
    const target = installConfig(custom, { platform: 'darwin', fsImpl: fakeFs });
    expect(target).toBe(`${custom}/game/dota/cfg/gamestate_integration/${CFG_NAME}`);
  });

  it('only enables the draft data component (never player/hero)', () => {
    expect(CFG_CONTENT).toContain('"draft"     "1"');
    expect(CFG_CONTENT).not.toContain('"player"');
    expect(CFG_CONTENT).not.toContain('"hero"');
  });
});

describe('installConfig (real filesystem integration check)', () => {
  let tmpRoot;

  afterEach(() => {
    if (tmpRoot) fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('actually creates the cfg file on disk for a real directory', () => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dota2-draft-gsi-test-'));
    const target = installConfig(tmpRoot);
    expect(target).not.toBeNull();
    expect(fs.existsSync(target)).toBe(true);
    expect(fs.readFileSync(target, 'utf8')).toBe(CFG_CONTENT);
  });
});
