---
name: git-guardrails
description: Install a Claude Code PreToolUse hook that blocks destructive git commands before they run - push, reset --hard, clean -f, branch -D, checkout/restore of the working tree. Use for "block dangerous git", "add git safety", "stop me pushing", "git guardrails", or after an agent has run a destructive git command.
maturity: lab
upstream:
  - src: mattpocock/misc/git-guardrails-claude-code@58bcdd875b164093b95f436fa32a65c6cb5eb572
    took: the whole rule and the hook script, substantially verbatim - the blocked pattern list, project-vs-global scope, exit code 2 to block, the verification command
    changed: the hook script now ships inside this skill directory rather than being referenced from the upstream tree, since raw_source does not install; added the jq dependency check, which upstream assumes silently; added the merge-do-not-overwrite warning to the steps rather than a trailing note; added "when this does not apply"
    rejected: nothing
---

# Git guardrails

Install a `PreToolUse` hook that intercepts dangerous git commands before they execute. The
agent sees a message saying it lacks authority; the command never runs.

This is **structural enforcement applied to the agent itself**. Instructing an agent not to
run destructive commands competes with everything else in its context and fails under
pressure. Making the command impossible at the harness level does not.

## What gets blocked

`git push` (all variants, including `--force`) · `git reset --hard` · `git clean -f` /
`-fd` · `git branch -D` · `git checkout .` / `git restore .`

## Steps

### 1. Check the dependency

The script parses the hook payload with `jq`. Confirm it exists first — without it the hook
fails open and silently blocks nothing, which is worse than no hook because it looks installed.

```bash
command -v jq || echo "install jq first: brew install jq"
```

### 2. Ask scope

This project only (`.claude/settings.json`) or all projects (`~/.claude/settings.json`)?

### 3. Copy the script

It ships in this skill directory as `block-dangerous-git.sh`.

```bash
# project
mkdir -p .claude/hooks && cp "${CLAUDE_PLUGIN_ROOT}/skills/git-guardrails/block-dangerous-git.sh" .claude/hooks/
chmod +x .claude/hooks/block-dangerous-git.sh
```

For global scope, use `~/.claude/hooks/` instead.

### 4. Register the hook

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous-git.sh" }
        ]
      }
    ]
  }
}
```

Global scope uses `~/.claude/hooks/block-dangerous-git.sh` as the command.

**If the settings file already exists, merge into the existing `hooks.PreToolUse` array.**
Do not overwrite it — clobbering someone's existing hooks while installing a safety feature
is its own accident.

### 5. Offer customisation

Ask whether to add or remove patterns, and edit the copied script — not the one in the skill
directory, which is the pristine copy.

### 6. Verify it actually blocks

Never assume a guardrail works. Prove it:

```bash
echo '{"tool_input":{"command":"git push origin main"}}' | .claude/hooks/block-dangerous-git.sh; echo "exit=$?"
```

Expect a `BLOCKED:` message on stderr and **exit 2**. Then check it does *not* over-block:

```bash
echo '{"tool_input":{"command":"git status"}}' | .claude/hooks/block-dangerous-git.sh; echo "exit=$?"
```

Expect exit 0 and no output. A guardrail that blocks everything gets uninstalled within a day.

## When this does not apply

- **You need the agent to push.** A release or deploy workflow where pushing is the job will
  be blocked. Scope the hook to the project, or drop `git push` from the pattern list and keep
  the genuinely destructive entries.
- **Patterns match as substrings.** `git push` blocks any command containing it, including a
  commit message that mentions it. If that bites, tighten the pattern rather than removing it.
- **This is not a security boundary.** It stops accidents, not a determined actor — the same
  command via a shell alias or a script is not matched. Treat it as a seatbelt.
