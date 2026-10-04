---
name: databricks-lane-deploy
description: >
  Deploys and promotes a Databricks project through three gated lanes: Pseudo-dev
  (prefixed jobs, dev catalog, in the UAT workspace), True-UAT (unprefixed jobs, deployed
  UAT catalog), and Prod (PR → merge → prod apply). Use when deploying, smoke-testing,
  promoting, or applying Terraform/CI job definitions for a project with dev/UAT/prod lanes;
  when the user mentions a dev__ prefix, dual-lane UAT, deployed=false/true, a non-prod
  apply workflow, or post-change UAT/prod rollout.
license: MIT
compatibility: Requires gh CLI auth to the repo and access to the Databricks UAT and Prod workspaces. Assumes jobs are defined as IaC (for example tfvars) and applied by GitHub Actions workflows.
metadata:
  version: "2.0"
---

# Databricks Lane Deploy

Procedural skill for rolling out a change under a **dual-lane UAT + prod** contract.

Owns **lane gates + dispatch + smoke**. For job/pipeline IaC authoring, load
`databricks-cicd`. For mechanical lane proof, load
[`databricks-e2e-proof`](../databricks-e2e-proof/SKILL.md).

## Lane model (read first)

One UAT workspace hosts **two permanent job sets**. One UAT apply deploys **both**.
Do **not** flip true-UAT jobs to `deployed=false` to experiment. Use the Pseudo-dev lane.

Fill in this table for your repo. The example values show one common shape.

| Lane | Default? | Workspace | Job prefix | `deployed` | Catalog | Config dir | Apply via |
|------|----------|-----------|------------|------------|---------|------------|-----------|
| **1 — Pseudo-dev** | **Yes** | UAT | `<dev_prefix>` (e.g. `dev__`) | `false` | `<dev_catalog>` (e.g. `projects_uat`) | `<config>/dev/…` | `<non_prod_apply_workflow>` from feature branch |
| **2 — True-UAT** | No (ask) | UAT | *(none)* | `true` | `<uat_catalog>` (e.g. `<deployed_catalog>_uat`) | `<config>/uat/…` | Same UAT apply; smoke unprefixed jobs |
| **3 — Prod** | No (ask) | Prod | *(none)* | `true` | `<prod_project_catalog>` | `<config>/prod/…` | PR → merge → `<prod_apply_workflow>` |

Hard rules:

- Default every new change to **Pseudo-dev**.
- Never enter True-UAT validation or Prod without explicit user confirmation.
- Never jump Pseudo-dev → Prod.
- Never retarget true-UAT jobs by editing their `deployed` flag or catalog to experiment.
- After the first apply or a pipeline rename on a lane, **bootstrap that lane once**
  (pipeline meta tables are per catalog and per pipeline name).
- Do not assume every job follows the lane switch. Check what resolves the catalog
  **at runtime**, not only the YAML: a YAML `catalog:` may be audit-only (the library
  derives it from `env` + `deployed`), or it may really be hardcoded. Before you trust a
  Pseudo-dev smoke, confirm the runtime catalog. List jobs that ignore the lane in PROJECTS.md.
- Do not offer a lane that has no IaC yet (for example no `env-tf/prod/` job file).
  Mark that project/lane as *planned* and fail closed if asked to deploy it.

Config resolution: notebooks map `env` + `deployed` to a config dir. Typical shape:
`env=uat`+`deployed=false` → `dev`; `env=uat`+`deployed=true` → `uat`; `env=prod` → `prod`.

Full contract: [`references/PHASES.md`](references/PHASES.md).
Per-project job keys: [`references/PROJECTS.md`](references/PROJECTS.md).
Command forms: [`references/COMMANDS.md`](references/COMMANDS.md).

## Shared preflight (every lane)

```text
Preflight:
- [ ] Project identified, and the requested lane has IaC (else: planned, stop)
- [ ] Lane confirmed (default Pseudo-dev)
- [ ] Feature branch ≠ main/master (required for UAT dispatch)
- [ ] Local tests green (see COMMANDS.md)
- [ ] Project README + RELEASELOG updated if source or IaC changed; lane noted
```

1. Identify the project folder.
2. Confirm the lane with the user (default = Pseudo-dev).
3. Run local tests from the repo root.
4. If source or IaC changed on this branch, update the project docs. Note the lane.

## Lane 1 — Pseudo-dev (default)

