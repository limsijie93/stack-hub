# `cicd-jobs.tfvars` — Full Schema Reference

> **Reference module schema (from a reference tfvars-driven Databricks Terraform module set) — adapt to your module.** Field names, defaults, and validations match that module; your module may differ.

> Authoritative field-level reference for every block available in `cicd-jobs.tfvars` (jobs &
> pipelines). This file also documents the sibling `apps.tfvars` schema in the "Apps schema"
> section below for convenience, but Databricks Apps deploy via a **separate**
> Terraform root, tfvars file, and state — see that section for the distinction.

## Architecture

```
projects/{project_name}/
├── env-tf/{env}/cicd-jobs.tfvars    ← Jobs & pipelines source of truth (terraform/databricks-jobs)
├── env-tf/{env}/apps.tfvars         ← Apps source of truth, separate root/state (terraform/databricks-apps)
└── src/
    ├── notebooks/                   ← Auto-uploaded .py/.sql/.scala/.r/.ipynb/.html/.dbc files
    ├── pipelines/{pipeline_key}/    ← Auto-uploaded pipeline source files
    ├── apps/{app_key}/              ← One folder = one Databricks App; app.yaml required at its root
    ├── files/                       ← Auto-uploaded to UC volumes
    ├── utils/, config/              ← Auto-uploaded to the Workspace
    ├── data/, dbt_project/, deployments/, models/, streaming/, tasks/, …
    │                                ← NOT auto-uploaded; use workspace_files = {}
    └── requirements.txt             ← Auto-uploaded for dependency injection

terraform/databricks-jobs/             ← Root module for jobs & pipelines (thin wrapper)
terraform/modules/databricks_cicd/   ← Core reusable module for jobs & pipelines
terraform/databricks-apps/             ← Root module for apps (thin wrapper)
terraform/modules/databricks_apps/   ← Core reusable module for apps
```

## Pipeline types

Only two types are supported.

### `type = "ldp"` (default, recommended)

- Convention-based: one folder `src/pipelines/{key}/` = one pipeline.
- All files auto-discovered via glob (`{root_path}/**`).
- Serverless + Photon auto-enabled; channel `CURRENT`.
- Unity Catalog defaults: `catalog = <feature_catalog>_{env}`, `schema = <refined_schema>`.
- Auto-injected Spark config: `env`, `project`, `target_catalog`, `landing_target_schema`, `refined_target_schema`, `feature_target_schema`, `legacy_base_path`.
- `notification_email_recipients` is **mandatory**.
- Cannot use explicit-only fields: `libraries`, `clusters`, `storage`, `target`, `run_as`, `event_log`, `filters`, `deployment`, `gateway_definition`, `name`, `channel`, `photon`, `serverless`, `edition`, `root_path`, `development`, `budget_policy_id`, `configuration`, `notifications`, `tables`.
- Uses resource `databricks_pipeline.ldp_pipelines`.

### `type = "explicit-ldp"`

- Full manual control over libraries, clusters, catalog, schema, etc.
- Must explicitly list every library.
- Uses resource `databricks_pipeline.pipelines`.
- Supports `storage`, `target`, `run_as`, `event_log`, `filters`, `deployment`, `gateway_definition`, `clusters`.
- `databricks-jobs/locals.tf` auto-injects catalog for serverless explicit-ldp pipelines when neither `catalog` nor `storage` is set.

## Auto-discovery & file upload

| Flag | Source | Destination | Extensions |
|---|---|---|---|
| `auto_discover_notebooks` | `src/notebooks/` | Workspace notebooks | `.py`, `.sql`, `.scala`, `.r`, `.ipynb`, `.html`, `.dbc` |
| `auto_discover_pipelines` | `src/pipelines/` | Workspace files | `.py`, `.ipynb`, `.sql`, `.dbc`, `.txt` |
| `auto_discover_volume_files` | `src/files/` | UC volumes | all |
| `auto_discover_project_files` | `src/{config,utils}/` | Workspace files | all |
| `auto_upload_requirements` | `src/requirements.txt` | Workspace file | `.txt` |

