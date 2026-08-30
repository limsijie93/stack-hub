---
id: mattpocock/engineering/triage
src: raw_source/mattpocock/engineering/triage/SKILL.md
sha: 37ddea1e3dcf8fb5be5b92e4e45f2c34b8e61d3e
status: active
mechanism: move incoming issues and external PRs through a small state machine of category and state roles, verifying claims before specifying work
human_in_loop: true
subject: plan
cost: medium
landmines: ["requires tracker and label-mapping config from the setup skill", "sidecar references AGENT-BRIEF.md and OUT-OF-SCOPE.md", "hardcodes .out-of-scope/ knowledge base and an AI disclaimer string"]
concepts: [triage, work-decomposition]
---

A state machine for request intake: two category roles (bug, enhancement) and five state roles (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix), with every triaged item carrying exactly one of each and conflicts escalated to the maintainer rather than guessed.

Several ideas transfer well. **A PR is an issue with attached code** - same roles, same states, same machine, with small deltas, which avoids a duplicate parallel workflow. **Verify before you grill**: reproduce the bug or check out the diff and run it *before* any interview, because a confirmed verification makes a far stronger brief and a failed one is a strong needs-info signal. **Two checks against the codebase before recommending**: search for an existing implementation by domain concept rather than by the request's wording, and read a persisted knowledge base of previously rejected requests - so the same enhancement is not re-litigated every time it is asked for. That rejected-request KB, written only for genuine rejections and never for already-implemented ones, is the sharpest piece here. Also good: the needs-info template captures what has been *established* so far alongside what is still needed, so grilling work is not lost when the thread goes cold, and questions must be specific rather than 'please provide more info'.
