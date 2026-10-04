---
name: pr-review
description: Reviews a pull request for code-correctness issues that linters, config-hygiene bots, and path-scoped review instructions don't catch — PII / sensitive-data leakage in error paths, concurrency races, incomplete timeout budgets, cross-workspace MLflow/UC resolution, silent data-quality bugs, config hard-fail/migration risk, and doc/version drift. Use when asked to review a PR, before approving/merging, or when investigating why a similar bug shipped before. Complements (does not duplicate) automated hygiene review such as Copilot instructions or pre-commit.
license: MIT
compatibility: Requires `gh` CLI authenticated against the PR's GitHub host. Rubric is tuned for Python/SQL/Spark, Databricks (MLflow, Unity Catalog, Jobs, Apps), Terraform, and GitHub Actions codebases.
metadata:
  version: "1.0"
allowed-tools: Read Bash
---

# PR Review

A rubric of recurring bugs seen in data/ML codebases on Databricks. Each rule targets a class of bug
that tends to ship, or to surface only late in review. Use it to review code-correctness, not config
hygiene.

## Scope — read this first

Do not repeat what other automation already checks. If the repo has Copilot review instructions
(`.github/copilot-instructions.md`, `.github/instructions/*.instructions.md`), pre-commit hooks,
linters, or IaC scanners, read them first and **assume their rules are already enforced** — doc-sync,
key naming, formatting, hardcoded environment values, and similar hygiene. This skill exists for what
those structurally can't cover: bugs in the actual Python/SQL/Spark logic, service code, MLflow/UC
usage, and workflow YAML semantics.

## How to review a PR

```bash
gh pr view <n> --json title,body,files,reviews,additions,deletions
gh pr diff <n>
gh api repos/{owner}/{repo}/pulls/<n>/comments   # inline review threads — higher signal than review summaries
```

Add `--repo <owner>/<repo>` when not running inside the target checkout.

