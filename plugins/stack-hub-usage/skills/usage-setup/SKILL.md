---
name: usage-setup
description: Installs a tqdm-style status line showing context-window load (with a "/compact or /clear" warning before quality degrades) and 5h/weekly usage limits, for Claude Code, Codex CLI and GitHub Copilot CLI. Use when the user asks to set up, install or fix the usage bar, context bar, token status line, or "show my context usage".
---

# Usage bar setup

Plugins cannot set a status line themselves, so this skill wires it up. The status line runs
locally and costs **zero tokens** — the model never sees its output.

```
CC ctx ▕██████▋░░░░░▏ 55% │ 5h ▕███░░░░░░░▏ 31% │ wk ▕█████░░░░░▏ 48%   CX wk ▕██▋░░░░░░░▏ 26%
```

## Steps

1. Copy `usage-bar.py` (next to this file) to `~/.claude/usage-bar.py` — a stable path that
   survives plugin updates. Run `python3 ~/.claude/usage-bar.py --test`; it must print `ok`.
2. For each tool the user has, back up its config, then add the entry. Merge into existing
   config; never overwrite other keys.

| Tool | Config | Entry |
|---|---|---|
| Claude Code | `~/.claude/settings.json` | `"statusLine": {"type": "command", "command": "python3 ~/.claude/usage-bar.py", "padding": 0}` |
| Copilot CLI | `~/.copilot/config.json` | `"statusLine": {"type": "command", "command": "python3 ~/.claude/usage-bar.py --copilot", "refreshInterval": 30}` |
| Codex CLI | `~/.codex/config.toml`, under `[tui]` | `status_line = ["context-used", "five-hour-limit", "weekly-limit"]` |

   Codex cannot run a custom command in its status line, so it gets its built-in items. After
   editing, run `codex features list` — an error means the config no longer parses; restore
   the backup.
3. Tell the user to restart each tool.

## What the bars mean

- **ctx** — context-window fill. Green < 40%, yellow 40–60%, red ≥ 60% with a
  `/compact or /clear` warning. Thresholds are `WARN`/`DANGER` at the top of the script.
- **5h / wk** — Claude's limits when Claude Code passes `rate_limits` to the status line;
  otherwise the current 5h block's cost and time left (via `npx ccusage`, cached 60 s,
  refreshed in the background).
- **CX** — Codex's real 5h/weekly limits, read from its local session logs.

Requires Python 3 and, for the Claude block fallback, Node (`npx`).
