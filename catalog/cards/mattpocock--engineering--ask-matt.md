---
id: mattpocock/engineering/ask-matt
src: raw_source/mattpocock/engineering/ask-matt/SKILL.md
sha: ae8eb9b211972d9ae584b41d0f1439c644494fc7
status: active
mechanism: a hand-written map of how the repo's skills compose - one main flow, two on-ramps, vocabulary layers underneath, and standalone leaves
human_in_loop: false
subject: skill
cost: low
landmines: ["names ~20 upstream skills by slash command", "sidecar references PHASE-BOUNDARIES.md", "links to an external glossary site"]
concepts: [routing, playbook]
---

A router over a whole skill collection, and the closest thing in either stack to a thought-process layer. It classifies every skill by its place in a topology rather than by category: one **main flow** (idea to ship: grill, optionally detour through a prototype, then spec, tickets, implement, review), two **on-ramps** that generate work and merge onto it (triage for incoming issues, diagnosing-bugs for breakage), a **codebase health** loop, a **vocabulary layer** running underneath, and **standalone** leaves off the flow entirely.

Three ideas are worth stealing wholesale. **Context hygiene as part of the route**: keep grilling, spec and tickets in one unbroken window so they build on the same thinking, then start each implementation fresh from its ticket. **The smart zone** - the roughly 150K-token window within which the model still reasons sharply - used as the trigger to compact at a phase boundary rather than pushing on degraded. And the **phase-boundary decision** itself: at the seam between two chunks of work you have five options (continue, clear, handoff, subagent, compact), continue is ruled out first, and compact is the default sitting at the *bottom* of the tree rather than the first reach. This card is the template for what a playbook layer should look like.