> Files already declared in `workspace_files` / `notebooks` are skipped by auto-discovery (no duplicate uploads). Every folder other than `config/`/`utils/` (e.g. `data/`, `dbt_project/`, `deployments/`, `models/`, `streaming/`, `tasks/`) is not auto-uploaded — use `workspace_files` for those.

## Custom Workspace file upload (`workspace_files`)

Auto-discovery uploads `src/config/` and `src/utils/` to `/Workspace/Users/{sp_username}/projects/<project>/src/…` via `databricks_workspace_file.project_files`. Use `workspace_files` for everything else:

- any other folder (`data/`, `dbt_project/`, `deployments/`, `models/`, `streaming/`, `tasks/`, or a custom one);
- `auto_discover_project_files = false`;
- a custom destination `path`;
- a task or pipeline references it by `/files/<key>` (see validation below).

```hcl
workspace_files = {
  utils_helper     = { source_path = "utils/helper.py" }
  utils_transforms = { source_path = "utils/transforms.py" }
  # path is optional — auto-derived from source_path when omitted
  # explicit path example:
  utils_config = {
    source_path = "utils/config.py"
    path        = "/Workspace/Users/mysp@example.com/projects/my_project/utils/config.py"
  }
}
```

- **`source_path`** — required, relative to the project's `src/` folder (e.g. `utils/helper.py`)
- **`path`** — optional; defaults to `/Workspace/Users/{sp_username}/projects/<project>/src/<source_path>` (the same location auto-discovery uses); explicit absolute paths must stay under the project location
- Any `spark_python_task`, `for_each_task.spark_python_task`, or pipeline `libraries.file` entry referencing a `/files/<key>` path **must** have a matching **key** in `workspace_files` — plan-time preconditions in `terraform/databricks-jobs/main.tf`; auto-discovered uploads do not satisfy them
- Source: `terraform/modules/databricks_cicd/{variables_files,locals,main}.tf`

## LDP auto-injected configuration (reserved keys)

Set in `databricks_pipeline.ldp_pipelines.configuration` via `merge()` — module keys always win (user `pipeline_configuration` is lower priority):

| Key | Source |
|---|---|
| `env` | `var.environment` |
| `project` | `var.project_name` |
| `target_catalog` | `coalesce(var.ldp_target_catalog, "<feature_catalog>_${var.environment}")` |
| `landing_target_schema` | `var.landing_target_schema` (default `<landing_schema>`) |
| `refined_target_schema` | `var.refined_target_schema` (default `<refined_schema>`) |
| `feature_target_schema` | `var.feature_target_schema` (default `<feature_schema>`) |
| `legacy_base_path` | Per-env storage account path. |
| `pipeline_base_name` | Map key of the pipeline (`each.key`), before the `-{project_name}` suffix |
| `<metadata_framework>.project.root` | `{project_location}/src/config/<metadata_dir>` — **only injected when that directory exists at plan time** |

> **`deployed` is a convention key, not reserved.** Set `deployed = "true"` in `pipeline_configuration` per pipeline to
> signal deployment state. The module never injects it automatically. All keys listed above are reserved — the
> `variables_pipelines.tf` validation will reject any attempt to set them in `pipeline_configuration`.

## LDP normalized defaults

| Field | Default |
|---|---|
| `name` | `{pipeline_key}-{project_name}` |
| `catalog` | `<feature_catalog>_{environment}` |
| `schema` | `var.ldp_default_schema` = `<refined_schema>` |
| `directory` | `coalesce(pipeline_cfg.directory, pipeline_key)` |
| `root_path` | `{project_location}/src/pipelines/{directory}` |
| `development` | `var.environment != "prod"` |
| `serverless` | `true` (hardcoded) |
| `photon` | `true` (hardcoded) |
| `channel` | `CURRENT` (hardcoded) |

## Top-level fields

