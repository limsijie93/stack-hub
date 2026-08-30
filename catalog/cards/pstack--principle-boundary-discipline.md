---
id: pstack/principle-boundary-discipline
src: raw_source/pstack/principle-boundary-discipline/SKILL.md
sha: 84d526ce7ea45d207587e80015912d5a01714e21
status: active
mechanism: validate, narrow and handle errors only at system boundaries; trust types unconditionally inside
human_in_loop: false
subject: codebase
cost: low
landmines: []
concepts: [principle, type-discipline]
---

Validation, type narrowing and error handling live at boundaries - CLI args, config files, external APIs, network protocols. Inside the system: typed data, error propagation, no re-validation. The rationale is that scattered validation is noisy, redundant, and gives a *false sense of safety*, which is the part worth keeping - the harm is not just duplication but misplaced confidence.

Two rules generalise beyond validation. **Across the boundary, expose domain concepts, not the boundary's private representation** - do not re-export transport, storage, framework or wire types through the public surface. And **keep general-purpose mechanism inside, special-purpose policy at the edge**. Business logic in pure functions with no framework dependencies, so it can be tested without the framework. Pairs directly with type-system-discipline, which says where to parse; this says where to trust.
