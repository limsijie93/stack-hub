---
id: pstack/why
src: raw_source/pstack/why/SKILL.md
sha: c34bc86b6aec4e48dafa19c4f4d25f5989e9689d
status: active
mechanism: discover available MCPs, map them to seven evidence categories, query all in parallel, synthesise with explicit confidence calibration and null results reported as findings
human_in_loop: false
subject: codebase
cost: high
landmines: ["enumerates MCPs from the Cursor environment and an mcps/ directory", "hardcoded model slugs and readonly/agent-mode semantics", "subagent_type: generalPurpose", "seven references/sources/*.md playbooks plus epistemics.md"]
concepts: [research, evidence-discipline, codebase-explanation]
---

The most substantial skill in either stack. Answers why code is shaped as it is, on the premise that historical context spreads across seven evidence categories - source control, issue tracker, long-form docs, team chat, infrastructure observability, error tracking, product analytics - and you cannot tell from the question which one holds the answer. So it enumerates available tools at run time, maps each to a category, and queries all of them in parallel. The default is coverage, not minimalism.

The epistemics are the real contribution. **Null results are first-class evidence**: a null from the issue tracker is evidence the decision was never ticketed, so document the null rather than skipping the search. **Skipping an investigator requires written justification** in the output, and only two reasons qualify - no tool available (a gap, not a choice) or provably irrelevant, where 'probably irrelevant' explicitly does not clear the bar. **Hedge on purpose**, with confidence-matching phrasing declared a feature of the output rather than a style the synthesiser may override, and the presenting step forbidden from rewriting the hedges to sound authoritative because that is the exact failure the skill exists to prevent. **No shortcut by code-reading** - code tells you what it does, rarely why it exists, and 'handles the null case because it checks for null' is mechanics, not motivation.

The output separates *what we found* (each bullet citing a commit, PR, ticket, doc URL or chat permalink), *what we can reasonably infer* (each explaining its inference chain), *competing hypotheses* with evidence for and against and no forced winner, *what we don't know*, and a **Sources Consulted** coverage map listing every category including the ones that came back empty and why any were skipped. The named failure modes - confident storytelling, recency bias, sycophantic agreement with a reason the user suggested, skipping investigators by anticipation - are worth lifting wholesale into any research skill.
