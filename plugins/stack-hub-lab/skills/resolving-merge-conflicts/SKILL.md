---
name: resolving-merge-conflicts
description: Resolve an in-progress git merge or rebase conflict by recovering the intent behind each side, not by picking lines. Use when a merge or rebase has stopped with conflicts, for "resolve these conflicts", "fix the merge", "help me rebase", or when CONFLICT markers are present in the working tree.
maturity: lab
supersedes:
  - mattpocock-skills:resolving-merge-conflicts
upstream:
  - src: mattpocock/engineering/resolving-merge-conflicts@bfb7e5606e231e6808979f623fce76a9aad4b71c
    took: the whole five-step rule, substantially verbatim - recover intent from primary sources first, preserve both intents, never invent behaviour, always resolve rather than abort
    changed: description rewritten around triggering moments; added concrete commands for the intent-recovery step, which upstream leaves implicit; added a "when this does not apply" section covering the case where aborting genuinely is correct
    rejected: nothing
---

# Resolving merge conflicts

A conflict is a collision of **intents**, not of text. Resolving it by choosing lines that
look right produces code that compiles and means nothing. So the resolution step is gated on
having recovered both intents first.

## Steps

1. **See the current state.** Which operation is in flight, how far it got, and which files
   conflict.

   ```bash
   git status
   git log --oneline --left-right --merge     # commits from each side touching conflicts
   git diff --name-only --diff-filter=U       # unmerged paths
   ```

2. **Find the primary sources for each side.** Understand deeply *why* each change was made
   and what the original intent was. Read the commit messages, then go past them to the PR
   and the issue.

   ```bash
   git log --merge -p -- <path>               # both sides' history for one file
   git log -1 --format=%B <sha>               # full message, to find #refs
   gh pr list --search "<sha>" --state all    # the discussion around it
   ```

   Commit messages say what changed. PRs and issues say why. You need why.

3. **Resolve each hunk.** Preserve both intents where possible. Where they are genuinely
   incompatible, pick the one matching the merge's stated goal and **note the trade-off** in
   the commit message. Do **not** invent new behaviour while resolving — a conflict is not a
   licence to redesign, and a third behaviour neither side asked for is the worst outcome.

4. **Run the project's automated checks.** Discover them rather than assuming: typecheck,
   then tests, then format. Fix anything the merge broke, not everything that is broken.

5. **Finish the operation.** Stage and commit; if rebasing, continue until every commit is
   replayed.

## When this does not apply

**Always resolve; never `--abort`** — that is the rule, and it holds because aborting
discards the analysis you just did and guarantees you will redo it. Two genuine exceptions:

- **The merge itself was a mistake** — wrong branch, wrong direction, wrong base. Then the
  conflict is a symptom and resolving it cements the error. Abort and redo the merge correctly.
- **The conflict reveals the branches have diverged beyond a hunk-level fix.** If nearly every
  file conflicts and the intents are incompatible at the design level, that is a
  reintegration task to plan, not a conflict to resolve. Say so rather than grinding through it.

Neither exception licenses aborting because the conflict is tedious.
