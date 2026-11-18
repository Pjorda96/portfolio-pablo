import { describe, expect, it } from 'vitest';
import {
  bumpVersion,
  candidateNumber,
  checkVersion,
  inferBump,
  isCandidate,
  nextVersion,
  semverCmp,
  touchesApp,
  versionCore,
} from '../scripts/lib/version.mjs';

describe('version helpers', () => {
  it('recognises candidates and splits them', () => {
    expect(isCandidate('0.2.0-rc.1')).toBe(true);
    expect(isCandidate('0.2.0')).toBe(false);
    expect(versionCore('0.2.0-rc.4')).toBe('0.2.0');
    expect(candidateNumber('0.2.0-rc.4')).toBe(4);
    expect(candidateNumber('0.2.0')).toBe(0);
  });

  it('applies bumps to a stable version', () => {
    expect(bumpVersion('0.1.0', 'patch')).toBe('0.1.1');
    expect(bumpVersion('0.1.4', 'minor')).toBe('0.2.0');
    expect(bumpVersion('0.1.4', 'major')).toBe('1.0.0');
    expect(() => bumpVersion('0.1.0', 'huge')).toThrow(/Unknown bump/);
  });

  it('orders versions with candidates below their stable', () => {
    expect(semverCmp('0.2.0-rc.9', '0.2.0')).toBe(-1);
    expect(semverCmp('0.2.0', '0.2.0-rc.9')).toBe(1);
    expect(semverCmp('0.2.0-rc.2', '0.2.0-rc.1')).toBe(1);
    expect(semverCmp('0.2.0-rc.1', '0.2.0-rc.1')).toBe(0);
    expect(semverCmp('0.10.0', '0.9.0')).toBe(1);
    expect(semverCmp('1.0.0-rc.1', '0.9.9')).toBe(1);
  });
});

describe('inferBump', () => {
  it('picks the largest bump the commits ask for', () => {
    expect(inferBump([])).toBeNull();
    expect(inferBump(['fix: typo', 'chore(deps): update'])).toBe('patch');
    expect(inferBump(['fix: typo', 'feat(home): hero'])).toBe('minor');
    expect(inferBump(['feat: a', 'refactor!: drop the old API'])).toBe('major');
    expect(inferBump(['feat: a\n\nBREAKING CHANGE: gone'])).toBe('major');
  });

  it('does not read a feat inside prose as a feature', () => {
    expect(inferBump(['fix: handle the feat: prefix'])).toBe('patch');
  });
});

describe('nextVersion (the table in docs/VERSIONING.md)', () => {
  const stable = '0.1.0';
  it('walks the documented sequence', () => {
    let current = stable;
    current = nextVersion({ stable, current, bump: 'patch' });
    expect(current).toBe('0.1.1-rc.1');
    current = nextVersion({ stable, current, bump: 'patch' });
    expect(current).toBe('0.1.1-rc.2');
    current = nextVersion({ stable, current, bump: 'minor' });
    expect(current).toBe('0.2.0-rc.1');
    // A fix on top of a feat does not drag the version back down.
    current = nextVersion({ stable, current, bump: 'patch' });
    expect(current).toBe('0.2.0-rc.2');
    current = nextVersion({ stable, current, bump: 'major' });
    expect(current).toBe('1.0.0-rc.1');
  });

  it('refuses to bump a stable that already covers the bump', () => {
    expect(() => nextVersion({ stable, current: '0.1.0', bump: 'patch' })).not.toThrow();
    expect(() => nextVersion({ stable: '0.2.0', current: '0.2.0', bump: 'minor' })).not.toThrow();
    expect(() => nextVersion({ stable: '0.1.0', current: '0.2.0', bump: 'patch' })).toThrow(
      /already covers/,
    );
  });
});

describe('touchesApp', () => {
  it('asks for a bump only when app sources change', () => {
    expect(touchesApp(['src/app/page.tsx'])).toBe(true);
    expect(touchesApp(['public/og.png'])).toBe(true);
    expect(touchesApp(['package.json'])).toBe(true);
    expect(touchesApp(['next.config.ts'])).toBe(true);
    expect(touchesApp(['docs/PLAN.md', 'design/x.png', '.github/workflows/PR.yml'])).toBe(false);
    expect(touchesApp(['README.md', 'scripts/bump.mjs', 'tests/a.test.ts'])).toBe(false);
    expect(touchesApp([])).toBe(false);
  });
});

describe('checkVersion', () => {
  const develop = { baseRef: 'origin/develop', baseIsProduction: false, manifest: '0.1.0' };

  it('fails a pull request that did not bump', () => {
    const result = checkVersion({ ...develop, current: '0.1.0', baseVersion: '0.1.0' });
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/without bumping/);
  });

  it('fails a stable version against develop', () => {
    const result = checkVersion({ ...develop, current: '0.2.0', baseVersion: '0.1.0' });
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/not a release candidate/);
  });

  it('fails a version that goes backwards', () => {
    const result = checkVersion({ ...develop, current: '0.1.1-rc.1', baseVersion: '0.2.0-rc.1' });
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/does not come after/);
  });

  it('passes a candidate ahead of the base', () => {
    const result = checkVersion({ ...develop, current: '0.2.0-rc.1', baseVersion: '0.1.0' });
    expect(result).toEqual({ ok: true, message: '0.1.0 -> 0.2.0-rc.1.' });
  });

  it('settles releases against master', () => {
    const master = { baseRef: 'origin/master', baseIsProduction: true, baseVersion: '0.1.0' };
    expect(checkVersion({ ...master, current: '0.2.0-rc.2', manifest: '0.1.0' }).ok).toBe(false);
    expect(checkVersion({ ...master, current: '0.2.0', manifest: '0.1.0' }).message).toMatch(
      /Update \.versions\.json/,
    );
    expect(checkVersion({ ...master, current: '0.2.0', manifest: '0.2.0' })).toEqual({
      ok: true,
      message: 'Releasing 0.2.0.',
    });
  });
});
