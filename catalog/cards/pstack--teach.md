---
id: pstack/teach
src: raw_source/pstack/teach/SKILL.md
sha: beea0ffaa916e8fcf93f2bf13c632f2a9259d1e2
status: active
mechanism: run the how and why skills in parallel and weave their findings into one plain conversational explanation, built up diagram by diagram
human_in_loop: true
subject: codebase
cost: high
landmines: ["invokes how, why and unslop by skill name", "assumes an image-generation tool"]
concepts: [teaching, codebase-explanation]
---

Explains a body of work so a person actually understands it, composing `how` (mechanism) and `why` (rationale) rather than redoing their investigation. Notably it preserves `why`'s confidence language verbatim on the grounds that its hedges are findings, not style - a good rule for any skill that consumes another's output.

The teaching craft is the transferable part. **Build the picture up diagram by diagram**: for anything with three or more moving parts, never draw one diagram containing all of them; draw a short series where each redraws the last and adds exactly one part, so the reader watches the system assemble. A single all-at-once diagram, especially saved for the end, is reference rather than teaching. **Match medium to idea** - a flow diagram where labels carry the meaning, a drawn image where the idea is spatial. **Give the smallest complete answer first**, a sentence or two, then stop and add layers when asked.

Its anti-pattern list is unusually specific and worth stealing whole: no pacing theater, no printing 'Pause', no asking the reader to say it back, no flagging a part as important or tricky ('here is where it gets interesting'), no framing labels like 'the key insight' or 'at its core'. Just say the thing. Plus: give each concept one name and keep it, because cycling synonyms makes the reader re-derive that they are the same thing.
