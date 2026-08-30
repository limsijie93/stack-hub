---
id: pstack/technical-writing
src: raw_source/pstack/technical-writing/SKILL.md
sha: d13baf98426a72764f94d18ab45d1549151a6c38
status: active
mechanism: four stacked standards - Diataxis mode, Google developer style, STE instruction rules, Global English syntax - applied together
human_in_loop: false
subject: document
cost: low
landmines: ["cites unslop by skill name"]
concepts: [writing-quality, teaching]
---

A layered writing standard, each layer answering one question: what kind of document is this, how do sentences address the reader, how much does each sentence carry, and can any sentence be read two ways.

**Pick the mode first.** Diataxis on two axes - does the content inform action or understanding, and does it serve learning or work - giving tutorial, how-to, reference, explanation. Each gets real constraints: a tutorial's every step produces a visible result and the learner's success is *your* job; a how-to solves a problem a person has rather than an operation the machine can perform, and assumes competence; reference only describes, dry and complete with no hedging, mirroring the structure of the thing described; explanation is the one mode where opinion is allowed. Don't mix modes - split and link instead.

The sentence rules are concrete and quotable: put the condition before the instruction so the reader can skip what does not apply, put the common case first, never write 'simply' or 'easy' in a procedure because if it were simple the reader would not be here, link with words that say where the link goes, headings carry the point rather than the topic.

Two meta-rules lift it above a style guide. **When a rule makes a sentence worse, fix the sentence another way or leave it alone** - a sentence that follows every rule and sounds machine-written has failed. And **the codebase is the word list**: write the real symbol, file, flag or command name, never a synonym or a description of it. It also closes the loop with unslop by instructing you to add new jargon offenders to that skill's list with their replacement.
