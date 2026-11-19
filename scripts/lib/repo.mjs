// Git and filesystem helpers for the versioning scripts. See docs/VERSIONING.md.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const VERSION_FILE = 'package.json';
export const MANIFEST_FILE = '.versions.json';

export function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

/** Like git(), but returns null instead of throwing when the command fails. */
export function tryGit(...args) {
  try {
    return git(...args);
  } catch {
    return null;
  }
}

export function repoRoot() {
  return git('rev-parse', '--show-toplevel');
}

/** The version in the working tree's package.json. */
export function currentVersion() {
  return JSON.parse(readFileSync(join(repoRoot(), VERSION_FILE), 'utf8')).version;
}

/** The version in package.json as of a git ref, e.g. origin/develop. */
export function versionAtRef(ref) {
  return JSON.parse(git('show', `${ref}:${VERSION_FILE}`)).version;
}

/** The last released (stable) version, from the manifest. */
export function stableVersion() {
  return JSON.parse(readFileSync(join(repoRoot(), MANIFEST_FILE), 'utf8'))['.'];
}

/**
 * Rewrites the version line of package.json in place, leaving the rest of the
 * file byte for byte as it was. package-lock.json follows, so `npm ci` stays
 * consistent with the manifest.
 */
export function writeVersion(next) {
  const root = repoRoot();
  const rewrite = (file, pattern) => {
    const path = join(root, file);
    const text = readFileSync(path, 'utf8');
    const updated = text.replace(pattern, `$1${next}$2`);
    if (updated !== text) writeFileSync(path, updated);
  };
  rewrite(VERSION_FILE, /^(  "version": ")[^"]*(",)$/m);
  // The lockfile repeats the version twice: top level and packages[""].
  rewrite('package-lock.json', /^(  "version": ")[^"]*(",)$/m);
  rewrite(
    'package-lock.json',
    /^(    "": \{\r?\n      "name": "[^"]*",\r?\n      "version": ")[^"]*(",)$/m,
  );
}
