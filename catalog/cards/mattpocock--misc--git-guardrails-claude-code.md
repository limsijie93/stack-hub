---
id: mattpocock/misc/git-guardrails-claude-code
src: raw_source/mattpocock/misc/git-guardrails-claude-code/SKILL.md
sha: 58bcdd875b164093b95f436fa32a65c6cb5eb572
status: active
mechanism: install a Claude Code PreToolUse hook that intercepts and blocks destructive git commands before they run
human_in_loop: true
subject: codebase
cost: low
landmines: ["ships scripts/block-dangerous-git.sh, a .sh sidecar not vendored by the current prune rules"]
concepts: [guardrails]
---

Installs a PreToolUse hook matching Bash that blocks git push (including --force), reset --hard, clean -f, branch -D, and checkout/restore of the working tree. Asks first whether scope is this project or all projects, then writes the script and the settings entry.

Notable as the only skill in either stack that is genuinely Claude-Code-native rather than needing porting - it targets the real hooks API and the real settings files. The transferable idea is structural enforcement applied to the agent itself: rather than instructing an agent not to run dangerous commands, which competes with everything else in context and fails under pressure, make the command impossible at the harness level. That is the same principle reflect states abstractly (anything a mechanism can enforce should not be prose an agent has to remember), here applied to the agent's own tool access. The blocked message tells the agent it lacks authority, which reads better than a bare failure. Its shell script is not vendored, since the prune rules keep markdown only.
