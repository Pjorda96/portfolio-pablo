// Pure version arithmetic shared by the versioning scripts and their tests.
// See docs/VERSIONING.md. No I/O in here: git and the filesystem live in the
// scripts that import it.

/** The three bump sizes, smallest to largest. */
export const BUMPS = ['patch', 'minor', 'major'];

/** Paths whose changes ship to production and therefore need a version bump. */
const APP_SOURCES = [
  /^src\//,
  /^public\//,
  /^package(-lock)?\.json$/,
  /^next\.config\.[cm]?[jt]s$/,
  /^postcss\.config\.[cm]?[jt]s$/,
  /^tsconfig\.json$/,
  /^vercel\.json$/,
];

/** X.Y.Z-rc.N -> true */
export function isCandidate(version) {
  return /-rc\.\d+$/.test(version);
}

/** X.Y.Z-rc.4 -> X.Y.Z */
export function versionCore(version) {
  return version.split('-')[0];
}

/** X.Y.Z-rc.4 -> 4, and 0 for a stable version. */
export function candidateNumber(version) {
  const match = /-rc\.(\d+)$/.exec(version);
  return match ? Number(match[1]) : 0;
}

function parseCore(version) {
  const parts = versionCore(version).split('.').map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part) || part < 0)) {
    throw new Error(`'${version}' is not a valid X.Y.Z version.`);
  }
  return parts;
}

/** Applies a bump to a stable version: bumpVersion('0.1.0', 'minor') -> '0.2.0' */
export function bumpVersion(version, bump) {
  const [major, minor, patch] = parseCore(version);
  switch (bump) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Unknown bump '${bump}'. Expected major, minor or patch.`);
  }
}

/**
 * Compares two versions, release candidates included: -1, 0 or 1 for "a is
 * older than / same as / newer than b". A candidate sorts below the stable
 * version it leads to: 0.2.0-rc.9 < 0.2.0.
 */
export function semverCmp(a, b) {
  const left = parseCore(a);
  const right = parseCore(b);
  for (let i = 0; i < 3; i += 1) {
    if (left[i] !== right[i]) return left[i] > right[i] ? 1 : -1;
  }
  const rcA = candidateNumber(a);
  const rcB = candidateNumber(b);
  if (rcA === rcB) return 0;
  // 0 means "stable", which outranks any candidate of the same core.
  if (rcA === 0) return 1;
  if (rcB === 0) return -1;
  return rcA > rcB ? 1 : -1;
}

/**
 * The largest bump the given commit messages (subject + body) ask for.
 * Breaking changes win over features, features over the rest. Returns null
 * when there are no messages.
 */
export function inferBump(messages) {
  const text = messages.join('\n');
  if (text.trim() === '') return null;
  if (/^[a-z]+(\([^)]*\))?!:|^BREAKING CHANGE:/m.test(text)) return 'major';
  if (/^feat(\([^)]*\))?:/m.test(text)) return 'minor';
  return 'patch';
}

/**
 * The next release candidate, measured from the last stable version.
 * Throws when the current version is a stable one that already covers the bump.
 */
export function nextVersion({ stable, current, bump }) {
  const target = bumpVersion(stable, bump);
  if (semverCmp(target, versionCore(current)) === 1) {
    // The bump outgrows whatever the candidate covered so far: new core, and
    // the candidate counter starts over.
    return `${target}-rc.1`;
  }
  if (isCandidate(current)) {
    // Already covered by the current core: just another candidate under it.
    return `${versionCore(current)}-rc.${candidateNumber(current) + 1}`;
  }
  throw new Error(
    `The app is at ${current}, a stable version that already covers a ${bump} bump from ${stable}.\n` +
      'Release it or fix .versions.json before bumping again.',
  );
}

/** True when the path belongs to the app and so asks for a version bump. */
export function isAppSource(path) {
  return APP_SOURCES.some((pattern) => pattern.test(path));
}

/** True when any of the changed paths belongs to the app. */
export function touchesApp(paths) {
  return paths.some(isAppSource);
}

/**
 * Judges a pull request's version against its base. `baseIsProduction` is true
 * for the release pull request (develop -> master). Returns { ok, message }.
 */
export function checkVersion({ current, baseVersion, manifest, baseIsProduction, baseRef }) {
  if (baseIsProduction) {
    if (isCandidate(current)) {
      return {
        ok: false,
        message: `A release must not ship a candidate: drop the -rc suffix from ${current}.`,
      };
    }
    if (manifest !== current) {
      return {
        ok: false,
        message: `The manifest says the app is at ${manifest}, but package.json says ${current}. Update .versions.json.`,
      };
    }
    return { ok: true, message: `Releasing ${current}.` };
  }

  if (current === baseVersion) {
    return {
      ok: false,
      message: `This pull request touches the app without bumping its version (${baseRef} is on ${baseVersion} too).`,
    };
  }
  if (!isCandidate(current)) {
    return {
      ok: false,
      message: `${current} is not a release candidate. Work merges into develop as X.Y.Z-rc.N.`,
    };
  }
  if (semverCmp(current, baseVersion) !== 1) {
    return { ok: false, message: `${current} does not come after ${baseVersion}.` };
  }
  return { ok: true, message: `${baseVersion} -> ${current}.` };
}
