---
id: pstack/blast-radius
src: raw_source/pstack/blast-radius/SKILL.md
sha: 4b24c77e102955af19ae60aa10af642f69eaa8ba
status: active
mechanism: find the single fact a change is safe because of, then prove it by running real code rather than writing up an argument
human_in_loop: false
subject: diff
cost: medium
landmines: ["invokes /how, /why, /arena, /unslop by slash name", "assumes a base branch named main"]
concepts: [code-review, evidence-discipline]
---

Finds what a change breaks somewhere else, beyond the diff. Explicitly not a caller list - grep already does that - but the breakage grep will not show: wire formats, DB columns, feature flags, another language reading the same bytes, code three hops downstream.

Two excellent ideas. First, the five-rung evidence ladder: (1) you said so, worthless; (2) you pointed at a real file:line; (3) you showed the bad case cannot happen; (4) you ran real code that fails loud if you are wrong; (5) you reproduced it in the running app. You must say which rung each safety claim reached, and anything below rung 4 is declared unproven rather than quietly written up as settled. Second, 'find the one fact it is safe because of' - most scary-looking changes are safe for a single reason, and establishing that one fact kills most of the risk list at once, which is a far better use of effort than enumerating maybes. The framing that a plausible-sounding writeup 'reads as convincing whether or not it is true' is the sharpest sentence in either stack.
