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

## No PR watching (owner directive, 2026-09-26)

Never watch a pull request. After opening one, do not subscribe to its activity, do not schedule a check-in, and do not wait for its checks to finish. Report once and stop. The harness may subscribe a session to every pull request it opens on its own; unsubscribe straight away.

Watching fills the session with GitHub notices and full check lists, which brings on compaction sooner, and a compacted session loses what the owner said earlier. The owner merges from their phone and sees the checks there. Checks run locally before every push are what keep a pull request from going red; when the owner wants to know where open pull requests stand, they ask, and the agent makes one pass over them, not a watch.

## Keep sessions from filling up (owner directive, 2026-09-26)

Everything an agent reads stays in the session until compaction, and compaction swaps the earlier conversation for a summary. So spend the session on the owner's words, not on raw output.

- Hand broad searches to a helper agent that returns only its conclusion. Anything that means reading across several files or directories to answer one question goes to a helper; a single lookup in a known file is done directly.
- Read only the part of a file the task needs, by line range or search, not entire files.
- Read only failed checks and the failing part of a log. Never pull a full list of passing checks or a full log to confirm something is green.
- Take a screenshot only when a visual change has to be checked, and look at it once.

The owner can also compact on their own terms: typing `/compact` followed by what to keep (for example, `/compact keep the open PR list and today's rules`) compacts at a moment they choose, with their instructions shaping the summary. `/clear` starts the session over. Rules that must outlive any session go in this file, not in chat.
