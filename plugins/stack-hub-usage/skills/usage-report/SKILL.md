---
name: usage-report
description: Token usage report across Claude Code, Codex, Gemini/Antigravity and Copilot CLI — this month's totals, the current 5h block, and live 5h/weekly limits, drawn as tqdm-style bars. Use when the user asks about token usage, spend, limits, or "how much have I used".
---

# Usage report

Run these (they read local logs only; each can take ~10s on first run):

```bash
npx -y ccusage@latest claude monthly --json
npx -y ccusage@latest codex monthly --json
npx -y ccusage@latest gemini monthly --json
npx -y ccusage@latest antigravity monthly --json   # Google usage via Antigravity
npx -y ccusage@latest copilot monthly --json       # GitHub Copilot CLI
npx -y ccusage@latest claude blocks --active --json
echo "{}" | python3 ~/.claude/usage-bar.py   # live Codex limits (installed by the usage-setup skill)
```

A tool with no data (empty result or error) means it wasn't used — show "no usage", don't fail.

## Output

One table, current month only unless the user asks for history:

```
                 tokens     API-equiv $   share of month
Claude Code      12.0M      $ 60.00       ▕███████▌░░▏ 75%
Codex             3.0M      $ 15.00       ▕█▉░░░░░░░░▏ 19%
Gemini/Antigrav   1.0M      $  5.00       ▕▋░░░░░░░░░▏  6%
Copilot           0.0M      $  0.00       ▕░░░░░░░░░░▏  0%

Current Claude 5h block: $X spent, Yh Zm left (projected $P)
Codex limits: 5h ▕…▏ N% · weekly ▕…▏ M%
```

- Bars: 10 cells, `█` full, `▏▎▍▌▋▊▉` partials, `░` empty.
- "API-equiv $" is what the usage would cost pay-as-you-go — say so once; subscriptions are flat-rate.
- Claude Code's real 5h/weekly limit % is in its statusline (and `/usage`), not in local logs — point there rather than inventing a percentage.
- End with one line: biggest consumer, and whether any limit is above 80%.
