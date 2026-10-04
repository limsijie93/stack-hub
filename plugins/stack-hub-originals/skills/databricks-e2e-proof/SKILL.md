---
name: databricks-e2e-proof
description: >
  Proves a Databricks project lane end-to-end after apply: tiered T0 local tests,
  T1 job + Unity Catalog aggregate smoke (inference, registry, drift), T2 full
  pipeline → sync → inference chain. Use when verifying a Pseudo-dev / True-UAT / Prod
  lane after a CI/CD apply, when claiming a lane is green, or before promoting to
  true-UAT or prod. Does not own GH dispatch or IaC authoring; load
  databricks-lane-deploy for that.
license: MIT
compatibility: >
  Requires a repo-provided e2e runner script (see Runner contract), a Databricks CLI
  profile per workspace, and gh access when correlating apply runs. Complements
  databricks-lane-deploy.
metadata:
  version: "1.0"
---

# Databricks E2E Proof

Mechanical proof layer for a lane-deployed Databricks project. Agents that add features
or model pins must produce **exit-0 evidence** before True-UAT / Prod.

Owns **tier selection → job trigger → poll → UC aggregate assert → evidence**.
For apply, lane go-ahead, and dual-lane IaC, load
[`databricks-lane-deploy`](../databricks-lane-deploy/SKILL.md).

Job-key maps: [`../databricks-lane-deploy/references/PROJECTS.md`](../databricks-lane-deploy/references/PROJECTS.md)
(do not fork). Lane contract: [`../databricks-lane-deploy/references/PHASES.md`](../databricks-lane-deploy/references/PHASES.md).

## Progressive disclosure

| Need | Read |
|------|------|
| Tier matrix + change-impact routing | [references/TIERS.md](references/TIERS.md) |
| SQL / table pass criteria | [references/ASSERTIONS.md](references/ASSERTIONS.md) |
| What counts as proof / waivers | [references/EVIDENCE.md](references/EVIDENCE.md) |

## Proof loop (mandatory)

```text
E2E:
- [ ] Lane confirmed (default Pseudo-dev)
- [ ] Deploy apply succeeded (databricks-lane-deploy) if source/IaC changed
- [ ] Tier chosen per TIERS.md (default T1; T2 before True-UAT / wiring changes)
- [ ] Runner exit 0 (or human waiver in EVIDENCE.md format)
- [ ] Evidence block recorded (RELEASELOG applied notes OK)
- [ ] Asked before True-UAT / Prod (never self-promote)
```

```bash
<e2e_runner> --project <project> --lane pseudo-dev --tier t1
```

Use the UAT CLI profile for Pseudo-dev / True-UAT and the prod profile for `--lane prod`.

## Runner contract

The repo supplies the runner (for example `scripts/<project>_e2e/run_suite.py`). It must:

| Requirement | Detail |
|-------------|--------|
| Flags | `--project <name>`, `--lane pseudo-dev\|true-uat\|prod` (default `pseudo-dev`), `--tier t0\|t1\|t2` (default `t1`) |
| Useful extras | `--dry-run` (resolve jobs, no cloud calls), `--include-ldp`, `--jobs <names…>` (explicit override), `--profile`, `--warehouse-id`, `--poll-seconds`, `--timeout-seconds` |
| Job map | Resolve tier → job names from the project map; add the lane prefix on Pseudo-dev |
| Poll | Wait for each run to reach a terminal state; any non-`SUCCESS` → exit 1 |
| Assert | Run the aggregate checks in ASSERTIONS.md against the lane's catalog |
| Exit code | **0 = proof**. Any failed job, failed assert, or missing prerequisite → non-zero |
| PII / sensitive data | Aggregates only. Never write row-level records to disk or stdout |
| Fail closed | Exit non-zero when a lane is not wired yet (for example no prod IaC file) |
| Self-test | Offline unit tests for tier routing and job-graph contracts |

## Hard rules

- Never declare lane-green without runner exit 0 **or** an explicit human waiver
  (named reason + date) per [EVIDENCE.md](references/EVIDENCE.md).
- Never enter True-UAT / Prod (`--lane true-uat|prod`) without user confirmation.
- Never jump Pseudo-dev → Prod.
- Aggregates only. No row-level `SELECT *` to disk.
- A project with no prod IaC yet **fails closed** on `--lane prod`.
- Do not duplicate job maps here. Link the lane-deploy PROJECTS.md.
