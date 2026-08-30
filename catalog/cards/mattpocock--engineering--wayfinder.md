---
id: mattpocock/engineering/wayfinder
src: raw_source/mattpocock/engineering/wayfinder/SKILL.md
sha: 812805b760baf328db0ebdef6f3807e381f97016
status: active
mechanism: chart a shared map of decision tickets on the issue tracker and resolve them one per session until the route is clear
human_in_loop: true
subject: plan
cost: high
landmines: ["requires tracker config from the setup skill", "hardcodes wayfinder:map and wayfinder:<type> labels", "depends on native tracker blocking relationships and assignment"]
concepts: [work-decomposition, planning]
---

For an effort too big to hold in one session, where the way to the destination is not visible yet. Charts a map of **decision tickets** - questions whose resolution is a decision, not slices of a build - and works them one per session.

The distinctions are unusually sharp. **Plan, don't do**: produce decisions, not deliverables, and the pull to just do the work is the signal you have reached the edge of the map. **Fog of war**: deliberately do not chart what you cannot see; the test for ticket-versus-fog is whether you can state the question precisely now, *not* whether you can answer it now. **Out of scope is not fog**: fog gathers only toward the destination, so work past it gets its own section and never graduates. **The map is an index, not a store** - a decision lives in exactly one place, its ticket, and the map only gists and links. **HITL versus AFK** per ticket type, with the explicit rule that an agent never stands in for the human's side of a human-in-the-loop ticket (a grilling agent that answers its own questions has broken this). Also: refer to tickets by name, never bare ids, because a wall of #42, #43, #44 is illegible.
