# /rr — request, scan, decide the cutoff

A member sends a channel (URL or `@handle`). This is the routine for turning that into a
collected feed, whether or not the member typed `/rr`.

1. **Resolve the handle.** Pull `@handle` out of whatever URL form was sent.

2. **Scan before collecting.** Unless the member says they already read this channel
   themselves, check the channel's About page, its most recent video titles, and its top
   comments — a few minutes, no video-watching. Look for what a hostile actor's channel
   looks like from the outside: mocking survivors or targeted individuals, scam patterns,
   brigading, a name or thumbnail set up to embarrass rather than inform. An obvious case
   (a name like "schnizo") gets skipped outright — say why, don't collect it. A borderline
   case gets flagged to the member before collecting, not collected first and asked about
   after.

3. **Decide the cutoff. Default: no cutoff.** Do not pass `--cutoff` unless one of these
   holds:
   - The member names a date for this channel specifically.
   - The scan itself turns up a reason a cutoff belongs on this one (e.g. the channel
     visibly changed character after some date).
   A prior session's cutoff choice for other channels is not a reason — decide per channel,
   not by carrying the last one forward.

4. **Collect.** Trigger `collect.yml` (`workflow_dispatch`) with the channel and, only if
   step 3 called for one, the cutoff.

5. **Report and open the PR.** Same as every other collect run in this repo: pull the
   resulting branch, count total vs. in-feed videos, confirm the PR the workflow opened,
   subscribe to it. State plainly whether a cutoff was applied and why (or why not).

This command changes nothing about how a channel is removed later if it turns out wrong —
delete its `channels/<slug>.json` and its line in the index, same as always.
