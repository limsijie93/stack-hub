# Evidence

## Required evidence block (copy into chat + RELEASELOG applied notes)

```text
E2E evidence:
- project: <project>
- lane: pseudo-dev | true-uat | prod
- tier: t0 | t1 | t2
- include_ldp: true|false
- commit: <sha>
- GH apply run: <url or n/a>
- jobs:
  - <workspace_job_name> run_id=<id> result=<SUCCESS|FAILED>
- verify_aggregates: exit 0
  - gold_count=… max_snapshot_dt=…
  - pred_count=…
- next lane: blocked until user confirms True-UAT | waived | n/a
```

No PII / sensitive data or record IDs in evidence.

## Acceptable proof

| Claim | Evidence |
|-------|----------|
| T0 green | Runner `--tier t0` exit 0 (or local test exit 0) |
| T1/T2 green | Runner exit 0 with job run_ids + aggregate lines |
| Deploy applied | Project-filtered GH run conclusion `success` (databricks-lane-deploy) |

## Unacceptable

- "Ran smoke in UI" without a run_id or runner exit code
- Aggregates from the wrong catalog for the lane
- Declaring True-UAT/Prod green without user go-ahead
- Skipping failed jobs, then claiming green

## Human waiver format

Use only when the user explicitly waives a surface:

```text
E2E WAIVER:
- project / lane / tier surface waived: …
- reason: …
- waived_by: <user>
- date: YYYY-MM-DD
- removal_by: YYYY-MM-DD (max 90 days)
```

A waiver is **provisional**. Do not promote to Prod on a waiver alone without a second
explicit Prod go-ahead.

## Example (Pseudo-dev T1 shape)

```text
E2E evidence:
- project: <project>
- lane: pseudo-dev
- tier: t1
- include_ldp: false
- commit: abcdef0
- GH apply run: https://github.com/<owner>/<repo>/actions/runs/…
- jobs:
  - dev__<inference_job>-<project> run_id=… result=SUCCESS
  - dev__<register_job>-<project> run_id=… result=SUCCESS
  - dev__<drift_job>-<project> run_id=… result=SUCCESS
- verify_aggregates: exit 0
  - gold_count=… max_snapshot_dt=…
  - pred_count=…
- next lane: blocked until user confirms True-UAT
```
