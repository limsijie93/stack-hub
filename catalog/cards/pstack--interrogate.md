---
id: pstack/interrogate
src: raw_source/pstack/interrogate/SKILL.md
sha: 11fb2fbe44ab3fb531bc35cc6a4e7d06c8472264
status: active
mechanism: spawn one reviewer per configured model over the same diff and rubric, then synthesise a lead verdict in four categories
human_in_loop: false
subject: diff
cost: high
landmines: ["reads ~/.cursor/rules/pstack-models.mdc", "hardcoded cross-vendor model slugs", "subagent_type: generalPurpose and readonly flags", "references/ sidecar prompts (reviewer-prompt, rubric, code-quality-review, lead-judgment)"]
concepts: [fan-out-review, code-review]
---

One reviewer per configured model, same prompt and rubric to each. The stated premise is that adversarial signal comes from **model diversity, not assigned personas** - models differ in blind spots, priors and reasoning patterns, so agreement across models is high-confidence signal and lone-model findings are worth reading but weighted lower.

The structure worth stealing: state the intent explicitly before spawning, because reviewers challenge whether the work achieves the intent rather than whether the intent is right. Then lead judgment - you are a pragmatic senior engineer, not a neutral aggregator, and you have context the reviewers lack, so sort every finding into **act on / consider / noted / dismissed** with the model(s) that raised it and a one-line rationale. Dismissed findings are *shown*, so the user can override your filtering. The closing **agreement map** asks what the pattern of agreement and disagreement itself tells you, which is a better question than a bare finding list. Note that the model-diversity premise weakens wherever only one vendor's family is available.