```hcl
project_name                = "my_project"          # required, must match projects/ folder, ^[a-z0-9_-]+$
project_members             = ["user@example.com"]  # required
auto_discover_notebooks     = true                  # default: true
auto_discover_volume_files  = true                  # default: true
auto_discover_project_files = true                  # default: true
auto_discover_pipelines     = true                  # default: true
auto_upload_requirements    = true                  # default: true

workspace_files = {                              # default: {} — files outside src/config/ and src/utils/
  dbt_project_yml = { source_path = "dbt_project/dbt_project.yml" }  # source_path is relative to src/
}

create_deployed_schema = true   # default: true — CI/CD-deployed schema+volume (dev/uat only; see below)
deployed_catalog_name  = null   # default: null — auto-derives "<deployed_catalog>_{environment}" in dev/uat; resolves to "<prod_project_catalog>" in prod (drives UC upload path resolution there too)
```

> `apps` is **not** a `cicd-jobs.tfvars` field — Databricks Apps have their own `apps.tfvars` file,
> root, and state. See "Apps schema" below and `references/APPS.md`.

### CI/CD-deployed catalog — dev/uat only, automatic

Every project with a `cicd-jobs.tfvars` automatically gets a schema + `EXTERNAL` volume in the shared
`<deployed_catalog>_<env>` catalog (writable only by the project SP; the project group gets
read-only) — separate from the interactive `projects_<env>.<project>` schema (dev/uat) created by
the project-inception root, which stays group-owned. No action needed for normal usage:
`create_deployed_schema` defaults `true` and `deployed_catalog_name` auto-derives to
`<deployed_catalog>_{environment}` in dev/uat. Schema/volume/grant *creation* is
still a true no-op in prod (`create_deployed_schema` is forced `false` at the `databricks-jobs` root
call) — prod's single project catalog is separately named `<prod_project_catalog>`
but is owned by the project-inception root, not this dev/uat-only
CI/CD-deployed-catalog mechanism. `deployed_catalog_name` still resolves to `<prod_project_catalog>`
in prod, though, since UC file uploads (`src/files/**` and default-catalog `unity_catalog_files`)
route through it in every environment. Set `create_deployed_schema = false` only to opt a specific
project out of dev/uat resource creation — if you do, also disable UC uploads that rely on default
catalog routing (`auto_discover_volume_files = true`, or any `unity_catalog_files` entry omitting
`catalog_name`) or set `catalog_name` explicitly on every entry; otherwise the module's plan-time
guard rejects the config, since nothing would create the schema/volume the upload targets. Full
resource/grant detail:
`terraform/modules/databricks_cicd/README.md` (CI/CD-deployed catalog section).

## Permissions schema

The project group always gets an `access_control` entry on every enabled job/pipeline — this isn't
configurable, only its *level* is. `job_permissions`/`pipeline_permissions` overrides only make
sense in **prod**: dev/uat already default to full run access (`project_group_can_run = true`), so
setting either field there is a no-op. Worked example, including an exception shape under the example policy below (comment +
linked ticket): `projects/<example_project>/env-tf/prod/cicd-jobs.tfvars`
(Permissions Configuration section).

| Resource | Levels (fixed, all envs) | dev/uat default | prod default |
|---|---|---|---|
| Job | `CAN_VIEW`, `CAN_MANAGE_RUN` | `CAN_MANAGE_RUN` (`project_group_can_run = true`) | `CAN_VIEW` (`false`) |
| Pipeline | `CAN_VIEW`, `CAN_RUN` | `CAN_RUN` (`true`) | `CAN_VIEW` (`false`) |

```hcl
# Root-wide — applies to every job/pipeline in this cicd-jobs.tfvars, not per-key.
job_permissions = {
  project_group_can_run = true                             # optional; null = env default (see table above)
  run_access_emails     = ["user@example.com"]              # optional; default []. Each gets CAN_MANAGE_RUN directly.
  contributor_groups    = ["<contributor-group>"] # optional; default: var.contributor_groups[env]
}

pipeline_permissions = {
  project_group_can_run = true   # maps to CAN_RUN instead of CAN_MANAGE_RUN
  run_access_emails     = ["user@example.com"]
}

# Per-resource overrides for one specific job/pipeline (by id), instead of the root-wide settings above.
permissions = {
  "job_custom" = {
    job_id = "123456789"
    access_control = [
      { user_name = "user@example.com", permission_level = "CAN_MANAGE_RUN" }
    ]
  }
}
```

