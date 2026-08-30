---
id: mattpocock/productivity/grilling
src: raw_source/mattpocock/productivity/grilling/SKILL.md
sha: 8ca78c6d8f901aab0c5a1f896034b70e666ff2a3
status: active
mechanism: interview the user in rounds over a design tree, asking the whole unblocked frontier each round with a recommended answer per question
human_in_loop: true
subject: plan
cost: low
landmines: ["dispatches sub-agents to find facts; assumes a subagent tool exists"]
concepts: [structured-interrogation]
---

Models the design as a tree of decisions. Each round it computes the *frontier* - every decision whose prerequisites are already settled - and asks that entire set at once, numbered, each with a recommended answer. The user's answers push the frontier outward and unblock the next round. Done when the frontier is empty.

The two ideas worth stealing are the frontier rule and the fact/decision split. The frontier rule is a real scheduling discipline: a question whose answer depends on another still-open question belongs to a later round, which stops the interview from asking things it cannot yet interpret. The fact/decision split says finding facts is never the user's job - look them up, or dispatch a subagent, and only put genuine decisions to the human. Note this skill changed materially upstream: earlier versions asked strictly one question at a time. The round-based frontier is the current shape and is a better fit for anything with real branching.
