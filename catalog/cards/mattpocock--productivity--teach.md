---
id: mattpocock/productivity/teach
src: raw_source/mattpocock/productivity/teach/SKILL.md
sha: c679eeccd48ca720c8196e5d9a9e58223abf213b
status: active
mechanism: treat the working directory as a stateful teaching workspace and produce short beautiful HTML lessons pitched at the zone of proximal development
human_in_loop: true
subject: idea
cost: medium
landmines: ["sidecar references MISSION-FORMAT.md, RESOURCES-FORMAT.md, LEARNING-RECORD-FORMAT.md", "assumes it may open files via a CLI command"]
concepts: [teaching]
---

Teaching as a stateful, multi-session workspace: MISSION.md for why the user cares, RESOURCES.md for trusted sources, learning-records/ as the equivalent of ADRs for what has been learned, lessons/ as self-contained HTML, reference/ as the compressed durable essence, assets/ for shared components.

The learning theory is the transferable part. **Fluency versus storage strength**: in-the-moment retrieval gives an illusory sense of mastery, long-term retention is the real goal, so design for desirable difficulty through retrieval practice, spacing and interleaving. **Difficulty is the enemy for knowledge, the tool for skills** - it eats working memory you need for understanding, but effortful retrieval is what makes things stick. **Zone of proximal development** computed from the learning records. And a sharp practical detail: quiz answers should be exactly the same number of words and characters so formatting leaks no clues. The lessons-versus-reference split is also good - lessons are rarely revisited, reference documents are, so the compression happens deliberately.
