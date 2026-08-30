---
name: distill-cards
description: Read vendored upstream skills and write one distilled card each into catalog/cards/. Use when catalog cards are missing or reported stale by scripts/sync-vendor.mjs. Repo-local to stack-hub.
---

# distill-cards

Turn vendored upstream skills into short, comparable cards. The cards exist because
the corpus does not fit in context and **frontmatter descriptions cluster wrongly** —
`mattpocock/grilling` and `pstack/interrogate` describe themselves almost identically
and are mechanically opposite. A card records what a skill *does*, not what it says
about itself.

## Which cards to write

Run `node scripts/sync-vendor.mjs` first. Then write a card for every entry in
`catalog/index.json` that has `status: active` and either has no card in
`catalog/cards/`, or whose card's `sha` no longer matches the index.

Never regenerate a card whose sha still matches. It is already correct and rewriting
it churns the diff for nothing.

## How to read the source

Read the **whole body** of `raw_source/<...>/SKILL.md`, not its frontmatter. The frontmatter
is the author's pitch; the body is the mechanism. You are looking for:

- What concretely happens when it runs — steps, fan-out, loops, gates.
- Whether a human is in the loop, and where.
- What it operates *on*: a plan, an idea, a diff, a codebase, a document.
- What it costs. Anything spawning subagents or multiple frontier models is expensive
  and that must be visible before it is chosen.
- What would break outside its home tool. These are the landmines the semantic layer
  has to fix, and they are the main reason vendored skills are not drop-in runnable.

## Card format

Write to `catalog/cards/<source>--<name>.md`, replacing `/` in the id with `--`.

```
---
id: pstack/interrogate
src: raw_source/pstack/interrogate/SKILL.md
sha: <copy verbatim from catalog/index.json>
status: active
mechanism: fan out N subagent reviewers on different models over a diff, synthesise one verdict
human_in_loop: false
subject: code diff
cost: high
landmines: ["reads ~/.cursor/rules/pstack-models.mdc", "hardcoded model slugs", "Cursor subagent_type: generalPurpose"]
concepts: [adversarial-review]
---

Two short paragraphs, ~200 words total. What it actually does, and specifically what
is worth stealing. Name the one idea that would be lost if this skill vanished.
```

Field rules:

- `sha` — copy from the index verbatim. This is what drift detection compares against;
  a wrong sha silently disables it.
- `mechanism` — one line, concrete, verb-first. "Fan out N reviewers over a diff", not
  "provides adversarial review capabilities".
- `subject` — one of: `plan`, `idea`, `diff`, `codebase`, `document`, `session`, `skill`.
  This field does most of the clustering work, so be precise.
- `cost` — `low` unless it spawns subagents, calls multiple models, or runs long. Then `high`.
- `landmines` — concrete and quotable. A path, a slug, a tool name. Not "may need adaptation".
- `concepts` — your best guess at the semantic concept(s) it belongs to. A guess is
  useful; leave it as one word rather than inventing a taxonomy here. The forge skill
  decides the real boundaries.

## Excluding

Set `status: excluded` and add a `reason:` when a skill is not worth carrying — it is
tool-specific in a way that does not transfer, it is a setup/installer for its own
stack, or it is marked deprecated or unfinished upstream. Write the reason as a fact
about the skill, not a verdict about its author.

Excluded cards are skipped by the forge skill and never trigger drift alerts. Exclusion
is data, so it can be revisited: mirror the change into `catalog/index.json` so it
survives the next sync.
