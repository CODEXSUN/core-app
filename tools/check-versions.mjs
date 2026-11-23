#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { CHANGELOG_PATH, readLatestVersionedChangelogEntry, formatChangelogCommitSubject } from './changelog.mjs';
import { bumpPatch } from './version-bump.mjs';
const ROOT = resolve(import.meta.dirname, '..');
export function checkVersions(rootDir) {
  const failures = []; let rootVersion = ''; let subject = '';
  try {
    const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
    rootVersion = String(pkg.version); bumpPatch(rootVersion);
    if (existsSync(join(rootDir, 'package-lock.json'))) {
      const lock = JSON.parse(readFileSync(join(rootDir, 'package-lock.json'), 'utf8'));
      if (lock.version !== rootVersion || lock.packages?.['']?.version !== rootVersion) failures.push('Package-lock root versions do not match package.json.');
    } else failures.push('package-lock.json is missing.');
    const changelog = readFileSync(join(rootDir, CHANGELOG_PATH), 'utf8');
    const lines = changelog.split(/\r?\n/);
    for (const expected of [`Current version: ${rootVersion}`, `Release tag: v-${rootVersion}`, `Changelog label: v ${rootVersion}`, `## v-${rootVersion}`]) if (!lines.includes(expected)) failures.push(`Changelog is missing: ${expected}`);
    const entry = readLatestVersionedChangelogEntry(rootDir);
    if (entry.version !== rootVersion) failures.push('Latest changelog entry does not match package.json.');
    subject = formatChangelogCommitSubject(entry);
    const releaseNotes = join(rootDir, 'docs/release-notes.md');
    if (existsSync(releaseNotes) && !new RegExp(`^# v-${rootVersion.replaceAll('.', '\\.')}(?:\\r?\\n|$)`).test(readFileSync(releaseNotes, 'utf8'))) failures.push('Current release notes do not match package.json.');
    const releaseFile = join(rootDir, '.container/release.json');
    if (existsSync(releaseFile)) {
      const release = JSON.parse(readFileSync(releaseFile, 'utf8'));
      if (release.version !== undefined && release.version !== rootVersion) failures.push('Release metadata version does not match package.json.');
      if (release.tag !== undefined && release.tag !== `v-${rootVersion}`) failures.push('Release metadata tag does not match package.json.');
    }
    if (existsSync(join(rootDir, 'src/web'))) {
      const shell = readFileSync(join(rootDir, 'src/web/app-shell.ts'), 'utf8');
      const home = readFileSync(join(rootDir, 'src/web/modules/home/page.tsx'), 'utf8');
      if (!/import manifest from ['"]\.\.\/\.\.\/package\.json['"]/.test(shell) || !/export const appVersion = manifest\.version;/.test(shell)) failures.push('Frontend running version must come from the root package manifest.');
      if (!shell.includes('export const appVersionLabel = `${appDetails.title} - V${appVersion}`;')) failures.push('Frontend status label must derive the app title and running version.');
      if ((home.match(/versionLabel=\{appVersionLabel\}/g) ?? []).length !== 1 || (home.match(/\bversionLabel=/g) ?? []).length !== 1) failures.push('Frontend must pass one canonical version label to the shared status bar.');
    }
  } catch (error) { failures.push(error.message); }
  return { rootVersion, failures, subject };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = checkVersions(ROOT);
  if (result.failures.length) { console.error(JSON.stringify(result, null, 2)); process.exitCode = 1; }
  else console.log(`Version check passed for ${result.rootVersion}. Commit preview: ${result.subject}`);
}
