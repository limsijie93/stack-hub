# 0004 — session-continuity

Date: 2026-08-30. Skill: `plugins/stack-hub-lab/skills/session-continuity/`.

## Cluster

- `mattpocock/productivity/handoff@2eb98a5` — `subject: session`, 894 B
- `pstack/recall@7e3f265` — `subject: session`, 5696 B

Same subject, opposite directions: `handoff` writes forward at the end of a session, `recall`
reconstructs backward at the start. Neither references the other; nothing upstream frames them
as one problem.

## The distinction

**A context boundary has two sides, and both are the same problem: the record is not in your
head, and what is in your head is not the record.** That framing is the synthesis — it is why
the skill is named for the concept rather than for either direction, and why the trigger list
spans "write a handoff" and "catch me up".

The practical payoff is that the two halves share rules that only one upstream states:

- `handoff`'s "do not duplicate what already has a home — reference it" is exactly what stops
  the backward half from restating git history it should be citing.
- `recall`'s "verify against live state; history is not current truth" is exactly what stops
  the forward half from writing down a branch state that was true an hour ago.

## The porting constraint, and why it is stated in the skill

`recall`'s first half mines the user's own chat transcripts, and leans on
`~/.cursor/projects/<slug>/agent-transcripts/` structure to avoid reading other projects'
private chats. Claude Code has no equivalent. Checked before drafting:

| Store | project field | current | usable |
|---|---|---|---|
| `~/.claude/transcripts/ses_*.jsonl` | **no** — lines are `{content, timestamp, type}`, flat dir | **no** — newest Feb 2026 | ✗ |
| `~/.claude/history.jsonl` | **yes** (`project`, `sessionId`) | **yes** — current | ✓ prompts only |

The two stores use incompatible id schemes (UUID vs `ses_<base62>`) and the join is empty, so a
transcript cannot be attributed to a project at all. Reading them would be exactly the
cross-workspace leak `recall` warns against.

**So the skill says what it has.** It uses `history.jsonl` filtered by `project` as a prompt-level
topic index, states plainly that these are prompts and not transcripts, and shifts the weight
onto the shared record (`git`, `gh`), which ports fully and is the more reliable half anyway.

Verified before shipping: the filter returns 8 entries for this project and correctly excludes
161 from others.

A skill that promises transcript archaeology and delivers prompt titles is worse than one that
says what it has. This is the clearest case so far of porting *changing what a skill can
honestly claim*, not just changing its paths.

## Rejected

- **The parallel transcript-mining fan-out.** Nothing left to fan out over.
- **Delegation to `why`'s source investigators** for the shared-record sweep. `why` is not in
  stack-hub, and its seven-category MCP enumeration is Cursor-specific. A short concrete
  `git`/`gh` command list is inlined instead — less powerful, actually runnable.
- **`unslop` invocation by name.** Not in stack-hub.
- **`recall`'s routing preamble** (session-pickup vs automate-me vs recall). Those skills do
  not exist here, so the distinction is noise.

## Open

- The name. `context-handoff` is the card concept; `session-continuity` was chosen because
  "handoff" names only one direction. If it fails to trigger on "catch me up" in practice, the
  fix is description tuning, not a rename.
- gstack's `context-save` / `context-restore` are a third and fourth member of this cluster and
  will want folding in when gstack is vendored. The two-direction frame should absorb them
  cleanly, which is a small test of whether the boundary is right.
