#!/usr/bin/env node
// Checks that a pull request moved the version of the app it touches, the way
// docs/VERSIONING.md asks for. Run by CI, and runnable locally:
//
//   npm run version:check -- origin/develop
//
// Against develop the version has to be a release candidate ahead of the base.
// Against master (the release pull request) it has to be stable and match the
// manifest. A pull request that touches nothing the app ships needs no bump.
import { checkVersion, touchesApp } from './lib/version.mjs';
import { currentVersion, git, stableVersion, tryGit, versionAtRef } from './lib/repo.mjs';

const [base, ...rest] = process.argv.slice(2);
if (!base || rest.length > 0) {
  console.error('Usage: npm run version:check -- <base-ref>');
  process.exit(64);
}

const current = currentVersion();

function fail(message) {
  console.error(message);
  console.error('');
  console.error(`  package.json is at ${current}.`);
  console.error('  See docs/VERSIONING.md; npm run version:bump does the arithmetic.');
  process.exit(1);
}

if (!tryGit('rev-parse', '--verify', '--quiet', base)) {
  console.error(
    `The base ref '${base}' does not exist here. Fetch it first (CI checks out with fetch-depth: 0).`,
  );
  process.exit(1);
}

const baseIsProduction = base.split('/').pop() === 'master';

if (!baseIsProduction) {
  // Only changes to what the app ships ask for a bump.
  const mergeBase = tryGit('merge-base', 'HEAD', base) ?? base;
  // Working tree against the fork point: in CI that is the pull request's diff;
  // locally it also sees what is not committed yet.
  const changed = [
    ...git('diff', '--name-only', mergeBase).split('\n'),
    ...git('ls-files', '--others', '--exclude-standard').split('\n'),
  ].filter(Boolean);
  if (!touchesApp(changed)) {
    console.log('No app sources changed; no version bump needed.');
    process.exit(0);
  }
}

const result = checkVersion({
  current,
  baseVersion: baseIsProduction ? undefined : versionAtRef(base),
  manifest: stableVersion(),
  baseIsProduction,
  baseRef: base,
});

if (!result.ok) fail(result.message);
console.log(result.message);
