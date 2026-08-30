---
id: pstack/principle-encode-lessons-in-structure
src: raw_source/pstack/principle-encode-lessons-in-structure/SKILL.md
sha: 86a22f21146d358fc18afb2a0186da61470c3241
status: active
mechanism: turn a recurring instruction into a mechanism that enforces it without cooperation
human_in_loop: false
subject: skill
cost: low
landmines: []
concepts: [principle, guardrails, learning-capture]
---

When you catch yourself writing the same instruction a second time, ask whether it can be a lint rule, metadata flag, runtime check or script. If yes, encode it **and delete the instruction**. If it genuinely requires judgement, make the instruction more prominent and add an example of the failure mode.

**Pick the strongest rung.** An explicit ladder: an unrepresentable state that cannot compile, then a lint or banned API that fails CI, then a canonical helper, then a runtime check. The reasoning is specific to agents - they copy whatever the surrounding code already does, so a weaker guard becomes the next template.

The corollary is the sharpest part: **the instruction IS the symptom.** If the fix is structural, use only the structural fix; keeping the prose alongside is papering over. The feedback loop closes it - capture every human correction, decide one-off versus pattern, route one-offs to notes, recurring fixes to a skill or lint rule, systemic issues to a principle, and apply now rather than merely recording.
