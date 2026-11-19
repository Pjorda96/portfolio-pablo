#!/usr/bin/env node
// Bumps the app to its next release candidate. See docs/VERSIONING.md.
//
//   npm run version:bump            # infers the bump from the branch's commits
//   npm run version:bump -- minor   # or state it outright
//
import { BUMPS, inferBump, nextVersion } from './lib/version.mjs';
import { currentVersion, git, stableVersion, tryGit, writeVersion } from './lib/repo.mjs';

const USAGE = `Usage: npm run version:bump [-- major|minor|patch]

Writes the app's next release candidate into package.json, measured from the
last stable version in .versions.json. With no bump given it is inferred from
the commits in this branch.

Environment:
  BASE_REF   Branch the work forked from. Defaults to origin/develop, or
             develop when there is no remote.`;

const args = process.argv.slice(2);
if (args.length > 1 || (args[0] && !BUMPS.includes(args[0]))) {
  console.error(USAGE);
  process.exit(64);
}

function baseRef() {
  if (process.env.BASE_REF) return process.env.BASE_REF;
  return tryGit('rev-parse', '--verify', '--quiet', 'origin/develop')
    ? 'origin/develop'
    : 'develop';
}

// The largest bump the branch's commits ask for.
function infer() {
  const base = baseRef();
  const mergeBase = tryGit('merge-base', 'HEAD', base);
  if (!mergeBase) {
    throw new Error(
      `Cannot find where this branch forked from '${base}'. Pass the bump explicitly.`,
    );
  }
  const log = git('log', '--format=%s%n%b%x00', `${mergeBase}..HEAD`);
  const bump = inferBump(log.split('\0'));
  if (!bump) throw new Error('No commits in this branch. Pass the bump explicitly.');
  return bump;
}

try {
  const bump = args[0] ?? infer();
  const stable = stableVersion();
  const current = currentVersion();
  const next = nextVersion({ stable, current, bump });

  writeVersion(next);

  const written = currentVersion();
  if (written !== next) {
    throw new Error(`Failed to write ${next} into package.json; it still reads ${written}.`);
  }
  console.log(`${current} -> ${next} (${bump} bump from the ${stable} release)`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
