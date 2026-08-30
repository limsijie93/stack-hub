# Contributing to stack-hub

## The layers

```
sources.yaml + raw_source/ + catalog/   upstream, pinned and distilled   (dev-only)
plugins/*/skills/                   the semantic layer               (ships)
plugins/stack-hub-playbooks/        scenarios that chain skills      (ships, from skill #2)
decisions/                          why each boundary is drawn       (never ships)
```

`raw_source/` and `catalog/` sit inside no plugin root and never install. Plugins are cached
as flat siblings (`cache/<marketplace>/<plugin>/<version>/`) with no dependency mechanism
between them, so **one plugin cannot path into another's files.** Every semantic skill
must therefore be fully self-contained.

`raw_source/` must also stay outside any `skills/` directory, or plugin skill-discovery will
try to register 82 upstream skills as yours.

## Adding a skill

1. `node scripts/sync-vendor.mjs` — fetch, prune, reindex, report drift.
2. Run the `distill-cards` skill for any card that is missing or stale.
3. Run the `forge-semantic-skill` skill. It clusters, proposes a concept and its edges,
   and drafts into `plugins/stack-hub-lab/skills/`. It proposes; you edit.
4. Add the skill path to `plugins/stack-hub-lab/.claude-plugin/plugin.json`.
5. Write `decisions/NNNN-<concept>.md`.
6. `node scripts/sync-vendor.mjs` again — confirm the skill declares its upstream and
   drift is zero.

Everything is born in `lab`. Nothing is drafted straight into `core`.

## Supersession: stack-hub is authoritative

**Where stack-hub ships a skill covering a concept, that skill is the current version.** We do
not run it alongside the upstream it was built from, and we do not design for coexistence.

Two skills describing the same job compete for the same trigger, and the outcome is decided by
description phrasing rather than by which is better. That is not a comparison; it is a coin
toss you cannot read the result of.

So a skill declares what it replaces, in frontmatter:

```yaml
supersedes:
  - mattpocock-skills:grilling
  - mattpocock-skills:grill-me        # trampolines count
```

Format is `<installed-plugin>:<skill>`. Declare it only where this skill genuinely does the
whole job — drawing one rule from an upstream is **not** supersession. `evidence-discipline`
takes a rule from `diagnosing-bugs` and does not replace it, so it declares nothing.

`scripts/validate.mjs` checks the format. Generate the uninstall list with:

```bash
grep -rh '^  - .*:' plugins/*/skills/*/SKILL.md -A0 | grep -oE '[a-z0-9-]+:[a-z0-9-]+' | sort -u
```

**Sequencing matters.** Uninstall an upstream plugin only *after* stack-hub is installed and
its covering skill is present. Uninstalling first leaves you with neither.

## The promotion gate

A skill moves from `lab` to `core` when **all four** hold:

1. You used it on real work at least **three** times.
2. It needed no edit during those three uses.
3. Every `landmines` entry from every card in its cluster is resolved in the skill, not
   carried through.
4. **It auto-routed at least once without you naming it.**

(4) is the real gate, and it replaced an earlier criterion — "willing to uninstall the
upstream" — which went vacuous once supersession became immediate rather than deferred.

It is the right replacement because once the upstream is gone, the thing that still needs
proving is that the **description works**. A skill that only ever fires when invoked by name
has a description problem, not a content problem, and the fix is to tune the description
rather than to promote it. Upstream states this diagnosis directly: *"the skill exists but did
not trigger"* is its own category of defect.

It is also falsifiable in the way the old criterion was: either you watched it fire on its
own, or you did not.

To promote: move the directory to `plugins/stack-hub-core/skills/`, set `maturity: core`, move
the path between the two manifests, and record in the decision record which use auto-routed.

## Curation

Exclusions are authored in `catalog/exclusions.yaml` and are **data, not absence** — the
skill stays vendored, keeps its licence, and can be reinstated in one edit. Excluded
skills get no card, are skipped by the forge, and never raise a drift alert.

`catalog/index.json` is derived and disposable. Never put authored judgement in it; it is
rebuilt from scratch on every sync. A typo'd id in `exclusions.yaml` fails the sync loudly
rather than silently excluding nothing.

Write an exclusion reason as a fact about the skill, not a verdict about its author.

## Drift

`scripts/sync-vendor.mjs` has three modes:

| Mode | Does | Used by |
|---|---|---|
| (none) | fetch at the pinned refs, write `raw_source/`, `catalog/index.json`, `NOTICE.md` | you |
| `--check` | no writes; exit 1 if a declared sha is stale | CI on PRs |
| `--upstream` | resolve branch HEAD instead of the pin; exit 1 if declared upstream moved | CI weekly |

Drift is reported **only for upstream something declares** — a non-excluded card, or a
semantic skill's `upstream:` list. Churn in an excluded skill is silent by design.

CI can detect drift but cannot fix it: regenerating a card needs an LLM pass. The issue
tells you which cards and which skills to revisit.

## Provenance

Every semantic skill records, per upstream source, what it `took:` and what it
`rejected:`. Be specific — a drift alert sends you straight back to these lines, and
"various ideas" is worthless a month later.

`NOTICE.md` is generated by the sync script so attribution cannot drift from what is
actually vendored. Edit `sources.yaml`, never `NOTICE.md`.
