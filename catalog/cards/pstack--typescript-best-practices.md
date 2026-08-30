---
id: pstack/typescript-best-practices
src: raw_source/pstack/typescript-best-practices/SKILL.md
sha: 9c4e3cb6236433ca480dcf246a11bca529794e88
status: active
mechanism: a sixteen-row rule table grounding type-system discipline in concrete TypeScript syntax
human_in_loop: false
subject: codebase
cost: low
landmines: ["sidecar references references/patterns.md", "defers to two pstack principle-* skills by name"]
concepts: [language-standards, type-discipline]
---

Sixteen rules as a table, each a summary line: discriminated unions over optional-field bags, branded primitives validated once at creation, `unknown` over `any`, no `as` casts, exhaustiveness via an inline `never` assignment, `satisfies` over `as`, schema-derived types before new interfaces.

Three rules carry ideas beyond TypeScript. **Constructive modeling** - build the shape so the illegal value cannot be constructed (`[T, ...T[]]` for non-empty, `start` plus `duration` for a range), explicitly not a runtime guard and not a wish for refinement types. **Simplest total type** - keep the loose type while every operation on it stays total, and strengthen only where the loose type actually forces a `!`, a cast, or a 'should never happen' throw; a rare and valuable rule *against* premature strengthening. And the **narrowing hierarchy** as an explicit preference order ending at `as`, paired with the observation that a lying type guard is worse than a bare cast because the bug hides behind a name that claims safety. The boundary rule - parse where data crosses in, into a named domain type, and trust types inside - is the same idea as the boundary-discipline principle, made concrete.
