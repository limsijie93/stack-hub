---
name: databricks-environment
description: Configures the per-environment Databricks foundation via `terraform/environments/<env>/<env>.tfvars` — catalogs, schemas, universal/local groups, grants, storage URLs, Snowflake foreign catalogs, cluster policies, and destroy toggles. Use when onboarding new catalogs/schemas, adjusting env-wide grants, wiring a new foreign database, or changing privilege policy. When this work accompanies a project inception or config update, also updates `projects/<name>/README.md` and `projects/<name>/RELEASELOG.md` — required by `<docs_check_workflow>` on every PR.
license: MIT
compatibility: Requires Terraform ≥ 1.7 and access to Azure Databricks. Assumes a tfvars-driven Databricks IaC monorepo (see Assumed layout).
metadata:
  version: "1.1"
allowed-tools: Read Bash
---

# Databricks Environment Foundation

> **Assumed layout** (adapt paths if your repo differs): Terraform modules under `terraform/modules/`, env foundation roots at `terraform/environments/<env>/`, and one folder per project at `projects/<project>/` with `env-tf/<env>/*.tfvars` + `src/`. Workflow names below are placeholders (`<docs_check_workflow>`, `<infra_apply_workflow>`) — swap in yours.

Use this skill when editing the **environment foundation** layer — the one-time-per-env Terraform root at `terraform/environments/{dev,uat,prod}/` driven by `<env>.tfvars`. This layer sets up Unity Catalog, storage, universal groups, cluster policies, and Snowflake foreign catalogs that every project downstream depends on.

## When to use

- Adding a new Unity Catalog (standard feature, project host, or foreign/Snowflake) to dev/uat/prod.
- Adding a schema under an existing feature catalog, with its local group.
- Onboarding a new Snowflake database as a foreign catalog.
- Changing env-wide grants (`catalog_grants`, `foreign_grants`, `schema_grants`, `workspace_grants`, `location_grants`).
- Tuning universal-group privilege policy (`universal_group_feature_catalog_privileges`, `universal_group_foreign_catalog_privileges`).
- Toggling `skip_protected_resource_creation` or `prevent_group_destroy` for clean-teardown / rebuild workflows.
- Rotating storage URLs (`url_feature`, `url_volume`, `url_project`, and dev/uat-only `url_project_deployed` / `url_volume_deployed`) or the UC access connector.

## Rules

1. **One tfvars per env**: dev → `terraform/environments/dev/dev.tfvars`, uat → `uat.tfvars`, prod → `prod.tfvars`. Never cross-reference across envs.
2. **Do not set `environment` in downstream configs** — it's set here (`environment = "dev"|"uat"|"prod"`) and injected elsewhere by the workflow.
3. **`env_short` is derived**, not configured: each env maps to a short `<env_short>` code (e.g. a two-letter abbreviation). It drives identity names like `<prefix>-universal-<schema>-<env_short>`.
4. **Privilege policy — two layers, both uniform across all envs**:
   - **Catalog layer** (`universal_group_*_privileges` + `catalog_grants`): universal groups get `USE_CATALOG, BROWSE` on feature catalogs and `USE_CATALOG, BROWSE, USE_SCHEMA, SELECT` on foreign catalogs; contributor/reader groups also get `USE_CATALOG, BROWSE`. Identical across dev/uat/prod.
   - **Schema layer — two distinct mechanisms**:
     - Top-level `schema_grants`: grants CRUD (`APPLY_TAG, CREATE_TABLE, CREATE_MATERIALIZED_VIEW, USE_SCHEMA, MODIFY, SELECT, REFRESH`) to the `<schema-writer-group>` group.
     - `catalog_configurations.*.default_schema_group_privileges` (default schema) and `catalog_configurations.*.schemas.<key>.group_privileges` (named schemas): grants CRUD to the **auto-minted local group** (`<prefix>-local-<schema>-<env_short>`) — applied by the catalog module, not `schema_grants`. Requires `default_schema_create_group = true` for the default schema.
   - Both schema-layer mechanisms are consistent across dev/uat/prod. Prod access is controlled with schema-level grants; decide your own read/write split.
   - **Project SPs** get `ALL_PRIVILEGES` on their own project schema via `databricks_project` (not set here).
