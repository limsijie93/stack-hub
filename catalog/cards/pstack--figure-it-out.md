---
id: pstack/figure-it-out
src: raw_source/pstack/figure-it-out/SKILL.md
sha: 6ffc04db212737584aac966c69c53836757fa545
status: active
mechanism: design the playbook before doing the work: frame a falsifiable done predicate, decompose into independently-landable units, run each as an experiment, log the trail
human_in_loop: true
subject: plan
cost: high
landmines: ["cites seven pstack principle-* skills by name", "routes to show-me-your-work and poteto-mode by skill name"]
concepts: [planning, evidence-discipline]
---

The fallback for work no narrower playbook fits - a large migration, an ambitious multi-part change, or work a human reviews after stepping away. The deliverable *before any code* is the workflow itself.

The routing rule is unusually well drawn: a focused single-unit task routes to its specific playbook, but a large or cross-cutting version of that same task belongs here even though the single-unit version would not, because the rigor and the audit trail are the point. Framing requires three things stated up front - the definition of done as a **falsifiable predicate** ('done well' has to be checkable), scope quantified in rough units and effort with blockers raised before hours are spent rather than after fifty doomed commits, and a rigor level biased high, with the clarification that **rigor is gates and artifacts, not 'try harder'**.

Each unit is run as an experiment: state the hypothesis, make the smallest change, measure against the predicate on the real artifact, keep it if it advanced and revert if it did not. The verification rules are the best part. **Verify by inspecting the artifact, never a self-report.** **When something passes too easily, suspect the observation method before the system** - a blank screenshot passes a lazy gate. **A verdict is VERIFIED, NOT VERIFIED, or INCONCLUSIVE, and inconclusive is not a pass.** And if a delegate games a gate, reset and harden the contract; if the gate itself is wrong, fix the gate in its own change rather than routing around it.