There is no `group_name` field on `job_permissions`/`pipeline_permissions` — by design, not an
oversight. **Run-level access (`CAN_MANAGE_RUN`/`CAN_RUN`) may only go to the project group or a named
individual, never a group.** This is enforced by Terraform validation on the standalone `permissions`
map too: a `group_name` entry granted `CAN_MANAGE_RUN` on a `job_id` or `CAN_RUN` on a `pipeline_id`
fails `terraform plan` outright — a real, hard validation, not just a documented convention.

**Permission exceptions.** Setting `project_group_can_run = true` above the env default in the table
above, or adding anyone to `run_access_emails`, is an exception — not a routine config choice.
Terraform can't check process, so that half is on the author and reviewer. An example policy you
may adopt:

1. Add an inline comment at the grant stating the reason and a removal-by date.
2. Open an exception ticket in your tracker with a matching removal date (the example window
   used here is ≤ 3 months).

```hcl
# PERMISSION EXCEPTION — remove by YYYY-MM-DD.
# Reason: <why this user needs elevated access>.
# Exception ticket: <ticket-url>
job_permissions = {
  run_access_emails = ["user@example.com"]
}
```

## Jobs schema

```hcl
jobs = {
  "job_key" = {                                       # key: ^[A-Za-z0-9_]+$
    # ── Required fields ──
    description         = "Job description"           # required, non-empty
    tasks               = { ... }                     # required, map of tasks (see Task schema)
    email_notifications = {                           # required for enabled jobs
      on_failure = ["user@example.com"]               # required: at least one recipient
      on_start   = []
      on_success = []
      on_duration_warning_threshold_exceeded = []
      no_alert_for_skipped_runs = false
    }

    # ── Optional fields ──
    name                = ""                          # default: "" (uses job_key)
    perf_target         = "STANDARD"                  # "STANDARD" | "PERFORMANCE_OPTIMIZED" — the latter costs
                                                       # more (higher DBU rate for faster serverless startup /
                                                       # lower latency); only use it with a stated latency/SLA
                                                       # reason, not as a default to copy from another job.
    max_concurrent_runs = 1
    timeout_seconds     = 3600
    budget_policy_id    = null
    tags                = {}
    enabled             = true
    inject_requirements = false                       # true = inject src/requirements.txt

    # ── Pick one of schedule / trigger / continuous ──
    schedule = {
      quartz_cron  = "0 0 6 * * ?"
      timezone_id  = "UTC"
      pause_status = "PAUSED"                         # "PAUSED" | "UNPAUSED"
    }
    trigger = {
      pause_status = "PAUSED"
      file_arrival = { url = "...", min_time_between_triggers_seconds = null, wait_after_last_change_seconds = null }
      periodic     = { interval = 1, unit = "HOURS" } # HOURS | DAYS | WEEKS
      table        = { condition = null, table_names = [], wait_after_last_change_seconds = null }
    }
    continuous = { pause_status = "PAUSED" }

    # ── Advanced ──
    run_as = { user_name = null, service_principal_name = null }
    queue  = { enabled = true }
    parameters = [{ name = "p1", default = "v1" }]
    health     = { rules = [{ metric = "RUN_DURATION_SECONDS", op = "GREATER_THAN", value = 3600 }] }
    webhook_notifications = { ... }
    notification_settings = { no_alert_for_skipped_runs = false, no_alert_for_canceled_runs = false }
    git_source    = { ... }
    job_clusters  = [{ ... }]                         # non-serverless
    environments  = [{ ... }]
    task_to_notebook_mapping = {}
  }
}
```

## Task schema (within a job)

