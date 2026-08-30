---
id: mattpocock/engineering/prototype
src: raw_source/mattpocock/engineering/prototype/SKILL.md
sha: a0044501fe0d385b4d8575b610188ede9b236ccf
status: active
mechanism: branch on which question the prototype answers, then build deliberately throwaway code shaped to that question
human_in_loop: true
subject: idea
cost: medium
landmines: ["sidecar references LOGIC.md and UI.md", "assumes a project task runner and routing conventions"]
concepts: [prototyping]
---

A prototype is throwaway code that answers a question, and *the question decides the shape*. Two branches: 'does this logic or state model feel right' produces a single shareable HTML file a non-developer can drive through hard-to-reason-about cases; 'what should this look like' produces several radically different UI variants on one route, switchable by URL param. Getting the branch wrong wastes the whole prototype.

The rules are the transferable part: throwaway from day one and named so a casual reader can tell, trivial to run from one command, no persistence because persistence is what the prototype is checking rather than something it should depend on, no tests or error handling or abstractions, and surface the full relevant state after every action so the user can see what changed. Best of all is the capture step: fold the validated decision into real code, then commit the prototype itself to a throwaway branch as a primary source and record the verdict *and the question it settled*. Main keeps only the decision.
