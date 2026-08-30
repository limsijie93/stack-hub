---
id: mattpocock/engineering/to-tickets
src: raw_source/mattpocock/engineering/to-tickets/SKILL.md
sha: e868c831fcfb1e124e010bcdf84a429ec879160f
status: active
mechanism: break work into vertical tracer-bullet slices with explicit blocking edges, quiz the user on granularity, publish in dependency order
human_in_loop: true
subject: plan
cost: low
landmines: ["requires tracker config from the setup skill", "hardcodes .scratch/ paths and a ready-for-agent label"]
concepts: [work-decomposition]
---

Breaks a plan or spec into tickets that are vertical tracer bullets - each cutting a narrow but complete path through every layer, demoable on its own, sized to fit a single fresh context window - each declaring which tickets block it.

The genuinely valuable part is the named exception. A **wide refactor** is one mechanical change (rename a column, retype a shared symbol) whose blast radius fans across the codebase so that a single edit breaks thousands of call sites and no vertical slice can land green. Rather than forcing it into a tracer bullet, sequence it as expand-contract: add the new form beside the old so nothing breaks; migrate call sites in batches sized by blast radius, each its own ticket blocked by the expand, CI staying green because the old form still exists; then delete the old form in a ticket blocked by every batch. And when even the batches cannot stay green alone, keep the sequence but give them a shared integration branch that all block a final integrate-and-verify ticket, so green is promised only there. That is the most precise treatment of 'when vertical slicing does not work' in either stack. The frontier idea reappears here too: work any ticket whose blockers are all done.
