---
id: mattpocock/engineering/research
src: raw_source/mattpocock/engineering/research/SKILL.md
sha: fecee97e9457ba039678d2fcf1b1bc9fca78307d
status: active
mechanism: delegate investigation to a background agent that works only from primary sources and writes a cited markdown file
human_in_loop: false
subject: idea
cost: medium
landmines: ["assumes a background-agent capability"]
concepts: [research]
---

Three steps and under a hundred words: spin up a background agent so you keep working while it reads, have it investigate against primary sources - official docs, source code, specs, first-party APIs, never a secondary write-up - following every claim back to the source that owns it, and write the findings to one markdown file with each claim cited.

Two ideas worth stealing despite the size. Primary-source-only as a hard constraint rather than a preference, with the explicit instruction to follow claims back to whoever owns them. And 'save it where the repo already keeps such notes; match the existing convention, and if there is none, put it somewhere sensible and say where' - a neat general pattern for output placement that avoids both inventing structure and blocking on a question.
