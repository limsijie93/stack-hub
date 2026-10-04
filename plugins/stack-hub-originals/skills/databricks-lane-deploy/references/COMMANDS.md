# Commands — dual-lane deploy

Run from the repo root. Replace placeholders:
`<project>`, `<branch>` (never `main` / `master` for UAT), `<owner/repo>`,
`<non_prod_apply_workflow>`, `<prod_apply_workflow>`.

## Local tests

Test layout can differ by project. Fail closed if the expected tree is missing.

```bash
TEST_DIR="<project_path>/<tests_dir>"
[[ -d "${TEST_DIR}" ]] || { echo "ERROR: missing ${TEST_DIR}" >&2; exit 1; }
cd "<project_path>" && PYTHONPATH=src pytest "<tests_dir>" -q
```

## Push feature branch

```bash
git push -u origin HEAD
```

## Dispatch UAT apply (both lanes)

One apply deploys **Pseudo-dev (prefixed) and True-UAT (unprefixed)** together.
Check the workflow's inputs first: `gh workflow view "<non_prod_apply_workflow>" --repo <owner/repo>`.

```bash
gh workflow run "<non_prod_apply_workflow>" --repo <owner/repo> \
  -f branch="<branch>" -f project_name="<project>" -f environment=uat
```

Do **not** set any IaC-scan bypass input unless the user explicitly asks for an emergency bypass.

## Poll the workflow run

Unfiltered `gh run list` can return another project's concurrent run. Filter on the
project name, and prefer the run created after your dispatch.

```bash
gh run list --repo <owner/repo> --workflow "<non_prod_apply_workflow>" --limit 20 \
  --json databaseId,displayTitle,headBranch,createdAt,status,conclusion,event \
  --jq ".[] | select(.displayTitle | test(\"<project>\"; \"i\"))"

gh run watch <run_id> --repo <owner/repo>
gh run view <run_id> --repo <owner/repo> --log-failed
```

Lane smoke is not done until **that** run concludes `success` (or the user waives),
and the Databricks smoke for the lane succeeds.

## Prod apply (Lane 3)

No skill-driven `workflow_dispatch` for prod. Open a PR to `main`; the prod workflow
plans on the PR and applies after merge.

```bash
gh pr create --repo <owner/repo> --base main --head <branch> --title "<title>" --body "<body>"
gh pr checks <pr_number> --repo <owner/repo>
gh pr view <pr_number> --repo <owner/repo> --json mergedAt,url
```

After merge, poll the prod apply for this project. `mergedAt` alone is not proof:

```bash
gh run list --repo <owner/repo> --workflow "<prod_apply_workflow>" --limit 20 \
  --json databaseId,displayTitle,createdAt,status,conclusion \
  --jq ".[] | select(.displayTitle | test(\"<project>\"; \"i\"))"
gh run watch <run_id> --repo <owner/repo>
```

## Databricks jobs (lane-aware)

Job names follow the pattern in [PROJECTS.md](PROJECTS.md).

```bash
export DATABRICKS_CONFIG_PROFILE=<uat_profile>   # prod lane: <prod_profile>
databricks jobs list --name "<workspace_job_name>" --output json   # get job_id
databricks jobs run-now <job_id> --no-wait --output json           # returns run_id
databricks jobs get-run <run_id> --output json | jq '.state'       # poll until terminal
```

If CLI auth is unavailable, trigger from the Jobs UI. Still record the run id and outcome
before you declare smoke done.

## Aggregate verification (no PII / sensitive data dumps)

Use aggregates only (`COUNT`, `MAX`, `GROUP BY`). Never `SELECT *` row-level records to local disk.

```sql
SELECT COUNT(*) AS n FROM <lane_catalog>.<schema>.<pred_table>;
SELECT COUNT(*) AS n, MAX(<snapshot_col>) AS max_dt FROM <lane_catalog>.<schema>.<gold_table>;
```

## Docs contract reminder

If the repo enforces doc sync (for example `<docs_check_workflow>`), update the project
README and RELEASELOG in the same PR as any source or IaC change.
