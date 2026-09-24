# CLAUDE.md

Repo: `chargingthefuture/rss-feeds`. Feeds built from the public upload lists of YouTube channels,
published to GitHub Pages for a feed reader. `README.md` says what is where; `DISCLAIMER.md` says
what a listing means and is the one source of that text — the site's index page is rendered from it.

## Why this is its own repository (owner decision, 2026-09-24)

A collected channel under the blog's own namespace reads as a statement about that channel, and a
cutoff date reads as one too. Neither belongs in Charging The Future's own writing. So the
archives, the collector, the feed builder and the workflows live here, apart from the blog, with a
disclaimer of their own. Nothing in this repository is written in the blog's voice, and nothing
here vouches for, accuses, or associates the project with any channel listed.

## Rules

- A collected title is another person's words. Never respell, reword, or trim it. There is no
  spelling gate here for that reason.
- A cutoff is the reader's own decision about their own reading. The feed's description says the
  feed is cut and where; it says nothing about why.
- The archive is complete; the cut is applied at publish time. Never delete entries from an archive
  to enforce a cutoff.
- `dist/` is build output and never committed.

## Conventions

- Branch names: `<type>/<short-description>`. Never work on an auto-generated `claude/<slug>` branch.
- Conventional Commit titles. Commit messages end with the session URL on its own line.
- Open every PR ready for review. Auto-merge is not turned on here; a PR waits for a human merge.
- Plain language, no jargon, no pleasantries. The word "whole" is not used.
- The owner is written they/them.
