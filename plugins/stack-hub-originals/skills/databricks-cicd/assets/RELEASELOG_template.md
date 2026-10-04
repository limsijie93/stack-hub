# RELEASELOG template — IaC monorepo project

Use this template when creating or updating `projects/<project_name>/RELEASELOG.md`.
Fill every `<placeholder>`. For each new PR, add a row to the Summary table AND
a full release section below the `---` divider.

Entry types: `Project Inception` · `CI/CD Deployment` · `Feature` · `UAT Promotion` ·
`Prod Promotion` · `Hotfix` · `Config Update`

**Single deployable unit** (default): use the per-release `### Environments` table shown below.
**Multi-pipeline project** — one inception but **>1 job or LDP pipeline that promote independently
across envs** (not LDP pipelines only — e.g. a project mixing LDP pipelines with
a scheduled job): use the **Multi-pipeline projects** variant at the end of this
file instead of the per-release table. Any future project meeting this test follows the same pattern.

---

# Release Log — <project_name>
<One-line description of what the project does.>

## Summary

| Date | Title | Type | Prod |
|---|---|---|---|
| YYYY-MM-DD | [<Title>](#anchor-slug) | <Type> | N/A or version |

---

## [YYYY-MM-DD] — <Title>

**Type:** <Project Inception | CI/CD Deployment | Feature | UAT Promotion | Prod Promotion | Hotfix | Config Update>
**PR:** #<number> | **Owner:** @<handle1> @<handle2>

### What shipped

For **Project Inception**:
- `project.tfvars` for <env> environment
- SP `<prefix>-sp-<project_name>-<env_short>`, group `<prefix>-group-<project_name>-<env_short>`
- Serverless SQL warehouse and UC volume `<project_name>_volume`
- Project schema `projects_<env>.<project_name>` (dev/uat) or `<prod_project_catalog>.<project_name>` (prod)

For **CI/CD Deployment** (replace with actual resources):
- `cicd-jobs.tfvars` for <env> environment
- Job `<job_key>-<project_name>` — <brief description>
- Pipeline `<pipeline_key>-<project_name>` (LDP) — <brief description>
- Notebooks: `src/notebooks/<task_key>.py`

### Environments

| Env | Inception (`project.tfvars`) | Deployment (`cicd-jobs.tfvars`) | Applied |
|---|---|---|---|
| dev | ✅ Done / — | ✅ Done / — | YYYY-MM-DD / — |
| uat | ✅ Done / — | ✅ Done / — | YYYY-MM-DD / — |
| prod | ✅ Done / — | ✅ Done / — | YYYY-MM-DD / — |

---

# Multi-pipeline projects

Use this variant when a single project (one inception) ships **several independently-deployed
units — Databricks Jobs and/or LDP pipelines** — e.g. a project mixing LDP pipelines with a
scheduled job. Instead of the per-release `### Environments` table above,
place **one `## Deployment Status` section right after the Summary table**: a project-level inception
table (`project.tfvars` is one file per env, shared by all jobs/pipelines) plus one deployment table
per job or pipeline. Keep adding a per-release narrative section (Type, PR, Owner, What shipped)
below the `---` divider for every PR, and update the Deployment Status table(s) for the job(s)/
pipeline(s) that PR touched.

## Deployment Status

### Project inception

| Env | Inception (`project.tfvars`) | Applied |
|---|---|---|
| dev | ✅ Done / — | YYYY-MM-DD / — |
| uat | ✅ Done / — | YYYY-MM-DD / — |
| prod | ✅ Done / — | YYYY-MM-DD / — |

### Deployments (one table per job or pipeline)

#### <job_or_pipeline_key>

| Env | Deployment (`cicd-jobs.tfvars`) | Applied |
|---|---|---|
| dev | ✅ Done / — | YYYY-MM-DD / — |
| uat | ✅ Done / — | YYYY-MM-DD / — |
| prod | ✅ Done / — | YYYY-MM-DD / — |
