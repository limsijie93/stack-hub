---
id: pstack/show-me-your-work
src: raw_source/pstack/show-me-your-work/SKILL.md
sha: 8a9c731acf5bb7ad789e10ec7c5af6970dce1176
status: active
mechanism: append-only TSV decision log, one row per decision, audited against the transcript and cross-reviewed by a different model family before handing back
human_in_loop: false
subject: session
cost: medium
landmines: ["ships references/decision-log-template.tsv and scripts/log.sh, neither vendored by the current prune rules", "reads ~/.cursor agent-transcripts paths", "requires a different model family for the reviewer"]
concepts: [audit-trail, evidence-discipline]
---

A decision trail so a human can reconstruct what was decided, why, and on what evidence without rerunning the work or reading the transcript. One TSV file, one row per decision, columns ts / phase / decision / why / evidence / result. TSV specifically because GitHub renders it as a sortable table, `column -t` and spreadsheets read it, and a row appends with one command.

The rules are tight and general. **One row is one decision, and if it does not fit on one line the decision is not crisp yet.** **Append-only** - a wrong call gets a superseding row, history is never edited. **Evidence is a pointer, not prose**: a commit SHA, a PR number, a file:line, an artifact path. Log decision points and checkpoints, not every action. Local by default and committed only when the work is ambitious enough that a reviewer needs the trail to trust the result.

Two closing moves lift it well above a logging convention. **Audit the log against the transcript** before handing back: every row must map to a real action, each row's evidence must resolve and show what it claims, an unlogged fork or pivot that shaped the work is a gap to add, and padding gets cut - 'fix the log, not the story'. Then **cross-model review of the trail** by a subagent from a different model family, on the stated grounds that self-review cannot bring fresh eyes, flagging weak evidence, skipped verification, and risky-in-hindsight choices. Every reply ends with an Attention section naming the reviewing model, where 'no flags' is a valid value but omitting the model name is not. Also notable: the helper script quotes cells beginning with =, +, - or @ so opening the log in a spreadsheet cannot execute a formula - a real security detail almost no skill bothers with. Its scripts and template are not vendored, since the prune rules keep markdown only.
