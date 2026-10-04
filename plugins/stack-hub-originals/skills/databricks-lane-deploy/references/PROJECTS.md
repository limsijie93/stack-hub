# Project map — fill in per project

Copy the block below once per project. Do not fork job maps into other skills;
`databricks-e2e-proof` links here.

Workspace job name pattern (example): `{job_key}-{project_name}`.
Pseudo-dev key = `<dev_prefix>` + true-UAT key, unless noted. One UAT apply deploys both.

## Typical job families

| Family | Typical roles |
|--------|---------------|
| Pipeline / feature store | bootstrap, daily chain (pipeline → sync → inference), adhoc sync, backfill, schema evolution |
| Inference | production score job; optional shadow experiment job |
| Drift / labels | drift monitoring, label refresh |
| Training | project-specific training jobs |
| Registry | register model, retag model version |

---

## `<project_name>`

| Item | Value |
|------|-------|
| Project folder | `<path>` |
| UC schema | `<schema>` |
| Pseudo-dev catalog | `<dev_catalog>.<schema>` |
| True-UAT catalog | `<uat_catalog>.<schema>` |
| Prod catalog | `<prod_project_catalog>.<schema>` |
| Pipeline key | `<pipeline_key>` |
| Pseudo-dev pipeline key | `<dev_prefix><pipeline_key>` |
| Gold snapshot table | `<gold_table>` |
| Predictions table | `<pred_table>` |
| Tests dir | `<tests_dir>` |

### Job keys

| Role | True-UAT / Prod key | Pseudo-dev key |
|------|---------------------|----------------|
| Bootstrap | `<bootstrap_job>` | `<dev_prefix><bootstrap_job>` |
| Daily chain | `<pipeline_job>` | `<dev_prefix><pipeline_job>` |
| Backfill | `<backfill_job>` | `<dev_prefix><backfill_job>` |
| Adhoc inference | `<inference_job>` | `<dev_prefix><inference_job>` |
| Training | `<training_job>` | `<dev_prefix><training_job>` |
| Drift | `<drift_job>` | `<dev_prefix><drift_job>` |
| Register | `<register_job>` | `<dev_prefix><register_job>` |

Record lane-only jobs (dev-only or true-UAT-only), prod key differences (for example
different casing), and deprecated jobs not to smoke.

### Default smoke (Pseudo-dev)

1. Prefixed bootstrap job (first apply / rename only).
2. Prefixed inference job → verify `<dev_catalog>`.
3. Optional: prefixed experiment / drift jobs.
4. Full prefixed chain job when routing requires T2.

**True-UAT:** same roles without the prefix; verify `<uat_catalog>`.

### Config paths

- `<config>/{dev,uat,prod}/…` per job family
- UAT IaC file (both lanes): `<path>`
- Prod IaC file: `<path>`

### Upstream prerequisites

List shared upstream tables that must be non-empty (aggregate check only) before
trusting this project's gold or inference output.
