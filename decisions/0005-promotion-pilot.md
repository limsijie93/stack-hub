# 0005 — promotion pilot: the 1:1 port-and-sharpen pattern

Date: 2026-08-30. Skills: `model-the-domain`, `laziness-protocol`,
`resolving-merge-conflicts`, `grilling`, `git-guardrails`.

## What changed about the method

Skills #1–#4 were all **N:1 syntheses** resolving a cross-vendor overlap. This batch is the
first **1:1 promotion** of skills that have no counterpart in the other vendor.

The 1:N rule exists to resolve *overlap*. Where there is none, forcing a merge produces a
category rather than a concept — which the forge skill already says ("if members split
cleanly on subject, two skills is usually right; say so rather than forcing a merge") and
which the first draft of this batch ignored by proposing to bundle 16 principles.

There is also a routing argument for keeping them separate: Claude Code auto-routes on
`description`, so *"apply when wiring validation, error handling, or framework adapters"* is a
far sharper trigger than *"principles"*. Sixteen narrow descriptions should route better than
one broad one.

**So: 1:1 by default for non-conflicting skills; merge only where overlap is real.**

## The audit that produced the batch

Clustering all 67 cards, then subtracting what existing lab skills already draw on:

- **25 skills have no cross-vendor twin.** 16 are pstack `principle-*`.
- **18 of 52 unused skills have zero recorded landmines** — and 16 of those are principles.
  The most portable content in the corpus is the content with no mechanism in it.

Gap taxonomy across the unused set, with two corrections to the first pass:

| Gap | Skills | Severity |
|---|---|---|
| `references/*.md` sidecars | 13 | **Not a gap.** All 32 are vendored; they need copying into the skill dir, nothing more. |
| Invokes a skill stack-hub lacks | 9 | Real — dangling references |
| Assumes repo conventions | 8 | Real — needs a fallback or a stated precondition |
| Cursor paths / model slugs / subagent API | 8 | Mechanical; all three patterns already ported |
| Non-markdown sidecars dropped by our prune rules | 5 files | **Our bug** |

## The prune bug

`keep: ["**/SKILL.md", "**/*.md", "LICENSE"]` silently discarded five files carrying real
value — `wizard/template.sh` (8.6 KB, and wizard essentially *is* that file),
`git-guardrails/scripts/block-dangerous-git.sh`, `show-me-your-work`'s `log.sh` and TSV
template, `diagnosing-bugs/scripts/hitl-loop.template.sh`.

Fixed by adding `**/*.sh` and `**/*.tsv`. This recovered **six** files, not the five
predicted: `poteto-mode/scripts/worktree-audit.sh` also matched. That skill is excluded, but
its script arriving is consistent rather than a bug — exclusion is catalog-level, vendoring is
file-level, and `poteto-mode/SKILL.md` is already vendored on the same basis.

Correctly still dropped: 63 files of per-skill `agents/openai.yaml` manifests and
`poteto-mode/scripts/*.ts`.

## The port-and-sharpen standard

For each promoted skill: keep upstream structure and substance, and edit.

1. **Rewrite the `description`** around the moments it should fire, not the topic it covers.
2. **Add a "when this does not apply" section.** Only `exhaust-the-design-space` had one
   upstream. It is what keeps a rule from becoming ceremony, and writing it is where most of
   the thinking went in this batch.
3. **Resolve sibling cross-references.** `../principle-x/SKILL.md` breaks the moment the file
   moves; inline the point or drop the link.
4. **Dangling skill references become conditional or inline.** `grilling`'s subagent dispatch
   now degrades to inline lookup rather than assuming a facility exists.
5. **Sidecars a skill needs are copied into its own directory** — `raw_source/` does not ship.
   `git-guardrails` carries `block-dangerous-git.sh` and references it via
   `${CLAUDE_PLUGIN_ROOT}` (verified in use across three installed plugins).
6. **Provenance gains an optional `changed:` field**, listing the edits made to a near-verbatim
   port. `took:` stays required so `validate.mjs` is untouched, and a drift review can now see
   exactly what had been altered when upstream moves.

## Notes per skill

- **`model-the-domain`** — tells promoted to their own section, since they are the checkable
  part. Does-not-apply covers the case that matters: complexity in the data is not complexity
  in the design.
- **`laziness-protocol`** — the agent-facing premise ("writing code is cheap for you") is kept
  explicit rather than generalised away; it is the *reason* the rule exists. Does-not-apply
  was essential here — without it the rule argues against every necessary abstraction.
- **`resolving-merge-conflicts`** — upstream says "find the primary sources" without saying
  how; concrete `git log --merge` / `gh pr list` commands added. Does-not-apply names the two
  cases where `--abort` genuinely is right, which upstream's absolute rule does not admit.
- **`grilling`** — the recommendation-per-question rule promoted from convention to
  requirement, since it is what makes a whole-frontier round answerable at all.
- **`git-guardrails`** — the `jq` dependency was assumed silently upstream; without it the
  hook fails open and blocks nothing while looking installed. Now checked first. Verification
  extended to prove it does *not* over-block, since a guardrail that blocks everything gets
  uninstalled.

## Open

- **`grilling` now collides with the installed `mattpocock-skills:grilling`.** That is the lab
  A/B working as designed — the promotion gate needs exactly this comparison — but two skills
  will compete on similar triggers until one is uninstalled.
- Whether "port and sharpen" is enough of a contribution for a zero-landmine skill is a fair
  question. The does-not-apply sections are the honest answer: five of them did not exist
  upstream and are the part most likely to change behaviour.
- 20 non-conflicting skills remain unpromoted.