```hcl
tasks = {
  "task_key" = {                                      # key: ^[A-Za-z0-9_]+$
    description               = ""
    depends_on                = ["other_task_key"]
    timeout_seconds           = 1800
    max_retries               = 1
    min_retry_interval_millis = null
    retry_on_timeout          = false
    run_if                    = null                  # "ALL_SUCCESS", "AT_LEAST_ONE_SUCCESS", etc.
    job_cluster_key           = null
    existing_cluster_id       = null
    environment_key           = null                  # auto-set to "Default" for notebook_task,
                                                      # spark_python_task, dbt_task, python_wheel_task
                                                      # when inject_requirements = true on the parent job
                                                      # AND the task has no cluster compute configured
                                                      # (job_cluster_key and existing_cluster_id are both null).
                                                      # Non-code tasks (pipeline_task, condition_task, etc.)
                                                      # always receive null — do not set manually for these.
    enabled                   = true

    # ── Pick exactly one task-type block ──

    notebook_task = {
      notebook_path   = null                          # auto → src/notebooks/{task_key}
      base_parameters = { "key" = "value" }           # module always merges { project_location = "..." };
                                                      # user values are preserved; project_location wins on conflict
      source          = "WORKSPACE"
      warehouse_id    = null
    }

    pipeline_task = {
      pipeline_key = "my_pipeline"                    # must match a key in pipelines {}
      pipeline_id  = null
      full_refresh = false
    }

    spark_python_task = {
      python_file = "/Workspace/<path>/src/tasks/my_script.py"
      parameters  = []
      source      = "WORKSPACE"
    }

    sql_task = {
      warehouse_id = "abc123"
      parameters   = {}
      query        = { query_id = "..." }             # one of: query, dashboard, alert, file
      dashboard    = { dashboard_id = "..." }
      alert        = { alert_id = "..." }
      file         = { path = "...", source = null }
    }

    dbt_task = {
      commands           = ["dbt run"]
      project_directory  = null                       # defaults to {project_location}/dbt_project
      profiles_directory = null
      catalog            = null
      schema             = null
      warehouse_id       = null
      source             = "WORKSPACE"
    }

    condition_task = {
      left  = "{{tasks.check.values.status}}"
      right = "success"
      op    = "EQUAL_TO"                              # EQUAL_TO, NOT_EQUAL, etc.
    }

    run_job_task = {
      job_id         = 12345
      job_parameters = {}
    }

    for_each_task = {
      inputs      = "{{tasks.generate.values.items}}"
      concurrency = null
      task = {
        task_key    = "inner_task"
        description = ""
        notebook_task = { ... }                       # or spark_python_task
        libraries     = []
      }
    }

    spark_jar_task    = { main_class_name = "...", parameters = [] }
    spark_submit_task = { parameters = [] }
    python_wheel_task = { package_name = "...", entry_point = null, parameters = [], named_parameters = {} }

    # ── Task-level notifications / libs ──
    email_notifications = { ... }
    health              = { rules = [{ ... }] }
    libraries = [
      { pypi  = { package = "pandas", repo = null } },
      { maven = { coordinates = "...", repo = null, exclusions = [] } },
      { cran  = { package = "...", repo = null } },
      { whl   = "/path/to/wheel.whl" },
      { jar   = "/path/to/jar.jar" },
      { egg   = "/path/to/egg.egg" },
    ]
  }
}
```

## Pipelines schema

