# rss-feeds

Feeds built from the public upload lists of YouTube channels, published at
https://chargingthefuture.github.io/rss-feeds/ for a feed reader to subscribe to.

Read [DISCLAIMER.md](DISCLAIMER.md) first. It says what a listing here does and does not mean, and
it is the same text the site's front page shows.

## What is here

| Path | What |
|---|---|
| `channels/<slug>.json` | A channel's collected upload list: id, title, date, and whether the date is approximate. Committed, because it cannot be rebuilt on demand. May carry a `cutoff`. |
| `scripts/collect-youtube-archive.ts` | Reads a channel's upload list with yt-dlp (metadata only, no video, no API key) and merges it into the archive. |
| `scripts/build-youtube-feeds.ts` | Renders one RSS feed per archive into `dist/youtube/<slug>.xml`, plus the site's index page. |
| `.github/workflows/collect.yml` | Runs the collector for one channel or all of them, commits what changed, and starts the deploy. |
| `.github/workflows/deploy.yml` | Builds `dist/` and publishes it to GitHub Pages. |

## Adding a channel

Actions → "Collect a channel's uploads" → Run workflow. Give the channel as `@handle` or a full
address. Optionally give a cutoff date, `YYYY-MM-DD`: the archive still collects everything, but the
feed stops there — videos dated on or after the date are never written into it. The date is kept
on later refreshes; run again with the channel and a new date to change it. Leave the channel box
empty to refresh every channel already collected.

The run's summary prints each feed's address. Subscribe to it in a reader.

## Dates

Without an API key, an upload date comes from a relative label on the channel page ("2 years ago")
and is approximate, so an entry near a cutoff can fall on the wrong side. Every such entry is
marked, the feed's description says so, and an existing date is never overwritten by a later
approximate one. Leave a margin around a date that matters.

## Locally

```
pnpm install
pnpm collect -- --channel @SomeChannel --cutoff 2024-12-31   # needs yt-dlp on PATH
pnpm build                                                     # writes dist/
pnpm typecheck
```