Check size before anything else: Copilot's review bot refuses outright above ~20,000 changed lines
(`additions`+`deletions`). A PR that big gets **zero** automated review coverage; treat it as needing a
full manual pass, or ask the author to split it. For stacked PRs (title says "stack N/M" or "stacked
on <PR>"), confirm `gh pr diff` is scoped to that PR's own slice, not the cumulative parent-branch
diff — reviewers diffing against `main` see the cumulative diff.

Then walk the rubric below against the diff and inline comments.

## Rubric

### 1. Sensitive data in error paths, not just logs
Any exception, error column, or callback payload derived from user-supplied input can leak PII or
other sensitive data through more than the log line — check what an exception's `str()` embeds, what
gets written to a persisted error/status column, and what gets sent to an outbound callback.
*E.g.:* an exception whose message embeds raw input can reach logs, a persisted error column, and an
outbound callback at once.

### 2. Concurrency: check-then-act races
Flag any "check row/count exists, then write" pattern, and any per-request resource (thread pool,
config override row, counter) that isn't safe under concurrent invocations. A load test at the exact
burst condition the guard exists for is the only way some of these actually surface.
*E.g.:* a non-atomic check-then-act on a shared limit can admit every request in a burst; a
`COUNT(*)` existence check can observe zero just before a concurrent commit, so writes need
idempotency keys; state left behind by an interrupted job can change what the next run does.

### 3. Timeout/deadline budget completeness
When a PR adds a timeout, watchdog, or deadline, check it covers **every** code path that can block —
not just the one path the bug report named.
*E.g.:* a timeout on one write leaves other blocking writes on the same path unbounded; one shared
deadline threaded through all of them closes the gap.

### 4. Cross-workspace MLflow/UC resolution
`run_id`, `model_id`, and `LoggedModel` lookups are workspace-local to the MLflow tracking server —
any inference/scoring code that dereferences them assumes it's running in the same workspace that
trained the model. If models are trained in one workspace and served in another, this breaks by
design unless resolution goes strictly through the UC `ModelVersion`/registered-model path. When a PR
fixes one occurrence, check whether **every** call site of the same MLflow API got the same fix, not
just the one in the stack trace. Also: `mlflow.register_model(model_uri=f'models:/{name}@{alias}', ...)`
— a common cross-env promotion mechanism — never populates `run_id` on the new version; flag inference
code that assumes otherwise post-promotion. Helpers that look local (e.g. fetching model info after
load) may still call the tracking server.
*E.g.:* a fix applied at one call site can leave other call sites of the same API broken.

### 5. Config hard-fail vs. soft-warn migration
A schema/config validation change that starts **rejecting** a previously-accepted key or value needs
a warn-and-ignore window for at least one release, unless the same PR ships a migration/backfill for
every existing consumer.
*E.g.:* a release that rejects deprecated keys can break configs still in use; a warning keeps them
working while consumers migrate.

### 6. Silent data-quality bugs
Check for:
- aggregation/summary functions that drop nulls before computing a rate or percentage, silently
  shrinking the denominator;
- cumulative/streak SQL logic that only counts a run starting at the first period (prefix-only);
- joins missing `DISTINCT`/dedup on the entity key, causing N×N fan-out;
- inconsistent date semantics (month-start vs. month-end) across files in the same PR.

### 7. "No-fail"/best-effort contracts must actually hold under exceptions
If a function or module documents itself as "must never fail the caller" or "best-effort," verify
every resource-acquiring call inside it (figure handles, file handles, connections) is released in a
`finally`, not just on the happy path. Re-reading the full diff, not only the incremental delta, helps
catch these.
*E.g.:* a figure handle stays open if the logging call raises.

### 8. Terraform/provider and CI YAML claims need verification, not trust
Don't accept a confident-sounding claim about Terraform provider schema (attribute names, enums) or a
GitHub Actions `if:` condition at face value — verify against the pinned provider version or the
actual `needs.*.result` semantics. Two specific gotchas recur: `for_each` expansion aborts graph
construction *before* any `lifecycle.precondition` runs, so a null value that should fail with a clear
message crashes obscurely instead; and an `if:` with no explicit status function implicitly ANDs
`success()`, so a job that's cleanly `skipped` upstream (not failed) never reaches its own
`result == 'skipped'` branch. Also check that a workflow's own `paths:` filter includes the workflow
file, or editing the workflow won't trigger it.
*E.g.:* a provider attribute or enum value that doesn't exist in the pinned version; a resource
name-length limit documented only in tool source.

### 9. Guard-rail tests must be mutation-checked
A new "contract" or "drift" test is only useful if it actually fails when the thing it guards against
happens — verify this was checked (inject the bad state, confirm red, then fix), don't just trust
that a test with the right name does the right thing.
*E.g.:* a loose allowlist check can pass on drift that an exact set comparison catches; a summary
function can raise `ZeroDivisionError` on a non-empty frame with zero matching rows if no test
exercises that case.

### 10. Bot review comments have a known false-positive pattern
Spot-verify any Copilot (or other bot) claim about Databricks/Spark SQL dialect or SDK object shape
before accepting it — bots are often confidently wrong about exactly these two claim types.
*E.g.:* a bot may flag 3-arg `DATEDIFF(unit, start, end)` or `expr::type` cast shorthand as invalid
(both are valid Databricks SQL); a bot may claim `dbutils.widgets.text()` resets job-supplied values;
a bot may question whether an attribute exists on the pinned SDK version — check the pinned version,
not the bot.

### 11. Documentation/version drift
Cheap to catch, and a common category. Check CHANGELOG/README: dates, PR number (`#TBD` placeholders
left unfilled), owner lists, table structure (a blanket `sed` can silently break column counts), and
— obviously — no unresolved merge-conflict markers. For any package version bump, confirm
`pyproject.toml`, `__init__.py`, README, `SKILL.md`, and CHANGELOG all state the same target version;
this often drifts.
*E.g.:* a literal `<<<<<<< HEAD` in the CHANGELOG; a PR title version that differs from
`pyproject.toml`; README code examples calling an old function signature; a CHANGELOG entry claiming
behavior not yet introduced.

### 12. Auth: per-request identity, not a shared cached credential
Any "on-behalf-of-user" or per-user auth claim needs to actually key its cached connection/token on
the requesting user, not share one cached identity across all callers.
*E.g.:* an app that claims per-user auth but caches one identity serves every user as that identity;
key the cache on the per-request token.

### 13. Cost/operational safety on auto-deployed jobs
If your prod applies on merge to `main`, a new job's schedule is live from the first apply. If it
depends on a one-time bootstrap step, check that step is actually enforced (a precondition, a manual
approval gate) and not just described in a README. Check that every new schedule, long-running
non-prod job, and newly exposed endpoint has an explicit owner and a teardown path; flag non-prod jobs
running at full production cadence and always-on resources with no destroy path.

### 14. CI auth must match how CI actually authenticates
Don't assume a CI/CD auth change has parity with a developer's local login — check whether the
pipeline uses OIDC/service-principal auth (no cached interactive session) versus a CLI flow that
expects one.
*E.g.:* a CLI auth command that needs an interactive login fails in CI; use the token flow CI
actually has.

## When this rubric misses something

If a bug ships (or needs a second review round) that none of the above would have caught, add a new
numbered rule here in the same shape — check, failure mode, example.