```hcl
pipelines = {
  # ── LDP (default) ──
  "pipeline_key" = {
    type       = "ldp"                                # default
    continuous = false
    enabled    = true

    notification_email_recipients = ["user@example.com"]  # mandatory
    description = "Pipeline description"                   # mandatory

    name                   = ""                       # default: uses pipeline_key
    catalog                = null                     # default: <feature_catalog>_{env}
    schema                 = null                     # default: <refined_schema>
    directory              = null                     # default: pipeline_key
    notify_on_success      = false
    requirements_file      = null                     # e.g. "requirements.txt" (relative)
    python_dependencies    = []                       # e.g. ["pandas", "scikit-learn"]
    pipeline_configuration = {}                       # cannot use reserved keys
    tags = {}

    # ⚠️ Forbidden for LDP: libraries, clusters, storage, target, run_as,
    #                       event_log, filters, deployment, gateway_definition
  }

  # ── explicit-ldp ──
  "pipeline_key" = {
    type    = "explicit-ldp"
    enabled = true

    name        = ""
    description = "Pipeline description"              # required
    catalog     = "my_catalog"                        # ⛔ cannot combine with storage
    schema      = "my_schema"                         # ⛔ cannot combine with target
    storage     = null
    target      = null
    root_path   = null
    directory   = null

    serverless  = true
    photon      = false
    edition     = "ADVANCED"                          # CORE | PRO | ADVANCED
    channel     = "CURRENT"                           # CURRENT | PREVIEW
    continuous  = false
    development = false

    libraries = [                                     # at least one required
      { file     = { path = "src/pipelines/my_pipeline/ingest.py" } },
      { notebook = { path = "/Workspace/path/to/notebook" } },
      { glob     = { include = "/path/**" } },
    ]

    clusters = [{                                     # ⛔ cannot combine with serverless
      label               = "default"
      num_workers         = 2
      node_type_id        = "Standard_DS3_v2"
      driver_node_type_id = null
      custom_tags         = {}
      autoscale           = { min_workers = 1, max_workers = 4, mode = "ENHANCED" }
    }]

    notifications = [{
      email_recipients = ["user@example.com"]
      alerts           = ["on-update-failure", "on-update-fatal-failure", "on-flow-failure"]
    }]

    configuration = { "key" = "value" }
    tags          = {}

    budget_policy_id      = null
    allow_duplicate_names = false
    tables                = []
    run_as                = { user_name = null, service_principal_name = null }
    environment           = { dependencies = ["-r /path/requirements.txt"] }
    deployment            = { kind = "BUNDLE", metadata_file_path = null }
    filters               = { include = [], exclude = [] }
    event_log             = { name = "...", catalog = null, schema = null }
    gateway_definition    = {                         # Ingestion Gateway (photon=false)
      connection_id           = null
      connection_name         = null
      gateway_storage_catalog = "..."
      gateway_storage_name    = "..."
      gateway_storage_schema  = "..."
    }
  }
}
```

## Apps schema (`apps.tfvars`, separate root/state)

> Deployed by `terraform/databricks-apps/` → `modules/databricks_apps`, from
> `projects/<name>/env-tf/<env>/apps.tfvars` — **not** `cicd-jobs.tfvars`, and not the same
> Terraform state (`projects/<project>/apps/terraform.tfstate` vs.
> `projects/<project>/jobs/terraform.tfstate`). A project may have `apps.tfvars` with no
> `cicd-jobs.tfvars` at all.
>
> Full reference (deploy lifecycle, rollback, credential handoff, the prod schema-access caveat,
> troubleshooting): [`references/APPS.md`](APPS.md). This section is the field-level schema only.

```hcl
apps = {
  "app_key" = {                                    # key: ^[A-Za-z0-9_]+$
    # ── Required ──
    description = "..."                            # only required field

    # ── Optional ──
    enabled      = true                             # default true; false = destroys the app + its access group/grants (use no_compute to park)
    directory    = null                              # default: app_key
    compute_size = null                              # default: Databricks MEDIUM; or "LARGE"
    no_compute   = false                             # default false; true → app exists but compute is not started (no billing until `apps start`)

    resources = {}                                   # default {}; one sub-object per entry, exactly one type set
    #   "<name>" = { sql_warehouse    = { id = null, permission = "CAN_USE" } }      # id null → auto-resolve project warehouse
    #   "<name>" = { serving_endpoint = { name = "...", permission = "CAN_QUERY" } }
    #   "<name>" = { secret           = { scope = "...", key = "...", permission = "READ" } }
    #   "<name>" = { uc_securable     = { securable_full_name = "...", securable_type = "TABLE", permission = "SELECT" } }
    #   "<name>" = { job              = { id = "...", permission = "CAN_MANAGE_RUN" } }
    #   also: database, genie_space, postgres, app, experiment

    user_api_scopes               = []               # default []; e.g. ["sql"] for on-behalf-of-user apps
    schema_access                 = "deployed"        # default "deployed"; also "project" (works in prod) or "none"
    enable_telemetry              = false             # default false — Public Preview; requires schema_access != "none"
    telemetry_table_prefix        = null              # default null → unprefixed otel_logs/otel_metrics/otel_spans
    external_consumers            = []                # default []; e.g. ["partner_team"] — creates a dedicated SP per name, added to the app's access group

    app_permissions = {
      project_group_can_use = null                   # default null → true in dev/uat, false in prod
      use_access_emails     = []                       # default []; named individuals → CAN_USE
    }
  }
}
```

