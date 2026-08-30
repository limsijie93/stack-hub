# 0001 — fan-out-review

Date: 2026-08-30. Skill: `plugins/stack-hub-lab/skills/fan-out-review/`.

## What the plan expected, and what happened

The approved plan pencilled in `adversarial-review`, merging `mattpocock/grilling` with
`pstack/interrogate` — the pair whose frontmatter descriptions look nearly identical.

Reading the bodies killed that cluster. They share a word and nothing else:

| | `grilling` | `interrogate` |
|---|---|---|
| Subject | a plan or idea | a code diff |
| Human | in the loop, every round | absent |
| Mechanism | sequential rounds over a decision tree | parallel fan-out across models |
| Output | shared understanding | a synthesised verdict |

Merging them yields a skill that does neither well. This is exactly the failure the
two-tier catalog exists to prevent, and it is the reason cards record `mechanism`,
`subject` and `human_in_loop` rather than trusting the upstream description.

## Cluster

Reviewers over an artefact, no human in the loop, synthesised into one verdict:

- `pstack/interrogate@11fb2fb` — the spine: independent reviewers, consensus as signal,
  lead-judgment buckets, never auto-apply.
- `pstack/reflect@a0e50f7` — distinct *lenses* per reviewer; the structural-enforcement
  check; treating "the skill exists but did not trigger" as a description problem.
- `pstack/no-comments@a14bdda` — a claimed constraint is an unencoded invariant.
- `pstack/swarm@b7e61ec` — the coordination skeleton the other three each reinvent:
  declare the selection rule before spawning, every brief stands alone, proceed at N-1.

## The distinction

**Fan-out over an artefact to review it** — as opposed to three neighbours that look
close and are not:

- `arena` and `swarm` fan out to **generate** candidates and graft them. Same skeleton,
  opposite purpose. `swarm` contributes its coordination rules here but the concept is
  separate.
- `grilling` and `to-questionnaire` interrogate **a human about a plan**. Sequential,
  human-in-loop. That is `structured-interrogation`, a different skill.
- `blast-radius` proves **one specific fact** about a change by running code. Its value
  is the evidence ladder, not the fan-out. That is `evidence-discipline`.

## The synthesis that isn't in any upstream

`interrogate` rests on cross-vendor model diversity: "the adversarial signal comes from
model diversity, not assigned personas." In Claude Code you have one vendor's family, so
**that premise is weakened and the skill must say so.**

The port compensates by varying *lens* and *model* together — each reviewer asks a
genuinely different question, borrowing `reflect`'s approach — and by explicitly
down-weighting consensus, since two Claude models agreeing is closer to one opinion than
two. Neither upstream skill says this, because neither had to.

## Landmines ported

| Upstream | Became |
|---|---|
| `~/.cursor/rules/pstack-models.mdc` per-role model config | Dropped. Lens/model table inline in the skill. |
| `claude-fable-5-thinking-max`, `gpt-5.6-sol-max`, `grok-4.6-fast-xhigh` | `opus` / `sonnet` / `fable` via the `Agent` tool's `model`. |
| `subagent_type: generalPurpose` (Cursor) | `general-purpose`, or `Explore` for read-only reviewers. |
| `readonly: true` (not a parameter here) | `Explore`, which is read-only by construction. |
| `references/*.md` sidecar prompts | Inlined. The skill must stand alone; `raw_source/` does not ship. |
| `subagent_type: "Comment Sicko"` | Dropped. A general-purpose agent with an explicit comment-hostile brief. |
| `environment: "cloud"`, `cloud_base_branch` | Dropped. `isolation: "worktree"` where isolation is genuinely needed. |
| `~/.cursor/projects` transcript globbing | Dropped. Scope comes from the user or the diff. |

## Rejected

- **Keeping `reflect`'s skill-editing tail.** It routes findings into edits on *its own*
  stack's skills and hands off to Cursor's `create-skill`. That is a different job
  (learning capture) and belongs in its own concept.
- **Keeping the fixed three-lens table.** Three lenses on a two-line diff is waste. The
  port scales the reviewer set to the work.
- **A `principles` cluster.** pstack's 21 `principle-*` skills are stances, not tasks.
  They may be a concept, but not this one, and possibly not skills at all.

## Open

- Whether `upstream:` in frontmatter loads cleanly in Claude Code. Precedent says yes
  (gstack ships `preamble-tier`/`voice-triggers`; mattpocock ships
  `disable-model-invocation`), but this is the first real test. Fallback is a sibling
  `PROVENANCE.yaml`.
- Promotion needs three real uses against `mattpocock-skills` still installed. Until
  then this stays in lab.
