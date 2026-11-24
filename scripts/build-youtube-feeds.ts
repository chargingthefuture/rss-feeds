#!/usr/bin/env node
/**
 * Generates one RSS feed per archived YouTube channel, at dist/youtube/<slug>.xml,
 * and the site's index page from DISCLAIMER.md.
 *
 * Why this exists. A YouTube channel's own feed carries only its newest handful
 * of uploads, so a reader subscribed to it receives exactly what is recent and
 * never what came before. Somebody who wants to watch a channel only up to a
 * date they trust cannot get there from that feed: the videos they want never
 * arrive at all, and no filter can reach what was never delivered.
 *
 * The archive under channels/ is the list of a channel's uploads,
 * collected once and added to, so this can emit every one of them. A reader
 * subscribing here receives the catalog and filters it by date on its own side
 * (`pubdate:/2024-12-31` in FreshRSS), which is the arrangement that was wanted.
 *
 * On the cutoff. An archive can carry a date, and the feed then stops there:
 * videos dated on or after it stay in the archive but are never written into
 * the feed, so nothing after that date reaches a reader at all. A filter inside
 * a reader can only hide what has already arrived, and the collected feed
 * carries the full catalog forever, so purging inside the reader brings the
 * same videos straight back on the next fetch. Leaving them out of the feed is
 * the only removal that holds. The collected channels are the owner's own
 * reading and the date is theirs (owner decision, 2026-09-23); the feed says
 * plainly that it is cut and where.
 *
 * On the title filter. An archive can also carry `titleFilter`, applied the same
 * way as the cutoff: at publish time, never by deleting from the archive. An
 * entry stays in the feed only when its title matches `include`, does not match
 * `exclude` (both case-insensitive regular expressions), and, when
 * `minMinutes` is set, it runs at least that long. It is for a channel that
 * posts one show among others under titles that are not written the same way
 * twice. The feed says it is filtered and by what.
 *
 * On dates. Collected without a YouTube API key, an upload date comes from a
 * relative label on the channel page — "2 years ago" — so it is approximate and
 * an entry near a date boundary can fall on the wrong side of it. Each entry
 * records whether its date is approximate, and the generated feed says so in
 * the channel description rather than letting a reader assume otherwise.
 *
 * It also writes the watch page (reader/index.html, copied to dist/watch/) and the lists it
 * reads: dist/watch/data/channels.json and one dist/watch/data/<slug>.json per channel, cut the
 * same way the feed is. A feed reader marks an entry read the moment it is opened, keeps no
 * place in a list of thousands, and plays these videos badly on a phone; the page does none of
 * that. It keeps its state in the visitor's browser and, only if they connect one, in a private
 * GitHub repository of their own; it sends nothing anywhere else.
 *
 * Generated, never hand-edited, and not committed: `pnpm build` writes dist/,
 * and the deploy workflow publishes it. The archive it reads IS committed,
 * because it cannot be rebuilt on demand — it depends on a service that
 * refuses a data center address often enough to matter.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, copyFileSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const ARCHIVE_DIR = resolve(REPO_ROOT, 'channels');
const DIST_DIR = resolve(REPO_ROOT, 'dist');
const OUT_DIR = resolve(DIST_DIR, 'youtube');
const DISCLAIMER = resolve(REPO_ROOT, 'DISCLAIMER.md');
const READER = resolve(REPO_ROOT, 'reader', 'index.html');
const WATCH_DIR = resolve(DIST_DIR, 'watch');
const WATCH_DATA_DIR = resolve(WATCH_DIR, 'data');
/** The shared copy of the watch page: no sign-in, lists kept in the browser and backed up by hand. */
const READ_DIR = resolve(DIST_DIR, 'read');

const SITE = 'https://chargingthefuture.github.io/rss-feeds';
const PAGE = `${SITE}/`;

type Video = {
  id: string;
  title: string;
  /** YYYY-MM-DD. Approximate when `approximateDate` is true. */
  date: string;
  approximateDate?: boolean;
  duration?: number | null;
};

type Archive = {
  slug: string;
  name: string;
  channelUrl: string;
  collectedAt?: string;
  /** YYYY-MM-DD. Videos dated on or after this are left out of the feed on purpose. */
  cutoff?: string;
  /** Entries whose title or length do not pass this are left out of the feed on purpose. */
  titleFilter?: TitleFilter;
  /** false keeps the channel off the owner's watch page (/watch/). Its feed and list are still written. */
  watch?: boolean;
  videos: Video[];
};

