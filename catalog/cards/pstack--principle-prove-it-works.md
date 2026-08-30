---
id: pstack/principle-prove-it-works
src: raw_source/pstack/principle-prove-it-works/SKILL.md
sha: 088c412cc38eb37442914a71d9e05bc6ee430a1b
status: active
mechanism: verify by checking the real thing directly, never a proxy, a self-report, or that it compiles
human_in_loop: false
subject: task output
cost: low
landmines: []
concepts: [principle, evidence-discipline]
---

Unverified work has unknown correctness. Indirect verification - file mtimes, output freshness, agent self-reports, cached screenshots - feels cheaper than direct observation, and acting on a wrong inference costs far more than checking the source.

The rule that generalises furthest: **when verification fails, suspect the observation method before suspecting the system.** A failing check is as likely to be a broken check as a broken system, and that ordering saves enormous time.

The escalation for code is explicit: build it (necessary but not sufficient), run it and exercise the actual feature path, check the full chain from input to output, and for integrations test the whole communication path end to end.

The delegation clause is the one most worth keeping: **trust artifacts, not self-reports.** Inspect the actual output - git diff, file contents, runtime behaviour - because agents report what they intended, not always what happened. This is the abstract principle behind blast-radius's evidence ladder and figure-it-out's verification rules.
