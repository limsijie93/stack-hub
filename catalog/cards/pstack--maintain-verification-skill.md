---
id: pstack/maintain-verification-skill
src: raw_source/pstack/maintain-verification-skill/SKILL.md
sha: a2680b91fead45a0b4963d8c367a854956bea59d
status: active
mechanism: periodic upkeep pass - parallel source readers per feature, one live session exercising every feature, at most one PR of proven corrections
human_in_loop: false
subject: codebase
cost: high
landmines: ["globs .cursor/skills/verify-*/", "assumes the create-verification-skill output shape"]
concepts: [verification, maintenance]
---

The upkeep loop for a verification skill, on the premise that a feature map rots the moment the app changes. The unit of rigor is stated explicitly as the feature, not every sentence.

Three ideas transfer widely. **A named outcome from a closed set** - clean, changed, or blocked - which must be declared, with blocked requiring you to say exactly what blocked it. **A hard edit scope**: only the verification skill's own directory, never product code, because behaviour the map describes that the app no longer does is either doc drift (fix the map) or a product regression (report it, never paper over it in docs). That single distinction prevents the most common failure of self-maintaining documentation.

The live-pass invariants are excellent: never drive an instance you have not health-checked since it last did something surprising, and where the health check cannot see the failure - a wedged UI on a healthy process - reset or relaunch rather than hoping; evidence captured so far survives every cleanup, checked at its named location rather than assumed; and nothing a drive started outlives that drive's usefulness, with failed-iteration residue cleaned whether the session is stuck, exited or shared. Also careful: a feature that cannot be reached is marked unreachable only with the concrete prerequisite and the route attempted, and if the map omitted that prerequisite, that omission is itself drift.
