---
id: pstack/principle-migrate-callers-then-delete-legacy-apis
src: raw_source/pstack/principle-migrate-callers-then-delete-legacy-apis/SKILL.md
sha: a0c6e65e1eaf58278fa6bac1a01c23f998759f5c
status: active
mechanism: migrate every caller and delete the old API in the same wave rather than keeping a compatibility layer
human_in_loop: false
subject: codebase
cost: low
landmines: []
concepts: [principle]
---

Do not keep legacy paths alive only because internal callers still exist. Inventory callers, migrate them, delete the old API immediately. Treat temporary adapters as exceptional and time-boxed, not default architecture. Update tests to assert the new contract, and delete tests that only protect pre-refactor implementation details.

The applicability conditions are stated honestly and matter: no external users depend on backward compatibility, the project can absorb coordinated breaking changes, and the new API is part of a simplification. Outside those, the principle does not hold - which is what keeps it from being reckless advice.

The diagnosis is the memorable part: keeping both old and new creates dual-path complexity and **makes the codebase feel append-only**. Note it sits in direct tension with to-tickets' expand-contract sequencing, which deliberately keeps both forms alive across batches; the difference is blast radius, and a semantic layer covering migration should say so.