5. **Catalog naming is environment-suffixed**: `<feature_catalog>_<env>`, the dev/uat project catalog `projects_<env>` (prod's is `<prod_project_catalog>`), the dev/uat-only CI/CD-deployed catalog `<deployed_catalog>_<env>`; foreign catalogs usually end in `_<env>` as well.
6. **`catalog_configurations` is the main knob.** Three shapes:
   - `catalog_category = "standard"` + `catalog_type = "feature"` → feature catalog with optional default schema + `optional_schema_suffixes` + local groups.
   - `catalog_category = "standard"` + `catalog_type = "project"` → project host catalog (schemas added later by `databricks_project`). Add `deployed = true` on a **second** `catalog_type = "project"` entry (dev/uat only) to provision the CI/CD-deployed catalog (`<deployed_catalog>_<env>`) — its `storage_root` routes to the `project_deployed` external location instead of `project`; per-project schemas are added later by `databricks_cicd`, not here. Requires `url_project_deployed` / `url_volume_deployed` to be set. Never added to `prod.tfvars` — prod is single-catalog by design (see the prod-specific bullet below), not a two-catalog dev/uat-style split.
   - `catalog_category = "foreign"` → Snowflake foreign catalog; requires `database = "<SNOWFLAKE_DB>"`; may override `foreign_grants`.
7. **Destroy toggles are sharp tools**:
   - `skip_protected_resource_creation = true` lets you tear down without hitting `lifecycle { prevent_destroy }` walls — **only** for intentional destruction, never on `main`.
   - `prevent_group_destroy = false` removes the `prevent_destroy` guard from universal groups — set it deliberately per env, and prefer `true` in prod unless you need flexible group management.
8. **Provider aliases are fixed**: `databricks.workspace` for catalogs/schemas/workspace objects; `databricks.account` for groups, SPs, budget policies.
9. **Universal-group privileges are additive** — per-catalog overrides via `schema_grants` / `foreign_grants` replace the env-wide default for that catalog only.
10. **Foreign catalog grants** default to the top-level `foreign_grants` list, but each foreign catalog config can override it (e.g., to restrict a sensitive DB to a smaller audience).

## Workflow

1. **Open the env tfvars** at `terraform/environments/<env>/<env>.tfvars`.
2. **Plan the change** against [`references/SCHEMA.md`](references/SCHEMA.md) — identify which block you're editing (Azure wiring / grants / universal-group privileges / `catalog_configurations`).
3. **Make the edit**. For a new feature schema, extend `optional_schema_suffixes` and the `schema_grants` list; for a new foreign catalog, add a `catalog_configurations.<key>` entry with `catalog_category = "foreign"` and `database`.
4. **Update project documentation** if this change is tied to a project inception or a project config update — mandatory before raising a PR (enforced by `<docs_check_workflow>`).
   Load [`../databricks-cicd/assets/README_template.md`](../databricks-cicd/assets/README_template.md) and [`../databricks-cicd/assets/RELEASELOG_template.md`](../databricks-cicd/assets/RELEASELOG_template.md) when creating these files for the first time.
   - `projects/<project>/README.md` — create (inception) or update to reflect new env, groups, or schema wiring.
   - `projects/<project>/RELEASELOG.md` — append a Summary table row and a detailed release section. Use type `Project Inception` for new `project.tfvars`; `Config Update` for adjustments.
   - Canonical example: `projects/<example_project>/{README.md,RELEASELOG.md}`.
5. **Update the foundation release log** — mandatory for any `terraform/environments/**` change (enforced by `<docs_check_workflow>`). In `terraform/environments/RELEASELOG.md` (path in your repo) add a Summary row + a detailed entry (type `Catalog Change` / `Grant Update` / `Policy Update` / `Snowflake / Foreign Catalog` / `Config Update` / `Hotfix`) and update the **Deployment Status** table for the env(s) applied. Template: [`assets/RELEASELOG_template.md`](assets/RELEASELOG_template.md).
6. **Run `pre-commit run --all-files`** — `terraform_fmt` + `terraform_validate` will catch syntax errors.
7. **(Optional) Run module tests locally** with your repo's unit test runner for the environment module.
8. **Deploy via `workflow_dispatch`** on `<infra_apply_workflow>`, selecting the target env. Review the plan artifact carefully — foundation changes blast-radius every project in the env.
9. **Prod**: follow the same flow, but expect the apply gate (required approvals) before the workflow proceeds.

## Watch for

- **Adding a feature schema** also needs a matching local group (`default_schema_create_group = true`) and a schema-level grant entry — forgetting either leaves the schema unreachable.
- **`legacy_base_path` in LDP pipelines** derives from the env's storage account naming (one storage account per env) — changing `url_*` requires coordinating with the `databricks_cicd` module's storage-account map.
- **Removing a catalog** is destructive even in dev — prefer renaming/disabling principals on `catalog_grants` instead.
- **`skip_protected_resource_creation = true` accidentally left on** prevents foundation resources from re-creating; always revert to `false` after teardown.
- **Foreign catalog `database`** must match the Snowflake DB name exactly (case-sensitive in the connection).
- **Prod is single-catalog, not a two-catalog dev/uat split** — don't add a *second* `catalog_configurations` entry with `deployed = true`, or `url_project_deployed`/`url_volume_deployed`, to `prod.tfvars`. Prod uses a single project catalog named `<prod_project_catalog>` (dev/uat use `projects_<env>` plus `<deployed_catalog>_<env>`).
- **Group-name drift** — universal group names are derived from schema keys + `env_short`; renaming a schema key renames the group, which cascades to every grant that references it.
- **Cross-env privilege leakage** — a dev-only principal in `catalog_grants` should never appear in `prod.tfvars`. Review grants separately per env.
- **Don't commit secrets** — Keep credentials out of tfvars; flow them through OIDC + secret scopes.

## References

- `terraform/environments/dev/dev.tfvars` — canonical example (dev).
- `terraform/environments/uat/uat.tfvars` — UAT config.
- `terraform/environments/prod/prod.tfvars` — production config.
- `terraform/modules/databricks_environment/README.md` — full `catalog_configurations` schema and module variables.
- Your repo's architecture docs — component diagram and platform overview.
- An environments config file (per-env workspace/storage/backend settings).
- Sibling skill [`databricks-cicd`](../databricks-cicd/SKILL.md) — project CI/CD layer that consumes catalogs defined here.

> **Read [`references/SCHEMA.md`](references/SCHEMA.md)** for the full `<env>.tfvars` field-level schema — Azure wiring, grants, universal-group privileges, `catalog_configurations` shapes, and generated identity patterns. Load it when authoring or validating specific field values.
