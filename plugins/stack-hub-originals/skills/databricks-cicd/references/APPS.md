# Databricks Apps — Full Reference

> **Reference module schema (from a reference tfvars-driven Databricks Terraform module set) — adapt to your module.** Field names, defaults, and validations match that module; your module may differ.

> Authoritative reference for the `apps` block in `apps.tfvars`, deployed by its own Terraform root
> (`terraform/databricks-apps/` → `modules/databricks_apps`) and its own state
> (`projects/<project>/apps/terraform.tfstate`) — independent of `cicd-jobs.tfvars` /
> `databricks-jobs`/`modules/databricks_cicd`. A project may have `apps.tfvars` with no
> `cicd-jobs.tfvars` at all. Read this before adding an app to a project. Worked example (in your repo, e.g.):
> `projects/<example_project>/` (`example_ui` — Streamlit, `example_api` — FastAPI).

## When to pick an App

| Need | Use |
|---|---|
| Custom HTTP status codes, GET endpoints, large request bodies | **App** |
| Interactive dashboard / data-entry UI for internal users | **App** (Streamlit/Dash/Gradio) |
| Batch/scheduled data processing | **Job** or **LDP pipeline**, not an App — App compute is optimized for UI rendering, not data processing (Databricks' own guidance) |
| Model inference behind a fixed request/response contract | **Model Serving**, not an App, unless you specifically need what the middle column above lists |

Model Serving cannot do custom status codes, GET, or (in practice) large payloads — that is the
entire reason this asset type exists. If your need doesn't require any of those, prefer Model
Serving, a Job, or an LDP pipeline; Apps are not a general-purpose replacement for them.

## Minimum viable app

Only `description` is required:

```hcl
apps = {
  report_api = {
    description = "Report generation API"
  }
}
```

This alone gives you: app name `report-api-<project_name>`, source uploaded from
`src/apps/report_api/`, `MEDIUM` compute, the project's own budget policy, and the project group
granted `CAN_USE` in dev/uat (not prod).

## `src/apps/<key>/` layout

One folder = one app. The map key is the folder name unless `directory` overrides it.
`directory` must be a relative path of one or more `[A-Za-z0-9_]+` segments joined by `/` — no
leading `/`, no `..`, no empty segments; it's interpolated directly into both a local filesystem
read and a workspace upload destination, so an unvalidated value could read or write outside
`src/apps/` and the apps workspace subtree. Two apps *can* legitimately set the same `directory`
(a shared source folder) — the module dedupes the resulting file uploads to one per file, not one
per app, so disabling one app never deletes a file the other still depends on.

```
projects/<project>/src/apps/<key>/
├── app.py            # or app.js for Node — the entry point
├── app.yaml           # REQUIRED at the folder root — command + env
└── requirements.txt   # pinned exact versions (Databricks recommends uv; your repo pins requirements.txt)
```

**`app.yaml` is mandatory.** A plan-time precondition on `databricks_app.apps` checks
`fileexists()` on it and fails with a clear message if missing — this is not a soft warning.

**Port binding is the #1 thing to get wrong.** The app **must** bind `0.0.0.0` and the port from
the `DATABRICKS_APP_PORT` environment variable (default 8000), not `localhost` and not a
hardcoded port:

```yaml
command: ['uvicorn', 'app:app', '--host', '0.0.0.0', '--port', '$DATABRICKS_APP_PORT']
```

Binding wrong doesn't fail the deploy — the container starts, looks healthy in logs, and is
simply unreachable. The deploy job's post-deploy `RUNNING`-state check catches the crash case but
not a silent bind-to-wrong-interface case; a manual first hit against the app URL is still worth
doing on a new app.

The platform terminates TLS and requires HTTP/2 cleartext (H2C) support from the app — do not
implement custom TLS handling.

## Full schema

```hcl
apps = {
  <app_key> = {                                  # ^[A-Za-z0-9_]+$ — folder under src/apps/, unless directory overrides it
    # ── Required ─────────────────────────────────────────────────────────
    description = "..."                          # only required field

    # ── Lifecycle ────────────────────────────────────────────────────────
    enabled   = true                              # default true; false = destroys the app + its access group/grants/uploads on the next apply (matches jobs/pipelines' identical enabled = false convention) — it does NOT park a running app
    directory = null                              # default null → folder name == app_key

    # ── Compute ──────────────────────────────────────────────────────────
    compute_size = null                           # default null → Databricks default MEDIUM; or "LARGE" (2x DBU — justify it)
    no_compute   = false                          # default false; true → create the app without starting compute (no billing until started)

    # ── Resource bindings ────────────────────────────────────────────────
    # Each entry's key becomes the resources block's `name` in app.yaml,
    # referenced via `valueFrom: <key>`. Exactly one sub-object per entry.
    resources = {}
    #   <name> = { sql_warehouse    = { id = null, permission = "CAN_USE" } }        # id null → auto-resolve THIS project's own warehouse
    #   <name> = { serving_endpoint = { name = "...", permission = "CAN_QUERY" } }   # verify the endpoint name exists in-workspace before applying
    #   <name> = { secret           = { scope = "...", key = "...", permission = "READ" } }
    #   <name> = { uc_securable     = { securable_full_name = "...", securable_type = "TABLE", permission = "SELECT" } }
    #   <name> = { job              = { id = "...", permission = "CAN_MANAGE_RUN" } }
    #   also available: database, genie_space, postgres, app, experiment (see the provider's
    #   databricks_app resource docs for exact fields — these are less commonly needed)

    # ── Auth ─────────────────────────────────────────────────────────────
    user_api_scopes = []                          # e.g. ["sql"] — required for on-behalf-of-user (OBO) apps only

    # ── Schema access ────────────────────────────────────────────────────
    schema_access = "deployed"                     # default "deployed"; also "project" or "none" — see "Persisting state" below

    # ── Telemetry (Public Preview) ───────────────────────────────────────
    enable_telemetry       = false                 # default false
    telemetry_table_prefix = null                  # default null → unprefixed otel_logs/otel_metrics/otel_spans

    # ── External consumers ───────────────────────────────────────────────
    external_consumers = []                        # e.g. ["partner_team"] — see "Credential handoff" below

    # ── Access ───────────────────────────────────────────────────────────
    app_permissions = {
      project_group_can_use = null                 # null → true in dev/uat, false in prod
      use_access_emails     = []                    # named individuals → CAN_USE
    }
  }
}
```

**Deliberately not offered** (rejected if present, or simply not a recognized field):

- **`contributor_groups`** — for jobs/pipelines this grants `CAN_VIEW` (read-only visibility) to a
  broad org-wide group. **Apps have exactly two permission levels, `CAN_USE` and `CAN_MANAGE` — no
  `CAN_VIEW`-equivalent floor exists.** Carrying `contributor_groups` over would silently turn
  org-wide read-only visibility into org-wide *live invoke access* on an HTTP endpoint. App access
  is the project group, the app's own dedicated access group, or named individuals — never an
  arbitrary pre-existing group. This is not a violation of SKILL.md Rule 12's "never a group"
  principle for run access; it is the same principle applied consistently.
- **`budget_policy_id`** — always the project's own policy (same one jobs/pipelines use). No
  per-app override. Apps have **no `tags` argument at all** (confirmed absent from the provider's
  resource schema), so the budget policy's `custom_tags` are the *only* cost-attribution mechanism
  for app DBUs — which matters more here than for jobs, because apps bill continuously with no
  scale-to-zero.
- **`env`** — `databricks_app` has no top-level env argument. Environment variables belong in the
  app's own `app.yaml`; values tied to a declared resource (a warehouse ID, a catalog name) flow in
  via `valueFrom` referencing the `resources` map key instead.

## Worked example — every dev-configurable field set

The schema above shows types and defaults with placeholders; this shows the same fields with real
values, as a copy-and-adjust starting point. Every field a dev can actually configure appears —
nothing here is a "deliberately not offered" field like `budget_policy_id` or `contributor_groups`
(those aren't in the schema at all, see above, precisely because a dev can't set them):

```hcl
apps = {
  report_api = {
    description = "Report generation API for the downstream Order Service"

    enabled   = true
    directory = "report_service_api"        # optional — source is src/apps/report_service_api/, not src/apps/report_api/

    compute_size = "LARGE"             # 2x DBU — justified here by concurrent request load
    no_compute   = false               # true would create the app without starting compute, e.g. ahead of a planned cutover

    resources = {
      warehouse       = { sql_warehouse    = { permission = "CAN_USE" } }                                          # id omitted -> auto-resolves to this project's own warehouse
      llm             = { serving_endpoint = { name = "databricks-claude-sonnet-4", permission = "CAN_QUERY" } }   # verify this name exists in the target workspace first
      callback_secret = { secret           = { scope = "report_api", key = "callback_token", permission = "READ" } }
    }

    user_api_scopes = []               # empty — this app calls out via its own service principal (M2M), not on-behalf-of-user

    schema_access = "deployed"   # default; the app's own SP gets CRUD on this project's CI/CD-deployed schema (dev/uat only)

    enable_telemetry       = true
    telemetry_table_prefix = "report_api"   # writes to otel_logs/otel_metrics/otel_spans prefixed report_api_ instead of unprefixed

    external_consumers = ["order_service"]   # mints a dedicated SP, added to this app's access group — see "Credential handoff" below

    app_permissions = {
      project_group_can_use = true                    # a real exception in prod (no-op in dev/uat, which already default to true) — see SKILL.md Rule 12
      use_access_emails     = ["oncall@example.com"]  # named individuals get CAN_USE directly, independent of the project group
    }
  }
}
```

Two fields are easiest to get backwards, so worth calling out explicitly here rather than only in the
schema table: `user_api_scopes` is for **on-behalf-of-user** apps only (like `example_ui`) — leave it
`[]` for machine-to-machine apps like this one; and `enabled = false` (not shown above) **destroys**
the app's `databricks_app` resource, its access group, its grants, and its uploaded files on the next
apply — it does not stop or pause a running app. `apps_enabled` (`locals.tf`) filters disabled apps
out of every resource's `for_each`, so there is nothing left in state for them once you apply. This
matches the identical `enabled = false` behavior `databricks_cicd` already has for jobs/pipelines, but
the stakes are higher for an app: you lose its URL and deployment history, not just a schedule. To
actually stop billing without losing any of that, set `no_compute = true` instead (keeps the app
resource, access group, and grants; just doesn't start compute) — see "Cost" below. Use
`enabled = false` only when you actually want the app torn down.

## Multiple apps per project

The `apps` map supports any number of entries — this is a first-class requirement, not an
incidental side effect of using a map. Every piece of the underlying machinery is per-key with no
shared singleton: each app gets its own `databricks_app` resource, its own access group, its own
grants, and its own entry in the deployment manifest. `enabled = false` destroys one app's resources
(see "Worked example" above) without touching its siblings. See your repo's example project (e.g. `projects/<example_project>/`) for two apps
declared side by side.

## Persisting state — `schema_access`

An app runs as its **own auto-provisioned service principal** — not the project's SP, and not a
member of the project group. By default it therefore **cannot** read or write any project schema,
which most stateful apps need — Databricks Apps get **15 seconds on `SIGTERM` before `SIGKILL`** on
every redeploy, so in-memory state does not survive a deploy and a real Delta table is the correct
default, not a convenience.

`schema_access` (default `"deployed"`) picks which schema the app's own service principal is
granted `USE_SCHEMA, SELECT, MODIFY, CREATE_TABLE, READ_VOLUME, WRITE_VOLUME` on — narrower than the
project SP's `ALL_PRIVILEGES`, since the app is internet-reachable and the project SP is not:

| Value | Catalog | Exists in prod? |
|---|---|---|
| `"deployed"` (default) | CI/CD-deployed catalog (`<deployed_catalog>_<env>`) — created by the **jobs root's** apply, not this one | No — dev/uat only |
| `"project"` | Inception-owned project catalog (`projects_<env>` in dev/uat, `<prod_project_catalog>` in prod) — created by project inception | Yes, every environment |
| `"none"` | — no grant, no catalog-name secret | — |

Either way the schema segment is always the project name — only the catalog differs. Neither schema
is *created* by `modules/databricks_apps` itself: both already exist by the time the apps root
plans (project inception always runs first; for `"deployed"`, the jobs root's own apply is
sequenced ahead of the apps root by the calling workflow's `needs:` edge — see
`terraform/databricks-apps/README.md`). The apps root only looks the target up via
`data "databricks_schema"`, which is what makes a separate state from the jobs root possible at all
— a `depends_on` can't reach into another root's state, but a data source can read anything that
already exists by name. Set `schema_access = "none"` for apps that never touch a schema (a UI-only
app that only queries a warehouse, for example).

**When `schema_access` is `"deployed"` or `"project"`, the module also auto-injects a
`deployed_catalog` resource entry** — a `secret`, not a `uc_securable` — so app code can build its
own schema-qualified table names without any per-environment hardcoding:

```yaml
# app.yaml
env:
  - name: DEPLOYED_CATALOG_NAME
    valueFrom: deployed_catalog
```

```python
import os
catalog = os.environ['DEPLOYED_CATALOG_NAME']
table = f'{catalog}.<project_name>.tasks'   # the schema segment is always the project name
```

This works because the catalog segment is the *only* part of the target schema's fully-qualified
name that varies by environment (and, for `schema_access`, by mode) — the schema segment is always
the project name, a compile-time constant. **Why a `secret`, not `uc_securable`:** the provider's
`uc_securable.securable_type` only accepts `CONNECTION`/`FUNCTION`/`TABLE`/`VOLUME` — there is no
`CATALOG` securable type, so a catalog name cannot be exposed that way. Databricks' `valueFrom` docs
confirm a `secret` resource injects the decrypted value directly as a plain env var — the same
shape `app.yaml` already expects. The module creates one secret scope + secret **per catalog mode
in use** (`deployed` and/or `project`), not one per project or per app — this matters if two apps in
the same project use different `schema_access` values, since each mode resolves to a different
catalog name. The value itself isn't sensitive; a secret is just the resource type whose
`valueFrom` mechanism does what's needed here.

### ⚠️ Prod has no CI/CD-deployed schema — `schema_access = "project"` is the fix

The CI/CD-deployed catalog **always resolves to a no-op in prod**, exactly as it does for
jobs/pipelines (see `references/SCHEMA.md`'s "CI/CD-deployed catalog" section) — prod stays
single-catalog (`<prod_project_catalog>`, inception-owned). This means in prod, `schema_access = "deployed"` fails a plan-time precondition
outright (a clear failure, not a silent no-op) and **`enable_telemetry = true` fails the plan
precondition** for the same reason. An app that needs Delta-backed state or telemetry in prod today
should set `schema_access = "project"` — the inception-owned project catalog resolves to
`<prod_project_catalog>` in prod, so this is the officially-supported, prod-viable path.

### ⚠️ Apps-only projects (no `cicd-jobs.tfvars`) — never rely on the default either

The same failure mode hits **every environment**, not just prod, whenever a project has no
`cicd-jobs.tfvars` for that env at all. `schema_access = "deployed"` (the default) resolves against
a schema only the jobs root's own apply creates — with no jobs root ever running for this project,
the plan-time `data "databricks_schema"` lookup fails outright, the same as the prod case above but
for a different reason (no jobs root at all, vs. no CI/CD-deployed catalog concept in prod). An
apps-only `apps.tfvars` — one with only `description` set — must set `schema_access = "project"` or
`"none"` explicitly; do not leave it unset.

## Deploy lifecycle

**Terraform creates the app but never deploys its code.** No provider version to date has a
code-deployment argument on `databricks_app` (the upstream `databricks_app_deployment` resource,
[terraform-provider-databricks#5452](https://github.com/databricks/terraform-provider-databricks/pull/5452),
is still open). A bare `terraform apply` produces a running container with nothing in it.

Deployment is a separate step, run by the **`<apps_deploy_job>`** job in `<non_prod_apply_workflow>` and
`<prod_apply_workflow>`, which runs immediately after the `<apps_plan_job>` job's apply
completes:

1. Reads `apps_deployment_manifest` (`{app_name, source_code_path}` per enabled app) from the
   now-updated `databricks-apps` remote state.
2. Runs `databricks apps deploy <name> --source-code-path <path> --mode SNAPSHOT` for every app,
   **aggregating failures rather than failing fast** — with two or more apps, stopping at the
   first failure would leave the rest silently undeployed while Terraform state says they exist.
3. Verifies each app reaches `RUNNING` state (`databricks apps get`). `apps deploy` itself blocks
   until the deployment reaches `SUCCEEDED`, but a successful build is not the same as a healthy
   process — a build can succeed and the app crash on startup, which only the `RUNNING`-state
   check catches.
4. Attempts a best-effort HTTP health check (non-fatal).

Skips cleanly (not a failure) in two cases, checked in order: the project has no `src/apps/`
directory at all, or it does but `apps_deployment_manifest` is empty (every declared app is
`enabled = false`, or `apps.tfvars` declares no `apps` at all despite a leftover folder) — the
second check reads the manifest right after `terraform init`, before installing the Databricks CLI,
so a project with no enabled apps doesn't pay for a CLI install it won't use.

**⚠️ Forward-looking: revisit this whole imperative step once the provider supports code deployment
natively.** If/when `terraform-provider-databricks#5452` (or an equivalent) ships a code-deployment
argument on `databricks_app` (or a companion `databricks_app_deployment` resource), the `<apps_deploy_job>`
GitHub Actions job described above should be replaced — not merely updated — by that native
mechanism, and this section rewritten accordingly. This is a real design change, not a routine
version bump: it moves code deployment from an out-of-band CLI step back into `terraform apply`,
which affects rollback semantics (`git revert` + redeploy today, `terraform apply` of a reverted
commit under the native path), the `<apps_deploy_job>`/`<apps_plan_job>` `needs:` sequencing in
`<non_prod_apply_workflow>`/`<prod_apply_workflow>`, and this page's own "no native rollback" claim.

**Every deploy creates a new deployment object**, not an in-place update. The app tracks
`active_deployment` (currently serving) and `pending_deployment` (being prepared) — the running
process keeps serving the previous code while the new deployment builds, so a *build* failure
leaves the old version serving. This is not documented to hold for a deployment that builds
successfully but then crashes at startup — that case does take the app down, which is exactly what
step 3 above catches.

## Rollback

**There is no native rollback mechanism.** The Deployments API supports only Create and Get — no
update, delete, or "redeploy a previous deployment." The documented approach is to redeploy
previous source:

- **Prod**: `git revert` the offending PR, merge. `<prod_apply_workflow>` re-applies Terraform
  (workspace file uploads are md5-driven, so reverted files re-upload correctly) and `<apps_deploy_job>`
  ships the reverted code — same review and approval path as any other prod change.
- **Dev/UAT**: re-dispatch `<non_prod_apply_workflow>` from any earlier commit/branch.
- **Emergency stop**: `databricks apps stop <name>` (needs `CAN_MANAGE`) halts the active
  deployment and stops billing immediately. `databricks apps start <name>` later resumes the
  **last active deployment** without creating a new one — there is no `restart` command; restart
  is stop then start.

## Access control — per-app group and external consumers

Every app gets its own dedicated access group,
`<prefix>-app-<project_name>-<app_key>-<env_short>`, granted `CAN_USE`. One group **per app**, not
per project — different apps in the same project can have different external audiences (an
internal-only UI vs. an externally-callable API), and group membership is the entire access-control
mechanism: adding or removing a human or a service principal is a group-membership change, not a
Terraform apply.

`external_consumers` (e.g. `["partner_team"]`) creates a dedicated `databricks_service_principal` per
name and adds it to the app's group. **Terraform never creates the OAuth secret.**
`databricks_service_principal_secret` exists in the provider, but its `secret` attribute would
land as plaintext in Terraform state in the remote state backend — the worst possible place
to introduce that pattern for a credential handed to an external team. Secret generation is a
one-time, out-of-band, human step.

### Credential handoff to an external team

1. Declare the consumer in `external_consumers` — Terraform creates the SP and adds it to the
   app's access group (`CAN_USE` only).
2. A human generates the OAuth secret via the Databricks CLI or UI (never via Terraform) and
   delivers it out-of-band (a password manager or Vault entry) — never in a ticket, chat, or git. Set
   a rotation date and a revocation trigger at handoff time.
3. The consuming team exchanges `client_id` + `client_secret` at the workspace's `/oidc/v1/token`
   endpoint for a short-lived (~1h) bearer token with the `all-apis` scope (token scopes must be a
   superset of the app's own `user_api_scopes`), then calls
   `https://<app>-<id>.<region>.databricksapps.com/api/...` with
   `Authorization: Bearer <token>`. **No PATs** — long-lived, user-bound, not scopeable to a
   specific app. **Entra ID tokens cannot call apps directly** — it must be a Databricks OAuth
   token.
4. The app's *own* outbound secrets (e.g. a webhook credential to call back out) go through a
   `resources.secret` binding + `valueFrom` in `app.yaml`, never a literal `value:` — and never
   share the app's own auto-provisioned SP credentials (`DATABRICKS_CLIENT_ID`/`_SECRET`, injected
   automatically as env vars) with the consuming team; those are for the app's own outbound calls
   only.

Apps can never be made public or anonymous — every caller authenticates via SSO or OAuth, with no
exception. If a consuming team asks for an unauthenticated test endpoint, that request cannot be
satisfied by this platform; say so up front rather than discovering it mid-integration.

## Telemetry (Public Preview)

`enable_telemetry = true` persists traces/logs/metrics to three Unity Catalog Delta tables
(`otel_logs`, `otel_metrics`, `otel_spans`, or `<prefix>_otel_*` with `telemetry_table_prefix` set)
in the schema `schema_access` resolves to, over OpenTelemetry. Requires `schema_access` to resolve
to a real catalog (`"deployed"` or `"project"`, not `"none"`) — see the prod caveat above for why
`"deployed"` specifically is unavailable there today.

- **Terraform only writes the configuration** — the table location. Databricks creates the tables
  on first data flow after a redeploy, under the identity that configured the argument (the
  CI identity that applied the config — it needs the permissions the docs list); the app's own
  service principal needs no additional grant, since the write is platform-mediated via Zerobus,
  not performed by the app SP directly.
- `otel_logs` populates automatically once the app runs. `otel_spans`/`otel_metrics` need
  `opentelemetry-instrument` wrapping the app's own `command` in `app.yaml`, plus the matching
  `opentelemetry-*` packages in `requirements.txt` — see your repo's examples, e.g. `projects/<example_project>/src/apps/example_api/`
  and `.../example_ui/` for FastAPI and Streamlit examples respectively (the exact package set differs
  per framework).
- Region-gated — confirm the target workspace's Azure region is on Databricks' supported list
  before enabling.
- Billed as Lakeflow Connect / Zerobus Ingest, a separate line from app compute — check this before
  enabling on anything beyond a demo.
- Multiple apps can share one set of tables (leave `telemetry_table_prefix` unset); the
  `service_name` column distinguishes them in queries.
- **Zerobus does not support storage behind a Private Endpoint**; leave `enable_telemetry = false`
  for such catalogs (app creation fails otherwise, and no `schema_access` setting works around it).

## Cost

Apps **do not scale to zero.** They bill per hour of provisioned capacity while running —
`MEDIUM` ≈ 0.5 DBU/h, `LARGE` ≈ 1 DBU/h — for as long as the app exists and is not stopped, which
is different from every other compute in your repo (jobs, LDP pipelines, and the project's own SQL
warehouse all scale down or stop between runs). `databricks apps stop <name>` is the only way to
stop billing without deleting the app; `apps start` resumes the last active deployment.
Set `no_compute = true` (default `false`) to create the app resource without starting its compute —
useful when you want the app to exist ahead of a planned cutover without billing in the meantime.
The `<apps_deploy_job>` job excludes `no_compute` apps from `apps_deployment_manifest` entirely, since a
deployment's `RUNNING`-state check would otherwise fail every run for an app deliberately created
without compute — deploy it manually (`databricks apps deploy`) or flip `no_compute` to `false` and
re-apply once ready to cut over.

## Decommissioning — deleting `apps.tfvars` does NOT tear anything down

**Removing (or emptying) a project's `apps.tfvars` does not destroy its apps.** The CI workflows
gate the apps root's plan/apply on the file *existing* — `<non_prod_apply_workflow>`'s
`<validate_job>` and `<prod_apply_workflow>`'s `<tfvars_check_job>` both check `[ -f apps.tfvars ]`. Once the
file is gone, that check simply skips the apps root entirely — Terraform never runs against its
state again, so it never sees (or destroys) the app, its access group, its grants, or its
`databricks_mws_permission_assignment`. The app keeps running and billing. This is the same limitation `cicd-jobs.tfvars` has always had for
jobs/pipelines (removing that file doesn't destroy jobs either) — apps inherit it, they don't
introduce it, but the cost/exposure stakes are higher here since apps bill continuously and are
reachable from the internet by default, unlike a stopped job.

**To actually decommission an app**, either:
- `databricks apps stop <name>` (or the equivalent for every affected environment) to halt billing
  and access immediately, as an interim step, then
- Run a real `terraform destroy` against `terraform/databricks-apps` with the project's real backend
  config (`projects/<project>/apps/terraform.tfstate`) — out of band (CI has no destroy path; tear down manually) — before removing `apps.tfvars` from the branch.

Not automated: an automatic destroy-on-file-deletion path needs its own design (an accidental
file deletion must never be able to trigger destroying real infrastructure).

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| App is `RUNNING` but serves old code after a merge | The `<apps_deploy_job>` job did not run, or failed silently — check the workflow run, not just the Terraform apply |
| App builds and reaches `RUNNING` but requests time out | Wrong port binding — must be `0.0.0.0:$DATABRICKS_APP_PORT`, not `localhost` or a hardcoded port |
| `databricks_app.apps` precondition fails: "app.yaml ... was not found" | Missing `app.yaml`, or `directory` points at the wrong folder name |
| External caller gets 401/403 calling `/api/...` | Caller's token scope is not a superset of the app's `user_api_scopes`; or the route is not under `/api/` (only `/api/*` supports programmatic OAuth) |
| `enable_telemetry` fails the plan precondition | `schema_access` resolves to no catalog for this app/environment — either `schema_access = "none"`, or `"deployed"` in an environment with no deployed catalog (prod, today); switch to `schema_access = "project"` |
| Apply fails creating the app with telemetry enabled (403 on a `_delta_log` path) | Target catalog's storage is behind a Private Endpoint, which Zerobus does not support — set `enable_telemetry = false`; see "Telemetry" above |
| Apply fails: `Provider produced inconsistent result after apply` on `.telemetry_export_destinations` (planned empty list, now null) | When telemetry is off, set the block to `null`, not `[]` — the API omits the field and `[]` causes a perpetual diff |
| App SP cannot write to its own project's schema | `schema_access = "none"`, or `schema_access = "deployed"` in an environment with no deployed catalog (prod, today) — switch to `"project"` |
| Plan fails with a "schema ... not found" error from the provider | `schema_access` resolves to a schema that doesn't exist yet — for `"deployed"`, make sure the jobs root's apply (which creates it) has run first; the calling workflow's `needs:` edge should guarantee this in CI, but a manual out-of-order `terraform apply` can still hit it |
| Renamed an app key and got a brand-new app/URL | Expected — the app name is derived from the key, so renaming the key destroys and recreates the app, including its URL and deployment history. Treat app keys as permanent once an app is in prod |

## Quotas

100 apps per workspace, workspace-unique names (lowercase alphanumeric + hyphen — keys with
underscores are automatically transformed, see below).

## Naming

App names must be lowercase alphanumeric + hyphen only, but `apps` map keys follow the same
`^[A-Za-z0-9_]+$` convention as every other asset type in this module (underscores allowed). The
module derives the actual Databricks app name as `replace(lower("<key>-<project_name>"), "_", "-")`.
Because the project-name suffix is common to every entry and the transform lowercases the key,
two keys differing only by case (e.g. `Example_API` and `example_api`) resolve to the same Databricks app
name — a plan-time variable validation on `var.apps` rejects this before it can fail at apply.

The derived app name also cannot exceed **30 characters** — the Databricks Apps platform's hard
name-length limit (confirmed via the open-source `databricks/cli` repo, `libs/apps/prompt/prompt.go`'s
`MaxAppNameLength = 30` constant and its test suite; neither the Go SDK model, the Terraform
provider, nor its docs page declare this client-side — it's enforced server-side only). A separate
plan-time validation on `var.apps` in `variables_apps.tf` rejects a too-long `<key>-<project_name>`
combination before it can fail at apply. Note the CLI's own scaffold command reserves 4 of those 30
chars for a `dev-` prefix it prepends for bundle dev targets (hence a 26-char figure sometimes quoted
for *that* flow) — this module never adds such a prefix, so the real budget for `<key>-<project_name>`
here is the full 30.

Cross-project name collisions (two different projects' `<key>-<project_name>` combinations hashing to
the same string) are out of scope for this module's validation — there is no workspace-wide registry
of names to check against at plan time. It would surface as a real `terraform apply` failure
("already exists") in the rare event it happens; resolve it by renaming one project's app key.

## References

Paths below are in your repo, e.g. the assumed layout — not shipped with this skill.

- `terraform/modules/databricks_apps/{variables_core,variables_apps,locals,main,apps}.tf` — source
  of truth for the schema and every behavior described above.
- `terraform/modules/databricks_apps/tests/unit_apps.tftest.hcl` — the module test suite; also a
  good second source of worked examples.
- `terraform/modules/databricks_apps/README.md` — module-level overview (resources, schema access,
  inputs/outputs).
- `terraform/databricks-apps/README.md` — root-level overview (inputs, plan-time guardrails, `needs:`
  sequencing, state & deploy).
- `projects/<example_project>/` — end-to-end working example (`example_ui`,
  `example_api`) + `env-tf/*/apps.tfvars`.
- [Databricks Apps documentation](https://learn.microsoft.com/en-us/azure/databricks/dev-tools/databricks-apps/) —
  primary source for anything not covered above.
