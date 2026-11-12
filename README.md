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
| `scripts/update-readme.ts` | Rewrites the channel list below from `channels/`. |
| `scripts/build-youtube-feeds.ts` | Renders one RSS feed per archive into `dist/youtube/<slug>.xml`, plus the site's index page. |
| `.github/workflows/collect.yml` | Adds, refreshes or removes a channel, or refreshes all of them, rewrites the README's channel list, and opens a pull request with what changed. Merging it starts the deploy. |
| `.github/workflows/deploy.yml` | Builds `dist/` and publishes it to GitHub Pages. |

## Channels

<!-- channels:start -->
36 channels. Written from `channels/` by `pnpm readme`; do not edit by hand.

| Slug | Channel | Feed cut before | Feed |
|---|---|---|---|
| `carolinegirvan` | https://youtube.com/@carolinegirvan | 2024-09-01 | https://chargingthefuture.github.io/rss-feeds/youtube/carolinegirvan.xml |
| `christitustechnical` | https://youtube.com/@ChrisTitusTechnical | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/christitustechnical.xml |
| `colbertlateshow` | https://www.youtube.com/@ColbertLateShow | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/colbertlateshow.xml |
| `doctorly` | https://www.youtube.com/@Doctorly | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/doctorly.xml |
| `donttellcomedy` | https://www.youtube.com/@DontTellComedy | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/donttellcomedy.xml |
| `drmattdrmike` | https://www.youtube.com/@DrMattDrMike | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/drmattdrmike.xml |
| `dustinnickerson` | https://www.youtube.com/@DustinNickerson | 2024-09-01 | https://chargingthefuture.github.io/rss-feeds/youtube/dustinnickerson.xml |
| `eamonandbec` | https://www.youtube.com/@eamonandbec | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/eamonandbec.xml |
| `ericarhodescomedy` | https://www.youtube.com/@ericarhodescomedy | 2024-09-01 | https://chargingthefuture.github.io/rss-feeds/youtube/ericarhodescomedy.xml |
| `expeditionevans` | https://www.youtube.com/@ExpeditionEvans | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/expeditionevans.xml |
| `flashgitz` | https://www.youtube.com/@Flashgitz | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/flashgitz.xml |
| `gonewiththewynns` | https://www.youtube.com/@gonewiththewynns | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/gonewiththewynns.xml |
| `growwithjo` | https://www.youtube.com/@growwithjo | 2023-12-31 | https://chargingthefuture.github.io/rss-feeds/youtube/growwithjo.xml |
| `howtocooksmarter` | https://www.youtube.com/@HowToCookSmarter | 2024-09-01 | https://chargingthefuture.github.io/rss-feeds/youtube/howtocooksmarter.xml |
| `jeremyethier` | https://www.youtube.com/@JeremyEthier | 2024-09-01 | https://chargingthefuture.github.io/rss-feeds/youtube/jeremyethier.xml |
| `jumpropedudes` | https://www.youtube.com/@JumpRopeDudes | 2024-09-01 | https://chargingthefuture.github.io/rss-feeds/youtube/jumpropedudes.xml |
| `karaandnate` | https://www.youtube.com/@KaraandNate | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/karaandnate.xml |
| `lastweektonight` | https://www.youtube.com/@LastWeekTonight | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/lastweektonight.xml |
| `linustechtips` | https://www.youtube.com/@LinusTechTips | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/linustechtips.xml |
| `mutilpe` | https://www.youtube.com/@mutilpe | none | https://chargingthefuture.github.io/rss-feeds/youtube/mutilpe.xml |
| `netflixisajoke` | https://www.youtube.com/@netflixisajoke | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/netflixisajoke.xml |
| `nutritionmadesimple` | https://www.youtube.com/@NutritionMadeSimple | 2024-09-01 | https://chargingthefuture.github.io/rss-feeds/youtube/nutritionmadesimple.xml |
| `parlayrevival` | https://www.youtube.com/@ParlayRevival | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/parlayrevival.xml |
| `petecorrealeofficial` | https://www.youtube.com/@petecorrealeofficial | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/petecorrealeofficial.xml |
| `realcandaceo` | https://www.youtube.com/@RealCandaceO | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/realcandaceo.xml |
| `realtime` | https://www.youtube.com/@RealTime | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/realtime.xml |
| `sailinglavagabonde` | https://www.youtube.com/@SailingLaVagabonde | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/sailinglavagabonde.xml |
| `sailinguma` | https://www.youtube.com/@SailingUma | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/sailinguma.xml |
| `sailingzatara` | https://www.youtube.com/@SailingZatara | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/sailingzatara.xml |
| `sebastiancomedy` | https://www.youtube.com/@sebastiancomedy | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/sebastiancomedy.xml |
| `svdelos` | https://www.youtube.com/@svdelos | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/svdelos.xml |
| `thedailyshow` | https://www.youtube.com/@TheDailyShow | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/thedailyshow.xml |
| `theodd1sout` | https://www.youtube.com/@TheOdd1sOut | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/theodd1sout.xml |
| `therealmarksmalls` | https://www.youtube.com/@therealmarksmalls | 2024-09-01 | https://chargingthefuture.github.io/rss-feeds/youtube/therealmarksmalls.xml |
| `wildlingsailing` | https://www.youtube.com/@WildlingSailing | 2024-10-01 | https://chargingthefuture.github.io/rss-feeds/youtube/wildlingsailing.xml |
| `zachnoetowers` | https://www.youtube.com/@ZachNoeTowers | 2024-09-01 | https://chargingthefuture.github.io/rss-feeds/youtube/zachnoetowers.xml |
<!-- channels:end -->

## Adding or removing a channel

Actions → "Add or remove a channel" → Run workflow. Give the channel as `@handle` or a full address.

- **add** (the default) collects the channel. The cutoff box starts filled with `2024-09-01`: the
  archive still collects everything, but the feed stops there — videos dated on or after the date
  are never written into it. Change the date, or clear the box for no cutoff. The date is kept on
  later refreshes; run again with the channel and a new date to change it.
- **remove** deletes the channel's archive, so its feed comes off the site once merged. Use the same
  handle it was added with. Git history keeps the file.

Leave the channel box empty with **add** to refresh every channel already collected; each keeps its
own cutoff.

A run that changes something rewrites the channel list above and opens a pull request with both; the change goes live once that is
merged. The run's summary prints each feed's address. Subscribe to it in a reader.

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
pnpm readme                                                    # rewrites the channel list in this file
pnpm typecheck
```