Not offered: `contributor_groups` (no `CAN_VIEW` tier exists for apps — see APPS.md), `budget_policy_id`
(always the project's own policy), `env` (no such argument on `databricks_app` — use `app.yaml` +
`valueFrom` instead).

**Worked example with every field set to a real value (not a placeholder)** — see APPS.md's "Worked
example — every dev-configurable field set" section for the full annotated version with rationale
per field:

```hcl
apps = {
  report_api = {
    description = "Report generation API for the downstream Order Service"
    enabled      = true
    directory    = "report_service_api"
    compute_size = "LARGE"
    no_compute   = false
    resources = {
      warehouse       = { sql_warehouse    = { permission = "CAN_USE" } }
      llm             = { serving_endpoint = { name = "databricks-claude-sonnet-4", permission = "CAN_QUERY" } }
      callback_secret = { secret           = { scope = "report_api", key = "callback_token", permission = "READ" } }
    }
    user_api_scopes               = []
    schema_access                 = "deployed"
    enable_telemetry              = true
    telemetry_table_prefix        = "report_api"
    external_consumers            = ["order_service"]
    app_permissions = {
      project_group_can_use = true
      use_access_emails     = ["oncall@example.com"]
    }
  }
}
```

## Minimal example

```hcl
project_name    = "my_project"
project_members = ["dev@example.com"]

jobs = {
  "daily_etl" = {
    description = "Daily ETL pipeline"
    tasks = {
      "run_pipeline" = {
        description   = "Trigger feature store pipeline"
        pipeline_task = { pipeline_key = "my_feature_store", full_refresh = false }
      }
      "post_process" = {
        description     = "Run post-processing notebook"
        depends_on      = ["run_pipeline"]
        notebook_task   = { base_parameters = {} }    # auto → src/notebooks/post_process
        timeout_seconds = 1800
      }
    }
    email_notifications = { on_failure = ["dev@example.com"] }
  }
}

pipelines = {
  "my_feature_store" = {
    description                   = "Feature store pipeline"
    notification_email_recipients = ["dev@example.com"]
    # type = "ldp" is default — folder src/pipelines/my_feature_store/ must exist
  }
}
```

## Validation summary

| Rule | Scope | Constraint |
|---|---|---|
| Job key | `^[A-Za-z0-9_]+$` | No hyphens |
| Task key | `^[A-Za-z0-9_]+$` | No hyphens |
| Job `description` | required | Non-empty |
| Job `on_failure` | required | ≥1 email for enabled jobs |
| Job `schedule`/`trigger`/`continuous` in prod | required | Every enabled prod job must set one of `schedule`, `trigger`, or `continuous` (disabled jobs exempt) |
| Job `inject_requirements` | requires `auto_upload_requirements = true` | Cannot inject without uploading |
| `spark_python_task.python_file` | absolute path | Must start with `/` |
| `for_each_task.inputs` | valid JSON array | Must parse as JSON array |
| Pipeline `type` | `"ldp"` or `"explicit-ldp"` | No bare `"explicit"` |
| Pipeline `description` | required | Non-empty |
| LDP `notification_email_recipients` | required | ≥1 email |
| LDP forbidden fields | libraries, clusters, storage, target, run_as, event_log, filters, deployment, gateway_definition, name, channel, photon, serverless, edition, root_path, development, budget_policy_id, configuration, notifications, tables | Cannot be set |
| LDP reserved config keys | env, project, target_catalog, landing_target_schema, refined_target_schema, feature_target_schema, legacy_base_path, `pipeline_base_name`, `<metadata_framework>.project.root` | Cannot override via `pipeline_configuration` |
| LDP `requirements_file` | relative path | No `/` prefix, no `..` |
| `environment_key` auto-injection | `inject_requirements = true` + code task type (`notebook_task`, `spark_python_task`, `dbt_task`, `python_wheel_task`) + no cluster compute (`job_cluster_key` / `existing_cluster_id` both null) | Auto-set to `"Default"` — no manual value needed |
| `inject_requirements` + cluster compute | `inject_requirements = true` + code task with `job_cluster_key` or `existing_cluster_id` | Rejected — serverless compute required for code tasks when using `inject_requirements` |
| explicit-ldp `catalog`+`storage` | mutually exclusive | — |
| explicit-ldp `schema`+`target` | mutually exclusive | — |
| explicit-ldp `libraries` | required | ≥1 entry |
| explicit-ldp `serverless`+`clusters` | mutually exclusive | — |
| explicit-ldp serverless | needs `catalog` or `storage` | Required |
| explicit-ldp file library paths | `.py`, `.ipynb`, `.sql`, `.dbc` | Extension enforced |
| Run-level access grantee (`CAN_MANAGE_RUN`/`CAN_RUN` via the standalone `permissions` map) | must be a named `user_name` or `service_principal_name`, never a `group_name` | **Enforced by Terraform validation** — a `group_name` grant on a `job_id`/`pipeline_id` fails `terraform plan` |
| Permission exception (`project_group_can_run = true` above env default, or any `run_access_emails` entry) | Example policy: comment with reason + removal date, plus a linked exception ticket with a matching removal date | **Process rule, not Terraform-enforced** — won't fail `terraform validate`; reviewers should block on it |

