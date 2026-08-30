---
name: session-continuity
description: Carry work across a context boundary in either direction — write a handoff for the next session, or reconstruct where things stand before resuming. Use for "hand this off", "write a handoff", "catch me up", "where did I leave off", "what was I working on", "pick this back up", or when starting work on something you touched before.
maturity: lab
supersedes:
  - mattpocock-skills:handoff
upstream:
  - src: mattpocock/productivity/handoff@2eb98a51b97bb5bac461a26ad14828eeac827909
    took: reference artifacts rather than restating them, a suggested-skills section so routing survives the boundary, redact secrets, write outside the workspace, tailor to what the next session is for
    rejected: nothing material
  - src: pstack/recall@7e3f26595160dac08bfc3287cef48d7e75b74dfa
    took: the two-records framing, lock the scope before searching and state it back, verify against live state, the status-tag output contract, cut detail before you cut threads
    rejected: ~/.cursor transcript path scheme and the transcript-mining fan-out (no Claude Code equivalent, see Reconstructing), delegation to the why skill's investigators, unslop invocation by name
---

# session-continuity

One problem, two directions. **Forward**: you are ending, and the next session needs what you
know. **Backward**: you are starting, and need to rebuild where things stand. Same principle
both ways — the record is not in your head, and what *is* in your head is not the record.

---

## Forward — writing a handoff

Write a document a fresh agent can act on, to the OS temp directory, **not** the workspace. A
handoff is scaffolding for a transition, not an artifact of the project.

- **Do not duplicate what already has a home.** Specs, ADRs, issues, commits, diffs, PRs —
  reference them by path or URL. A handoff that restates them becomes a stale second copy the
  moment either changes.
- **Say what the next session is for**, and tailor to it. A handoff for "finish the migration"
  and one for "review what I did" are different documents.
- **Include a suggested-skills section** naming what the next agent should reach for, so
  routing survives the boundary instead of being rediscovered.
- **Redact secrets** — keys, tokens, credentials, personal data.
- State what is *unfinished and why*, not just what was done. The next session needs the edge
  you stopped at, including anything you tried that did not work.

---

## Backward — reconstructing

Your context lives in **two records**, and they hold different things:

- **Your own history** — what you did and decided.
- **The shared record** — everything that happened around the same code under other names:
  commits, PRs, issues, review threads, what shipped and got reverted. A thing with a long
  tail keeps most of its story here, so never reconstruct from your own memory alone.

### Lock the scope first

Pin the window (default: the last 7 days), the topic if one was named, and the project. **State
it back before searching.** Never quietly turn "all" into "recent N" — if you narrow, say so.

### What is actually available here

Claude Code keeps a project-scoped **prompt** history at `~/.claude/history.jsonl`, with one
entry per prompt carrying `project`, `display` and `timestamp`. Filter it by the current
project:

```bash
python3 - "$PWD" <<'EOF'
import json, os, sys, datetime
proj = sys.argv[1]
rows = []
for line in open(os.path.expanduser("~/.claude/history.jsonl")):
    line = line.strip()
    if not line: continue
    try: d = json.loads(line)
    except: continue
    if d.get("project") != proj: continue
    ts = d.get("timestamp")
    if isinstance(ts, (int, float)):
        ts = datetime.datetime.fromtimestamp(ts/1000 if ts > 1e11 else ts)
    rows.append((ts, (d.get("display") or "").replace("\n", " ")[:100]))
rows.sort()
for ts, disp in rows[-25:]:
    print(f"{ts:%Y-%m-%d %H:%M}  {disp}")
EOF
```

**Be honest about what this is: prompts, not transcripts.** It gives you the sequence of what
was asked, which is a good topic index and a rough timeline. It does not give you decisions,
dead ends, corrections, or what was actually done. There is no reliable full-transcript store
to mine — `~/.claude/transcripts/` carries no project field, sits in a flat directory shared
across all projects, and cannot be attributed back to a project. Do not claim to have read
session history you have not read.

So the **shared record carries most of the weight**, and it is the more reliable half anyway:

```bash
git log --oneline -25
git log --oneline --all --since="7 days ago"
git status --porcelain
git branch -vv
gh pr list --state all --limit 20
gh issue list --state all --limit 20
```

### Verify against live state

A commit message, a stale ticket or an old prompt is *history*, not current truth. Before
reporting a thread's status, check it: does the branch still exist, is the PR open or merged,
does the file still contain what the commit claimed. Anything you cannot verify, mark unverified
rather than asserting it.

### Output contract

- **Capsule** — at most 5 bullets. What this work is and where it stands overall.
- **Threads** — one line each, prefixed with exactly one tag from this closed set:
  `[merged #N]` · `[open PR #N]` · `[in flight <branch>]` · `[verified, uncommitted]` ·
  `[reverted #N]` · `[planned, not started]`. An untagged thread is not done being triaged.
- **Problems** — at most 5, the recurring ones. Include anything that shipped and was reverted,
  so the next attempt starts where the last one failed.
- **Next move** — the single most useful next action, concrete.

Stay on the named topic; an adjacent thread stays out unless it blocks this one. **When the
capsule and thread lines outgrow a screen, cut detail before you cut threads** — a short list
that omits a thread is worse than a long one that mentions it in five words.

Cite what you found: commit sha, PR number, issue id, file path. An uncited claim about state
is a guess.
