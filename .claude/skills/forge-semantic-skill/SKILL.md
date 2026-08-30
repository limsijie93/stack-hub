---
name: forge-semantic-skill
description: Cluster the catalog, propose a semantic concept, and draft a stack-hub semantic skill with provenance and ported landmines. Use when adding a new skill to stack-hub or reconsidering an existing concept boundary. Repo-local to stack-hub.
---

# forge-semantic-skill

Draft one semantic skill from N upstream skills. You propose; the author edits. Nothing
here is written without being shown first.

A semantic skill is **one concept synthesised from several upstream skills**, hand-authored
and freely edited, carrying a record of what it took and what it rejected. It is never a
1:1 wrapper and never a copy.

## Step 1 — load the corpus

Read `catalog/index.json`, then every card in `catalog/cards/` with `status: active`.
That is the whole active corpus and it fits in context; this is the entire reason the
cards exist. **Do not read `raw_source/` at this stage** — 82 skills is ~340 KB and reading
them defeats the point. Open a specific vendored file only in step 4, and only for the
handful you are actually drawing on.

If cards are missing or stale, stop and run `distill-cards` first. Clustering on an
incomplete catalog produces boundaries you will have to redraw.

## Step 2 — cluster on mechanism, not description

Group by `mechanism`, `subject`, `human_in_loop` and `cost`. Never by the upstream
`description` field, and never by name similarity.

The worked example, and the reason this rule exists: `mattpocock/grilling` and
`pstack/interrogate` both describe themselves as adversarial challenge. One is a
sequential human dialogue over a *plan*; the other fans four models over a *diff* with
no human present. Same word, opposite mechanism. Clustering on their descriptions merges
them and produces a skill that does neither thing well.

Cluster members should share a mechanism or a subject. If they share only a theme, that
is not a concept — it is a category, and categories make bad skills.

## Step 3 — propose the concept, and its edges

Present to the author, before writing anything:

- The proposed name. A concept (`adversarial-review`), never an upstream name
  (`pstack-interrogate`). It is what Claude Code auto-routes on, so it must read as
  the job, not the lineage.
- What is **in** the cluster, one line each on what that member contributes.
- What is **out** that plausibly looked in, and the distinction that excludes it. This
  is the load-bearing part — a boundary is defined by what it rejects.
- Whether this should be one skill or two. If members split cleanly on `subject` or
  `human_in_loop`, two skills is usually right. Say so rather than forcing a merge.

Wait for the author. Do not proceed to drafting on your own judgement.

## Step 4 — draft the skill

Write to `plugins/stack-hub-lab/skills/<concept>/SKILL.md`. Everything is born in lab;
nothing is drafted straight into core.

```
---
name: adversarial-review
description: <trigger-rich; this is what Claude Code auto-routes on>
maturity: lab
upstream:
  - src: pstack/interrogate@<sha from the index>
    took: model-diversity fan-out, verdict synthesis, no auto-apply
    rejected: Cursor config path, hardcoded model slugs
  - src: mattpocock/grilling@<sha>
    took: one-question-at-a-time loop, look up facts and ask only decisions
---
```

Now open the specific vendored files you are drawing on and write the body. Rules:

- **Port the landmines.** Every `landmines` entry on every card in the cluster must be
  resolved in your draft, not carried through. A Cursor path becomes a Claude Code
  equivalent or is dropped; a hardcoded model slug becomes the subagent conventions
  actually available here. An unported landmine is a bug.
- **Self-contained.** `raw_source/` is dev-only and does not ship, so the skill cannot cite
  it at runtime. Anything needed to run must be in the file.
- **`took:` and `rejected:` must be honest and specific.** They are the record of your
  judgement, and drift alerts send the author straight back to them. "Various ideas" is
  worthless a month later.
- Shorter than the sum of its sources. If the draft is longer than the upstream skills
  it replaces, the synthesis has not happened yet.

## Step 5 — record the decision

Draft `decisions/NNNN-<concept>.md`, next free number:

```markdown
# NNNN — <concept>

## Cluster
<members, with the sha each was read at>

## The distinction
<the mechanism split that defines the boundary — the reusable part>

## Rejected
<what was considered and left out, and why>

## Landmines ported
<each one, and what it became>
```

This is human-only rationale. It never ships and nothing loads it — it exists so that
in six months the boundary can be re-argued from evidence rather than re-guessed.

## Step 6 — wire it up

- Add `"./skills/<concept>"` to `plugins/stack-hub-lab/.claude-plugin/plugin.json`.
- Run `node scripts/sync-vendor.mjs` and confirm the new skill shows as declaring its
  upstream, with zero drift.
- Remind the author to keep the upstream plugin installed. Lab means comparing them on
  real work; that comparison is the evidence promotion requires.
