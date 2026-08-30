---
id: pstack/automate-me
src: raw_source/pstack/automate-me/SKILL.md
sha: 56829250c1fdce1ad72456d5421e1f1e5142373f
status: active
mechanism: mine transcripts in parallel for recurring working preferences, confirm with structured questions, and author a personal -mode skill
human_in_loop: true
subject: skill
cost: high
landmines: ["globs .cursor/skills and ~/.cursor/skills paths", "reads agent-transcripts directories", "hands off to Cursor built-in create-skill", "AskQuestion tool name is Cursor-specific"]
concepts: [skill-authoring, learning-capture]
---

Turns the user's working conventions into a personal `-mode` skill. Mines recent transcripts with parallel subagents over time slices, then confirms with structured multi-choice questions, then authors.

The evidence discipline is the part worth stealing. **Cross-check across slices before elevating a signal**: patterns seen in two or more slices are high-confidence, lone signals are weak and usually dropped. Reinforced by the guardrail 'don't overfit to one conversation - a preference stated once and contradicted another time is noise'. The reason for the structured-question step is stated plainly: mining misses intent that has not come up yet, and multi-choice lowers cognitive load and raises hit rate versus asking someone to type from scratch. Two structured rounds plus one open question, explicitly not twenty questions.

Also good: mode skills default to explicit invocation only, on the reasoning that they are heavy and opinionated so they should not auto-trigger on description matching. And the guardrails 'don't be clever' (inventing metaphors or writing poetic prose for an agent reader is cost without benefit) and 'reference, don't inline' (other skills appear as path references, never pasted excerpts).
