---
id: mattpocock/engineering/wizard
src: raw_source/mattpocock/engineering/wizard/SKILL.md
sha: c4294ad8298b9b95fc727496b1b802b1f7363fba
status: active
mechanism: generate a bash script that walks a human through steps only they can do, capturing values and writing them where they belong
human_in_loop: true
subject: codebase
cost: medium
landmines: ["ships template.sh, a .sh sidecar not vendored by the current prune rules", "assumes gh CLI for secrets and vars"]
concepts: [human-in-the-loop-automation]
---

For procedures only a human can perform - clicking through a third-party dashboard, provisioning credentials, a one-off cutover. Generates a bash script that opens each URL, says exactly what to click and copy, captures values, writes them to .env or CI secrets, confirms at every stage and shows how many remain.

The strong idea is the split between library and stages: the UX is solved once in a template - progress, confirmation gates, cross-platform URL opening, hidden secret entry, idempotent .env upserts, closing summary - and is identical in every wizard and never hand-edited. Authoring is only scoping the procedure and writing its stages. Also good: read the repo before asking cold (.env.example, docker-compose, and every secrets.* reference in CI workflows is a value the wizard must produce); never invent UI steps you are not sure of, ask or check docs instead; and verify statically rather than running it, since running it opens browsers and blocks on human input. Wizards are ephemeral by default and committed only when the setup path should be repeatable. Note this skill's template.sh is not vendored, since the prune rules keep markdown only.
