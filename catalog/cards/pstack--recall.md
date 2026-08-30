---
id: pstack/recall
src: raw_source/pstack/recall/SKILL.md
sha: 7e3f26595160dac08bfc3287cef48d7e75b74dfa
status: active
mechanism: fan out over your own chat transcripts and the shared record in parallel, verify against live git state, return a tight status capsule
human_in_loop: false
subject: session
cost: high
landmines: ["hardcoded ~/.cursor/projects/<slug>/agent-transcripts path scheme", "invokes why, unslop, automate-me by skill name", "assumes gh CLI and specific MCP sources"]
concepts: [context-handoff, research]
---

Rebuilds working context before resuming work. The framing is the valuable part: your context lives in **two records** - your own chat history, which holds what you did and decided, and the shared record (source control, issue tracker, chat, docs, error tracking), which holds everything that happened around the same code under other names: symptoms users keep reporting, fixes that shipped and got reverted, errors still firing. A feature with a long bug tail keeps most of its story in the second, so it must not be reconstructed from transcripts alone.

Strong disciplines: **lock the scope before searching** - pin the window, topic and workspace, state it back, and never quietly turn 'all' into 'recent N'. **Verify against live state**, because a transcript or stale ticket is history, not current truth. Keep raw transcripts inside the subagents so only findings reach the main thread. And the output contract is unusually good: a capsule of at most 5 bullets, then one line per thread each carrying exactly one status tag from a closed set (merged / open PR / in flight / verified-uncommitted / reverted / planned), then at most 5 recurring problems including any fix that shipped and was reverted so the next attempt starts where the last failed, then a single concrete next move. 'When the capsule and thread lines outgrow a screen, cut detail before you cut threads' is a good general rule for status writing.