### Apps validation (`apps.tfvars`, enforced in `modules/databricks_apps`)

| Rule | Scope | Constraint |
|---|---|---|
| App key | `^[A-Za-z0-9_]+$` | No hyphens; app name derived as `replace(lower("{key}-{project_name}")`, `"_"`, `"-")`, asserted unique after transform |
| App `description` | required | Non-empty |
| App `app.yaml` | required | Plan-time precondition — `fileexists()` on `src/apps/<directory>/app.yaml`, fails plan with a clear message if missing |
| App `compute_size` | optional | `null`, `"MEDIUM"`, or `"LARGE"` only |
| App `resources.<name>` | exactly one type per entry | Must set exactly one of `sql_warehouse`, `serving_endpoint`, `secret`, `uc_securable`, `job`, `database`, `genie_space`, `postgres`, `app`, `experiment` |
| App `resources.<name>.sql_warehouse.permission` | enum | `CAN_USE`, `CAN_MANAGE`, or `IS_OWNER` |
| App `resources.<name>.serving_endpoint.permission` | enum | `CAN_QUERY`, `CAN_VIEW`, or `CAN_MANAGE` |
| App `resources.<name>.secret.permission` | enum | `READ`, `WRITE`, or `MANAGE` |
| App `schema_access` | enum | `"deployed"` (default), `"project"`, or `"none"` only |
| App `schema_access = "deployed"` in an environment with no deployed catalog (prod, today) | plan-time precondition | Fails clearly instead of silently granting nothing — use `"project"` instead |
| App `enable_telemetry` | requires `schema_access != "none"` and a resolvable catalog | Plan-time precondition — fails if `schema_access = "none"`, or `"deployed"` with no deployed catalog for the env (prod, today) |
| App `external_consumers` entries | `^[A-Za-z0-9_-]+$` | Used to build the created service principal's display name |

## Deployment

- **Dev/UAT**: push branch → run the `<non_prod_apply_workflow>` workflow.
- **Prod**: PR to `main` → on merge, `<prod_apply_workflow>` auto-applies.
- **Apps use the same two workflows**, but run a separate `<apps_plan_job>` job against
  `terraform/databricks-apps/` and `apps.tfvars` — independent state from the `<plan_job>`
  job above, sequenced after it (`needs:`) so `schema_access = "deployed"` can resolve. Either job
  skips cleanly when the project has no corresponding tfvars file.
- **Apps code deploy**: the Terraform apply above creates the `databricks_app` resource but never
  deploys its code. Both workflows run an additional `<apps_deploy_job>` job immediately after the apps
  apply, which runs `databricks apps deploy` per enabled app and verifies it reaches `RUNNING`
  state. See [`references/APPS.md`](APPS.md#deploy-lifecycle).
