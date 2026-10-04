# Lane contract — dual-lane UAT

One Databricks **UAT workspace** hosts two permanent job/pipeline sets in one UAT IaC
apply (for example `<project>/env-tf/uat/cicd-jobs.tfvars`). **Prod** uses a separate
workspace and its own IaC file.

## Coexistence table

| Lane | When | Workspace | Job prefix | `env` | `deployed` | Catalog | Config dir | How to apply |
|------|------|-----------|------------|-------|------------|---------|------------|--------------|
| **1 — Pseudo-dev** | Default for iteration / smoke | UAT | `<dev_prefix>` | `uat` | `false` | `<dev_catalog>` | `<config>/dev/…` | Non-prod apply from feature branch |
| **2 — True-UAT** | Explicit validation after Pseudo-dev green | UAT | *(none)* | `uat` | `true` | `<uat_catalog>` | `<config>/uat/…` | Same UAT apply; smoke unprefixed jobs |
| **3 — Prod** | After True-UAT green | Prod | *(none)* | `prod` | `true` | `<prod_project_catalog>` | `<config>/prod/…` | PR → merge → prod apply |

Never jump 1 → 3. Never enter 2 or 3 without explicit user confirmation.

### Do not flip

Pseudo-dev and True-UAT **coexist**. To experiment, run the prefixed jobs. Do not edit
unprefixed jobs to `deployed=false` / `<dev_catalog>`.

## Runtime / infra notes

| Concern | Pseudo-dev (prefixed) | True-UAT / Prod |
|---------|-----------------------|-----------------|
| Notebook sources | Shared notebooks (same map keys) | Same notebooks |
| Config selection | Resolves to `dev` | `uat` or `prod` |
| Pipeline (LDP) source tree | Reuses the unprefixed source directory (no second tree) | Canonical pipeline directory |
| Pipeline name / meta config | Prefixed pipeline name with its own meta config dir | Unprefixed pipeline name + matching meta dir |
| Per-pipeline target catalog | Set to `<dev_catalog>` so it does **not** inherit the root target catalog | Uses the project root target catalog |
| Descriptions | Annotate as dev in the Jobs UI | Unannotated |

The root target catalog in the UAT IaC stays **`<uat_catalog>`** (true-UAT default).
The prefixed pipeline overrides it with its own `target_catalog = "<dev_catalog>"`.

## IaC checklist (UAT dual-lane)

Before each UAT dispatch, confirm coexistence. Do **not** collapse both lanes into one catalog.

### Pseudo-dev blocks (prefixed jobs + prefixed pipeline)

- [ ] Every prefixed notebook task: `deployed = "false"`
- [ ] Every prefixed notebook task: `env = "uat"`
- [ ] Prefixed pipeline: `catalog = "<dev_catalog>"`
- [ ] Prefixed pipeline: `target_catalog = "<dev_catalog>"` (isolation from root)
- [ ] Prefixed pipeline: `pipeline_configuration.deployed = "false"` (string)
- [ ] Prefixed pipeline tasks reference the **prefixed** pipeline key
- [ ] Feature jobs that need it pass the prefixed `pipeline_name`

### True-UAT blocks (unprefixed)

- [ ] Root target catalog = `<uat_catalog>`
- [ ] Unprefixed notebook tasks: `deployed = "true"`, `env = "uat"`
- [ ] Unprefixed pipeline: `catalog = "<uat_catalog>"`, `deployed = "true"`
- [ ] Unprefixed pipeline tasks reference the **unprefixed** pipeline key

### Prod

- [ ] Root target catalog = `<prod_project_catalog>`
- [ ] Every notebook task: `deployed = "true"`, `env = "prod"`
- [ ] Pipeline: `catalog = "<prod_project_catalog>"`, `deployed = "true"`
- [ ] Do not mix UAT dual-lane edits and prod-only pin changes in one PR when only IaC changes
- [ ] After merge: confirm prod apply success, then bootstrap once if first apply / rename

## Operator sequence (default)

1. Edit shared notebooks and/or lane-specific configs under `<config>/{dev,uat,prod}/`.
2. Push feature branch → dispatch UAT apply (both lanes deploy together).
3. Smoke **Pseudo-dev** (prefixed / `<dev_catalog>`).
4. On explicit go-ahead, smoke **True-UAT** (unprefixed / `<uat_catalog>`).
5. On explicit go-ahead, open prod PR → merge → watch prod apply → bootstrap/smoke.

## Optional dry-run knobs (Pseudo-dev configs only)

| Config | Flag (example) | Restore before treating True-UAT/Prod as green |
|--------|----------------|-----------------------------------------------|
| Training config (`dev/`) | `<test_flag>: true` | `false` |
| Inference config (`dev/`) | `<test_pipeline_flag>: true` (+ small sample fraction) | `false` |

Do not leave subsample / test mode on in `uat/` or `prod/` configs when promoting.
