---
id: mattpocock/engineering/to-spec
src: raw_source/mattpocock/engineering/to-spec/SKILL.md
sha: 3f52599ae2a4347aee5a07432c2707518e691a7f
status: active
mechanism: synthesise a spec from conversation already had, with no interview, and publish it to the tracker
human_in_loop: true
subject: idea
cost: low
landmines: ["requires the tracker and triage-label vocabulary from the setup skill", "hardcodes a ready-for-agent label"]
concepts: [spec-writing]
---

Turns the current conversation into a published spec. The defining constraint is in the first line: do NOT interview the user, just synthesise what you already know. It is deliberately the non-interviewing counterpart to a grilling session - the interview already happened, this is the write-up.

Worth stealing: the seam-sketching step happens *inside* spec writing rather than at implementation time, with an explicit preference for existing seams over new ones, the highest seam possible, and the statement that the ideal number of seams is one. The template's rule against file paths and code snippets because they go stale, with a single carefully-drawn exception - a prototype-produced snippet that encodes a decision more precisely than prose can (a state machine, reducer, schema or type shape), trimmed to the decision-rich parts - is a good general rule for any durable document.
