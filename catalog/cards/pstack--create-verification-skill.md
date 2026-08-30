---
id: pstack/create-verification-skill
src: raw_source/pstack/create-verification-skill/SKILL.md
sha: f869e26122991252373d5b8f6357e5b9ff195a00
status: active
mechanism: interview the repo to learn how to launch, drive and observe the real app, then generate a project-local skill that proves behaviour, and run it once before handing it over
human_in_loop: false
subject: codebase
cost: high
landmines: ["writes to .cursor/skills/verify-<app>/", "sidecar references a feature-map-example directory"]
concepts: [verification, evidence-discipline]
---

Generates a project-local skill that drives the real app the way a user does and captures evidence. Written for the next agent to read cold, mid-task, having never seen the app.

**Interview the repo, not the user** - answer surface, run, drive, observe and isolate from the codebase and ask only what cannot be observed. The generated skill has a fixed shape whose best element is **Doctor**: one read-only check answering 'is this instance worth driving?' that an agent runs first whenever anything looks off.

The proof standards are the strongest part and generalise well beyond UI testing: exercise the real user path, not internal setters or test-only endpoints; capture the action *and* the resulting state, not just the final screen; verify side effects (files written, rows inserted, messages sent) alongside what is visible; and when the safe path is a dry-run, **verify what it actually skips by observing rather than trusting its name**, since some dry-runs still touch the network or open a browser. Cleanup rules are equally sharp: never kill by process name, kill what you started; and cleanup removes instances and scratch state but never the evidence. Finally, the generator must run its own output end to end once before handing it over, because **a generated skill that was never executed is a draft, not a deliverable**.
