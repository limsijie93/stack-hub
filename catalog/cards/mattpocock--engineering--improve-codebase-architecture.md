---
id: mattpocock/engineering/improve-codebase-architecture
src: raw_source/mattpocock/engineering/improve-codebase-architecture/SKILL.md
sha: a578dd0a34ad0a8886abe7e7642b100106ba86d6
status: active
mechanism: scan for shallow modules weighted by git hot spots, present candidates as a visual HTML report, then grill through the chosen one
human_in_loop: true
subject: codebase
cost: high
landmines: ["sidecar references HTML-REPORT.md", "Tailwind and Mermaid via CDN", "invokes codebase-design, grilling and domain-modeling by skill name", "assumes CONTEXT.md and docs/adr"]
concepts: [architecture-review, design-vocabulary]
---

Finds shallow modules worth deepening, presents them visually, then hands off to an interview. Three ideas stand out.

**Scope before you scan.** Deepening pays off only on code that will change again, so walk the commit history to find hot spots and let those paths pull attention first; widen the net only if changes are scattered. Explicit YAGNI applied to refactoring targets.

**The deletion test as the filter.** For anything suspected shallow, ask whether deleting it would concentrate complexity or merely move it. 'Concentrates' is the signal.

**Report, then ask, then grill.** Candidates are rendered as before/after visualisations with a recommendation strength badge (Strong / Worth exploring / Speculative), written to the OS temp dir so nothing lands in the repo, and the skill explicitly refuses to propose interfaces until the user picks one. The ADR handling is also careful: surface a candidate that contradicts an existing ADR only when the friction is real enough to warrant reopening it, and mark it as such - rather than listing every refactor an ADR forbids.
