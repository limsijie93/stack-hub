---
id: pstack/reflect
src: raw_source/pstack/reflect/SKILL.md
sha: a0e50f7eeb993559744a7a8b44b7c4f8a432d92d
status: active
mechanism: spawn three parallel reviewers on different models over the session transcript, synthesise with a fourth, route accepted findings to concrete skill edits after approval
human_in_loop: true
subject: session
cost: high
landmines: ["reads ~/.cursor/projects and agent-transcripts paths", "hardcoded model slugs (claude-fable-5-thinking-max, gpt-5.6-sol-max)", "subagent_type: generalPurpose", "references/ prompt templates", "hands off to Cursor built-in create-skill"]
concepts: [fan-out-review, learning-capture]
---

Mines the active transcript for durable learnings using three reviewers with different lenses (judgment, tooling, divergent) on different models, then a synthesiser that returns Accepted / Rejected / Backlog. Accepted items are routed to specific edits on existing skills, and nothing is applied without explicit user approval.

Two ideas are worth stealing. First, the structural enforcement check: any finding that would be enforced more reliably by a lint rule, script or runtime check is moved out of the skill-edit list and into the backlog, because a rule that can be mechanised should not become prose an agent has to remember. Second, routing by edit size - trivial edits applied directly, substantive ones handed to a skill-authoring loop, and 'the skill exists but did not trigger' treated as a description-tuning problem rather than a content problem. That last category is a genuinely sharp diagnosis.