type TitleFilter = {
  /** Case-insensitive regular expression a title must match. */
  include?: string;
  /** Case-insensitive regular expression a title must not match. */
  exclude?: string;
  /** Entries shorter than this, or with no length recorded, are left out. */
  minMinutes?: number;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function rfc822(at: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `${DAYS[at.getUTCDay()]}, ${p(at.getUTCDate())} ${MONTHS[at.getUTCMonth()]} ` +
    `${at.getUTCFullYear()} ${p(at.getUTCHours())}:${p(at.getUTCMinutes())}:${p(at.getUTCSeconds())} GMT`
  );
}

/** Midday, so no timezone conversion moves an entry onto the day before or after. */
function pubDate(date: string): string | null {
  const [y, m, d] = date.split('-').map((part) => Number.parseInt(part, 10));
  if (![y, m, d].every(Number.isFinite)) return null;
  return rfc822(new Date(Date.UTC(y, m - 1, d, 12)));
}

function xml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function readArchives(): Archive[] {
  if (!existsSync(ARCHIVE_DIR)) return [];
  const archives: Archive[] = [];
  for (const entry of readdirSync(ARCHIVE_DIR, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.json')) continue;
    const parsed = JSON.parse(readFileSync(join(ARCHIVE_DIR, entry.name), 'utf8')) as Archive;
    if (!parsed.slug || !Array.isArray(parsed.videos)) {
      throw new Error(`channels/${entry.name} has no slug or no videos array.`);
    }
    archives.push(parsed);
  }
  return archives;
}

/**
 * Wrap HTML so an XML parser leaves it alone. `]]>` is the only sequence that can
 * end the section, and splitting it across two is the standard way to carry it.
 */
function cdata(html: string): string {
  return `<![CDATA[${html.replace(/\]\]>/g, ']]]]><![CDATA[>')}]]>`;
}

/**
 * What a reader shows for one video: the player, then the address under it.
 *
 * Without this an entry was a title and a date and nothing to press. The address
 * was on the item's link, so the title opened it, but a list of titles is not
 * what somebody subscribes to a channel for.
 *
 * FreshRSS's sanitizer allows an iframe with `src` and `allowfullscreen`, so the
 * player renders in place. The link underneath is what a reader that blocks
 * frames is left with, which is the same thing the item's link already carries.
 *
 * nocookie rather than the ordinary embed host: it is the same player from the
 * same company, without the tracking cookie set on arrival. Somebody who
 * self-hosts a reader to get away from being profiled did not ask for one here.
 *
 * rel=0 so that what the player offers when a video ends comes from the same
 * channel rather than from anywhere on the site. The page around a video —
 * recommendations, comments — is the part a reader subscribes here to be rid
 * of, and the end-of-video grid is the last piece of it the embed still shows.
 */
function videoHtml(id: string, title: string, date: string, approximate: boolean): string {
  const safeId = encodeURIComponent(id);
  const watch = `https://www.youtube.com/watch?v=${safeId}`;
  const when = `${date}${approximate ? ' (approximate)' : ''}`;
  return [
    `<p><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/${safeId}?rel=0"`,
    ` title="${xml(title)}" frameborder="0" allowfullscreen></iframe></p>`,
    `<p><a href="${watch}">Watch on YouTube</a> — ${xml(when)}</p>`,
  ].join('');
}

/** What the feed carries: everything, less what the cutoff and the title filter leave out. */
function published(archive: Archive): Video[] {
  const cutoff = archive.cutoff;
  const filter = archive.titleFilter;
  const include = filter?.include ? new RegExp(filter.include, 'i') : null;
  const exclude = filter?.exclude ? new RegExp(filter.exclude, 'i') : null;
  const minSeconds = filter?.minMinutes ? filter.minMinutes * 60 : 0;
  return archive.videos.filter(
    (video) =>
      // Dates are YYYY-MM-DD, so a string comparison is a date comparison.
      (!cutoff || video.date < cutoff) &&
      (!include || include.test(video.title)) &&
      (!exclude || !exclude.test(video.title)) &&
      (!minSeconds || (video.duration ?? 0) >= minSeconds),
  );
}

/** One sentence naming the title filter, or nothing. Says what is kept, never why. */
function filterNote(archive: Archive): string {
  const f = archive.titleFilter;
  if (!f) return '';
  const parts = [
    f.include ? `titles matching /${f.include}/i` : '',
    f.exclude ? `titles not matching /${f.exclude}/i` : '',
    f.minMinutes ? `videos at least ${f.minMinutes} minutes long` : '',
  ].filter(Boolean);
  return ` Filtered on purpose: only ${parts.join(', ')} are kept.`;
}

function feedFor(archive: Archive): string {
  const videos = published(archive);
  const anyApproximate = videos.some((video) => video.approximateDate);
  const description =
    (archive.cutoff
      ? `Uploads collected from ${archive.name} and dated before ${archive.cutoff}, oldest kept ` +
        `alongside newest. Videos dated on or after ${archive.cutoff} are left out on purpose.`
      : `Every upload collected from ${archive.name}, oldest kept alongside newest, so a reader can ` +
        `filter by date.`) +
    filterNote(archive) +
    (anyApproximate
      ? ' Dates are approximate: they were read from relative labels on the channel page, so an' +
        ' entry near a cutoff may fall on the wrong side of it.'
      : '');

  const items = newestFirst(videos)
    .map((video) => {
      const url = `https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`;
      const when = pubDate(video.date);
      return [
        '    <item>',
        `      <title>${xml(video.title)}</title>`,
        `      <link>${xml(url)}</link>`,
        `      <guid isPermaLink="false">yt:video:${xml(video.id)}</guid>`,
        when ? `      <pubDate>${when}</pubDate>` : null,
        // Plain text for a reader that shows only this, HTML for every reader
        // that prefers the richer one.
        `      <description>${xml(`${video.title} — ${video.date}${video.approximateDate ? ' (approximate)' : ''} — ${url}`)}</description>`,
        `      <content:encoded>${cdata(videoHtml(video.id, video.title, video.date, video.approximateDate === true))}</content:encoded>`,
      ]
        .filter((line): line is string => line !== null)
        .concat('    </item>')
        .join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
    '  <channel>',
    // The feed's own address, not the channel's name: a link preview shows this title, and the
    // address says exactly what the link is without naming anybody.
    `    <title>${xml(`${SITE}/youtube/${archive.slug}.xml`)}</title>`,
    `    <link>${xml(archive.channelUrl)}</link>`,
    `    <description>${xml(description)}</description>`,
    '    <language>en-us</language>',
    `    <atom:link href="${xml(`${SITE}/youtube/${archive.slug}.xml`)}" rel="self" type="application/rss+xml" />`,
    `    <lastBuildDate>${rfc822(new Date())}</lastBuildDate>`,
    items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}

/** Newest first, the same order the feed uses. */
function newestFirst(videos: Video[]): Video[] {
  return videos
    .slice()
    .sort((a, b) => (b.date.localeCompare(a.date) !== 0 ? b.date.localeCompare(a.date) : a.id.localeCompare(b.id)));
}

/**
 * The watch page and its lists. Rows are arrays rather than objects because the longest
 * channel runs past ten thousand videos and a phone downloads the list each time it opens one.
 */
function writeWatchPage(archives: Archive[]): void {
  mkdirSync(WATCH_DATA_DIR, { recursive: true });
  copyFileSync(READER, join(WATCH_DIR, 'index.html'));
  mkdirSync(READ_DIR, { recursive: true });
  const reader = readFileSync(READER, 'utf8');
  const shared = reader
    .replace('<html lang="en"', '<html lang="en" data-mode="open"')
    .replaceAll(`${SITE}/watch/`, `${SITE}/read/`);
  if (!shared.includes('data-mode="open"')) throw new Error('reader/index.html: <html lang="en" not found.');
  writeFileSync(join(READ_DIR, 'index.html'), shared, 'utf8');
  const channels = archives.map((archive) => {
    const videos = newestFirst(published(archive));
    const data = {
      slug: archive.slug,
      name: archive.name,
      channelUrl: archive.channelUrl,
      cutoff: archive.cutoff ?? null,
      filtered: archive.titleFilter ? 1 : 0,
      videos: videos.map((v) => [v.id, v.title, v.date, v.approximateDate ? 1 : 0, v.duration ?? null]),
    };
    writeFileSync(join(WATCH_DATA_DIR, `${archive.slug}.json`), JSON.stringify(data), 'utf8');
    return { slug: archive.slug, name: archive.name, count: videos.length, watch: archive.watch !== false };
  });
  // The owner's watch page lists only the channels marked for it. Every list is still written, so
  // the shared page can open any collected channel a reader adds by its feed address.
  const onWatch = channels.filter((c) => c.watch).map(({ watch: _watch, ...c }) => c);
  writeFileSync(join(WATCH_DATA_DIR, 'channels.json'), JSON.stringify({ channels: onWatch }), 'utf8');
  console.log(`✓ watch page and ${channels.length} lists → ${relative(REPO_ROOT, WATCH_DIR)}, shared copy → ${relative(REPO_ROOT, READ_DIR)}`);
}

/**
 * The site's front page: the disclaimer, then the feeds. DISCLAIMER.md is the one source of that
 * text — a paragraph per blank-line-separated block, no markdown inside them — so the README and
 * the page cannot drift apart.
 */
function indexPage(archives: Archive[]): string {
  const paragraphs = readFileSync(DISCLAIMER, 'utf8')
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((block) => `    <p>${xml(block)}</p>`)
    .join('\n');
  const rows = archives
    .slice()
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((archive) => {
      const href = `${SITE}/youtube/${archive.slug}.xml`;
      const kept = published(archive).length;
      const cut =
        (archive.cutoff ? `, cut before ${xml(archive.cutoff)}` : '') + (archive.titleFilter ? ', filtered by title' : '');
      return `      <li><a href="${xml(href)}">${xml(archive.name)}</a> — ${kept} videos${cut}<br><code>${xml(href)}</code></li>`;
    })
    .join('\n');
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    // Every name a link preview can read is the page's own address, so a shared link shows
    // exactly where it goes. Without these, a preview fell back to another name entirely.
    `  <title>${xml(PAGE)}</title>`,
    `  <meta property="og:title" content="${xml(PAGE)}">`,
    `  <meta property="og:site_name" content="${xml(PAGE)}">`,
    `  <meta property="og:url" content="${xml(PAGE)}">`,
    '  <meta property="og:type" content="website">',
    `  <meta name="twitter:title" content="${xml(PAGE)}">`,
    '  <style>body{font-family:system-ui,sans-serif;max-width:40rem;margin:2rem auto;padding:0 1rem;line-height:1.6}code{word-break:break-all}li{margin:.75rem 0}</style>',
    '</head>',
    '<body>',
    '  <main>',
    `    <h1>${xml(PAGE)}</h1>`,
    paragraphs,
    `    <p><a href="${SITE}/watch/">Watch page</a>: the owner's channels, one list each, with a Watched button. Nothing is marked watched until you press it, and each channel opens where you left off.</p>`,
    `    <p><a href="${SITE}/read/">Shared reader</a>: for anyone, with no sign-in. It starts with the Skills Economy blog, demo videos and recorded broadcasts; add any other feed by its address, and any channel below by its feed address. What you add and mark there stays in that browser, so download a backup to keep it.</p>`,
    '    <h2>Feeds</h2>',
    '    <ul>',
    rows,
    '    </ul>',
    `    <p><a href="https://github.com/chargingthefuture/rss-feeds">Source</a></p>`,
    '  </main>',
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

function main() {
  const archives = readArchives();
  if (archives.length === 0) {
    console.log('✓ No archives in channels/; nothing to write.');
    return;
  }
  mkdirSync(OUT_DIR, { recursive: true });
  for (const archive of archives) {
    const out = join(OUT_DIR, `${archive.slug}.xml`);
    writeFileSync(out, feedFor(archive), 'utf8');
    const kept = published(archive).length;
    const cut =
      archive.cutoff || archive.titleFilter ? ` (${archive.videos.length - kept} left out by cutoff or filter)` : '';
    console.log(`✓ ${kept} videos${cut} → ${relative(REPO_ROOT, out)}`);
  }
  const index = join(DIST_DIR, 'index.html');
  writeFileSync(index, indexPage(archives), 'utf8');
  console.log(`✓ ${archives.length} feeds listed → ${relative(REPO_ROOT, index)}`);
  writeWatchPage(archives);
}

main();
