---
name: grilling
description: Interview the user in rounds to sharpen a plan, design or decision before anything is built. Use for "grill me", "grill this", "stress-test my thinking", "challenge this plan", "what am I missing", "poke holes in this", or before committing to a design with open questions. Puts decisions to the user and looks facts up itself.
maturity: lab
supersedes:
  - mattpocock-skills:grilling
  - mattpocock-skills:grill-me
  - mattpocock-skills:grill-with-docs
upstream:
  - src: mattpocock/productivity/grilling@8ca78c6d8f901aab0c5a1f896034b70e666ff2a3
    took: the design tree and the frontier rule, the fact/decision split, a recommended answer with every question, done when the frontier is empty
    changed: description rewritten around triggering moments; the subagent instruction made conditional rather than assumed, so the skill degrades to inline lookup instead of failing; added an explicit "when this does not apply" section; stated the recommendation rule as a hard requirement since it is what makes rounds answerable
    rejected: nothing material
---

# Grilling

Interview the user until you reach a shared understanding. Model the work as a **design
tree**: every decision branches into the decisions that hang off it.

## Rounds and the frontier

The **frontier** is every decision whose prerequisites are already settled — the questions
answerable *now*, without guessing at answers you have not heard yet.

Ask the whole frontier in one round. Number each question and **give your recommended answer
for every one**. Then wait.

```
Q1 - <title>: <question, possibly with options>
   -> recommended: <your answer, and why>

Q2 - <title>: <question>
   -> recommended: <your answer, and why>
```

The recommendation is not optional. A question without one makes the user do the work twice —
first working out what you are asking, then what the options even are.

Each round of answers reshapes the tree: settled decisions push the frontier outward and
unblock what depended on them. Recompute and ask the next round. **A question whose answer
depends on another question still open in this round belongs to a later round**, not this one.
That rule is the whole scheduling discipline — it stops the interview asking things it cannot
yet interpret.

Done when the frontier is empty: every branch visited, nothing silently assumed.

## Facts are your job, decisions are theirs

When a frontier question needs a fact from the environment — a file, a version, a config, what
an API actually returns — **find it yourself**. Never ask the user for anything you could look
up.

If a subagent or background task facility is available, dispatch the lookup and do not block
on it: a running exploration is an unsettled prerequisite, so only the questions downstream of
it wait. Ask the rest of the frontier now. If no such facility exists, look it up inline
before the round — slower, same rule.

The *decisions* are the user's. Put each to them and wait.

## When this does not apply

- **The decision is reversible and cheap.** Make it, say you made it, move on. Grilling a
  two-line change costs more than being wrong about it.
- **There is only one viable option.** Then it is not a decision, and presenting it as one is
  theatre.
- **The user has already decided.** Reaffirmation is not a frontier. Note the risk once if you
  genuinely see one, then build.
- **The work is exploratory.** If the point is to find out what the shape is, prototype and
  learn rather than interviewing about unknowns neither of you can resolve yet.

Do not act on the outcome until the user confirms you have reached a shared understanding.