```text
Pseudo-dev:
- [ ] UAT IaC keeps prefixed = deployed=false / <dev_catalog>
      and unprefixed = deployed=true / <uat_catalog> (coexistence)
- [ ] Branch pushed
- [ ] Non-prod apply workflow dispatched (uat, this project)
- [ ] GH apply succeeded (project-filtered run id)
- [ ] Bootstrap prefixed lane once if first apply / rename
- [ ] Smoke: databricks-e2e-proof T1 (or T2 when routing requires) — exit 0
- [ ] Aggregates verified in <dev_catalog>.<schema>
- [ ] Reported; asked before True-UAT smoke
```

1. Confirm dual-lane fields in the UAT IaC file ([PHASES.md](references/PHASES.md)).
2. Push the feature branch.
3. Dispatch the non-prod apply workflow with `environment=uat` ([COMMANDS.md](references/COMMANDS.md)).
4. Poll the **project-correlated** run until success. Fail closed on plan/apply errors.
5. Run **`databricks-e2e-proof`** for Pseudo-dev (`--lane pseudo-dev --tier t1` or `t2`).
   Bootstrap once first if this is the first apply or a rename. UI-only smoke is not lane-green.
6. Verify aggregates only under `<dev_catalog>.<schema>`. No row-level pulls to disk.
7. Report the GH run URL, e2e evidence, and catalog. Ask before True-UAT validation.

## Lane 2 — True-UAT (explicit go-ahead only)

```text
True-UAT:
- [ ] User confirmed ready (Pseudo-dev green)
- [ ] Unprefixed jobs still deployed=true / <uat_catalog>
- [ ] Smoke unprefixed jobs against <uat_catalog>
- [ ] Reported; asked before Prod
```

1. Do **not** change IaC. The same UAT dispatch already applied the true-UAT jobs.
2. Smoke **unprefixed** keys (same roles as Pseudo-dev, without the prefix).
3. Verify aggregates under `<uat_catalog>.<schema>`.
4. Report. Ask before the prod PR.

## Lane 3 — Prod (explicit go-ahead only)

```text
Prod:
- [ ] User confirmed ready (True-UAT green)
- [ ] Prod IaC file is prod shape (one env per PR when only IaC differs)
- [ ] PR to main opened / merged
- [ ] Prod apply confirmed (watch post-merge run)
- [ ] Prod bootstrap once if first apply / rename
- [ ] Prod targets reported under <prod_project_catalog>
```

1. Make sure the prod IaC file matches prod (`env=prod`, `deployed=true`, `<prod_project_catalog>`).
   Keep one environment per PR when only IaC differs.
2. Open PR → merge to `main`. Do **not** `workflow_dispatch` prod from this skill.
3. Confirm the prod apply workflow succeeded after merge. `mergedAt` alone is not proof.
4. Bootstrap once with `env=prod`, `deployed=true` if first apply or rename.
5. Watch the scheduled chain or run an adhoc smoke. Report `<prod_project_catalog>.<schema>` aggregates.

## Smoke defaults

Lane-green needs **mechanical proof** from
[`databricks-e2e-proof`](../databricks-e2e-proof/SKILL.md), not UI-only smoke:

```bash
# Default after Pseudo-dev apply (T1). Use --tier t2 when pipeline/inference wiring
# or job IaC changed, and always before True-UAT promotion.
<e2e_runner> --project <project> --lane pseudo-dev --tier t1
```

| Knob | Pseudo-dev | True-UAT / Prod |
|------|------------|-----------------|
| Default proof | **T1** (inference + register + drift; + pipeline when features touched) | Same roles unprefixed; `--lane true-uat\|prod` (explicit go-ahead) |
| Verify catalog | `<dev_catalog>` | `<uat_catalog>` / `<prod_project_catalog>` |
| Full chain job | **T2**: required before True-UAT, or when pipeline/inference/job IaC wiring changes | Same via T2 on that lane |
| Job keys | See [PROJECTS.md](references/PROJECTS.md) | Same without prefix |

## Guardrails

- Never dispatch UAT from `main`/`master`.
- Never flip true-UAT `deployed`/catalog to run an experiment. Use the Pseudo-dev lane.
- Never bypass IaC scan / `--no-verify` unless the user explicitly asks for an emergency bypass.
- Never declare a lane done without GH apply success **and** e2e proof exit 0
  (or an explicit human waiver, see [`databricks-e2e-proof` EVIDENCE.md](../databricks-e2e-proof/references/EVIDENCE.md)).
- PII / sensitive data: aggregate-only UC checks. Never pull row-level records to local files.
- Do not edit shared Terraform modules for routine project work.
