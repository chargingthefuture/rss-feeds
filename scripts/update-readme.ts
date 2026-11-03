/**
 * Rewrites the channel list in README.md from what is in channels/.
 *
 * The list sits between two marker comments in README.md and nothing outside
 * them is touched. The collect workflow runs this after adding or removing a
 * channel, so the list in the README matches the archives in the same pull
 * request. Run it by hand with `pnpm readme`.
 *
 * `--check` writes nothing and exits non-zero when the list is out of date.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const ARCHIVE_DIR = resolve(REPO_ROOT, 'channels');
const README = resolve(REPO_ROOT, 'README.md');

const SITE = 'https://chargingthefuture.github.io/rss-feeds';
const START = '<!-- channels:start -->';
const END = '<!-- channels:end -->';

type Archive = {
  slug: string;
  channelUrl: string;
  cutoff?: string;
};

function readArchives(): Archive[] {
  if (!existsSync(ARCHIVE_DIR)) return [];
  return readdirSync(ARCHIVE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'))
    .map((entry) => {
      const parsed = JSON.parse(readFileSync(join(ARCHIVE_DIR, entry.name), 'utf8')) as Archive;
      if (!parsed.slug) throw new Error(`channels/${entry.name} has no slug.`);
      return parsed;
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function list(archives: Archive[]): string {
  if (archives.length === 0) return 'No channels collected.';
  const rows = archives.map((archive) => {
    const feed = `${SITE}/youtube/${archive.slug}.xml`;
    return `| \`${archive.slug}\` | ${archive.channelUrl} | ${archive.cutoff ?? 'none'} | ${feed} |`;
  });
  return [
    `${archives.length} channels. Written from \`channels/\` by \`pnpm readme\`; do not edit by hand.`,
    '',
    '| Slug | Channel | Feed cut before | Feed |',
    '|---|---|---|---|',
    ...rows,
  ].join('\n');
}

function main() {
  const check = process.argv.includes('--check');
  const readme = readFileSync(README, 'utf8');
  const start = readme.indexOf(START);
  const end = readme.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`README.md needs ${START} and ${END}, in that order.`);
  }
  const next = `${readme.slice(0, start + START.length)}\n${list(readArchives())}\n${readme.slice(end)}`;
  if (next === readme) {
    console.log('README.md channel list is up to date.');
    return;
  }
  if (check) {
    console.error('README.md channel list is out of date. Run `pnpm readme`.');
    process.exit(1);
  }
  writeFileSync(README, next);
  console.log('README.md channel list rewritten.');
}

main();
