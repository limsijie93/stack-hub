# `<env>.tfvars` — Full Schema Reference

> **Example schema — adapt to your module.**

> Authoritative field-level reference for every block in the environment foundation `<env>.tfvars`.

### Azure infrastructure

```hcl
uc_access_connector_id = "/subscriptions/.../accessConnectors/<access-connector-name>"

# Destroy toggles
skip_protected_resource_creation = false   # true = skip lifecycle-protected resources (clean teardown)
prevent_group_destroy            = false   # true = universal groups get lifecycle { prevent_destroy }
```

### Environment identity

```hcl
name_prefix             = "<prefix>"                              # prefix for generated names
enable_cluster_policies = true
port                    = "443"
admin_group             = "<admin-group>"
contributor_group       = "<contributor-group>"
environment             = "dev"                                   # dev | uat | prod — drives env_short
```

### Storage URLs (ADLS Gen2 containers)

```hcl
url_feature = "abfss://feature@<storage_account>.dfs.core.windows.net/"
url_volume  = "abfss://volume@<storage_account>.dfs.core.windows.net/"
url_project = "abfss://project@<storage_account>.dfs.core.windows.net/"

# dev/uat only — omit in prod.tfvars; prod's project catalog uses url_project.
url_project_deployed = "abfss://project-deployed@<storage_account>.dfs.core.windows.net/"
url_volume_deployed  = "abfss://volume-deployed@<storage_account>.dfs.core.windows.net/"

workspace_binding_type = "BINDING_TYPE_READ_WRITE"
```

| URL | Holds |
|---|---|
| `url_feature` | Feature-store external tables (feature catalog) |
| `url_volume`  | UC volumes (project binaries, files, models) |
| `url_project` | Project catalog external tables |
| `url_project_deployed` | CI/CD-deployed project catalog external tables (dev/uat only; default `null`) |
| `url_volume_deployed` | CI/CD-deployed project UC volumes (dev/uat only; default `null`) |

### Databricks wiring

```hcl
databricks_workspace_host = "<workspace-host-url>"
databricks_account_host   = "<account-host-url>"
databricks_account_id     = "<account-guid>"
```

### Access grants

All five lists are **env-wide defaults** applied across catalogs / locations / workspace objects. Per-catalog overrides live inside `catalog_configurations`.

```hcl
catalog_grants = [                                  # applied to standard catalogs
  { principal = "<admin-group>",       privileges = ["ALL_PRIVILEGES"] },
  { principal = "<contributor-group>", privileges = ["USE_CATALOG", "BROWSE"] },
  { principal = "<reader-group>",      privileges = ["USE_CATALOG", "BROWSE"] },
]

foreign_grants = [                                  # default for foreign catalogs
  { principal = "...", privileges = ["ALL_PRIVILEGES"] },
  { principal = "...", privileges = ["USE_CATALOG", "BROWSE", "SELECT", "USE_SCHEMA"] },
]

schema_grants = [                                   # applied to each created schema
  { principal = "<schema-writer-group>",
    privileges = ["APPLY_TAG", "CREATE_TABLE", "CREATE_MATERIALIZED_VIEW",
                  "USE_SCHEMA", "MODIFY", "SELECT", "REFRESH"] },
]

workspace_grants = [                                # workspace folder-level
  { principal = "<contributor-group>", privilege = "CAN_READ" },
  { principal = "<prefix>-<platform-sp>-<env_short>",   privilege = "CAN_RUN"  },
]

location_grants = [                                 # external location access
  { principal  = "<contributor-group>",
    privileges = ["CREATE_EXTERNAL_TABLE", "READ_FILES", "WRITE_FILES"] },
]
```

### Universal-group privilege policy

Universal groups (`<prefix>-universal-<schema>-<env_short>`) get baseline access on every catalog. These knobs override the default `["USE_CATALOG", "BROWSE"]` per catalog category:

```hcl
universal_group_foreign_catalog_privileges = ["USE_CATALOG", "BROWSE", "USE_SCHEMA", "SELECT"]
universal_group_feature_catalog_privileges = ["USE_CATALOG", "BROWSE"]
# Default (non-feature/foreign): ["USE_CATALOG", "BROWSE"]
```

### `catalog_configurations` — the main knob

```hcl
catalog_configurations = {

  # ── Project host catalog ──
  projects = {
    catalog_name     = "projects_<env>"              # dev/uat; prod.tfvars uses "<prod_project_catalog>"
    catalog_category = "standard"
    catalog_type     = "project"                    # schemas added by databricks_project
  }

  # ── CI/CD-deployed project catalog (dev/uat only) ──
  deployed_catalog = {
    catalog_name     = "<deployed_catalog>_<env>"
    catalog_category = "standard"
    catalog_type     = "project"                    # same additive-grant / no-schema behavior as projects
    deployed         = true                          # routes storage_root to url_project_deployed instead of url_project
  }                                                   # per-project schemas added later by databricks_cicd

  # ── Feature catalog with default + optional schemas ──
  <feature_catalog> = {
    catalog_name                    = "<feature_catalog>_<env>"
    catalog_category                = "standard"
    catalog_type                    = "feature"
    create_default_schema           = true
    default_schema_name             = "<default_schema>"
    default_schema_comment          = "Default feature schema"
    default_schema_create_group     = true          # mints <prefix>-local-<default_schema>-<env_short>
    default_schema_group_privileges = ["APPLY_TAG", "CREATE_TABLE", "CREATE_MATERIALIZED_VIEW",
                                       "USE_SCHEMA", "MODIFY", "SELECT", "REFRESH"]
    optional_schema_suffixes = [
      { suffix = "_landing", comment = "Raw ingested data" },
      { suffix = "_refined", comment = "Refined / pre-promotion data" },
    ]
    schema_grants = [
      { principal = "<prefix>-group-<feature_store_project>-<env_short>",
        privileges = ["APPLY_TAG","CREATE_TABLE","CREATE_MATERIALIZED_VIEW",
                      "USE_SCHEMA","MODIFY","SELECT","REFRESH"] },
    ]
  }

  # ── Foreign (Snowflake) catalog ──
  <foreign_key>_<env> = {
    catalog_name     = "<foreign_catalog>_<env>"
    catalog_category = "foreign"
    database         = "<SNOWFLAKE_DB>"             # Snowflake DB name (case-sensitive)
    # foreign_grants = [...]                        # optional override of top-level foreign_grants
  }
}
```

#### Standard feature catalog — field reference

| Field | Purpose |
|---|---|
| `catalog_name` | Fully-qualified UC catalog name (usually env-suffixed). |
| `catalog_category` | `"standard"` for feature/project, `"foreign"` for Snowflake. |
| `catalog_type` | `"feature"` \| `"project"` (within `standard`). |
| `create_default_schema` | Create a baseline schema (`<default_schema>`). |
| `default_schema_name` | Name of the default schema. |
| `default_schema_comment` | Human-readable description. |
| `default_schema_create_group` | Mint a local group `<prefix>-local-<schema>-<env_short>`. |
| `default_schema_group_privileges` | Privileges granted to that local group. |
| `optional_schema_suffixes` | List of `{ suffix, comment }` producing `<default>_<suffix-stripped>`. |
| `schema_grants` | Per-schema principals + privileges (overrides `schema_grants` top-level). |

#### Project catalog

Only `catalog_name`, `catalog_category = "standard"`, `catalog_type = "project"` — schemas are added later by the project inception root (`<project_root>`).

- `deployed` (optional, default `false`) — set `true` on a **second** `catalog_type = "project"` entry (dev/uat only) to make it the CI/CD-deployed catalog: its `storage_root` resolves from `url_project_deployed` instead of `url_project`. Per-project schemas for this catalog are added later by `<cicd_jobs_root>` (via `modules/databricks_cicd`), not by `<project_root>`. Requires `url_project_deployed` (and, for the sibling deployed volume, `url_volume_deployed`) to be set. Never set in `prod.tfvars`.

#### Foreign catalog

| Field | Purpose |
|---|---|
| `catalog_name` | UC catalog name mirroring the Snowflake DB. |
| `catalog_category` | `"foreign"`. |
| `database` | Snowflake database identifier (e.g. `<SNOWFLAKE_DB>`). |
| `foreign_grants` | (Optional) override the env-wide `foreign_grants`. |

### Generated identities (for reference)

| Resource | Pattern | Provider alias |
|---|---|---|
| Universal schema group | `<prefix>-universal-<schema>-<env_short>` | `databricks.account` |
| Local schema group | `<prefix>-local-<schema>-<env_short>` | `databricks.account` |
| Project service principal | `<prefix>-sp-<project>-<env_short>` | `databricks.account` |
| Project group | `<prefix>-group-<project>-<env_short>` | `databricks.account` |
| Project catalog | `projects_<env>` (dev/uat), `<prod_project_catalog>` (prod) | `databricks.workspace` |
| Feature catalog | `<feature_catalog>_<env>` | `databricks.workspace` |

### Deployment

- `workflow_dispatch` on `<infra_apply_workflow>` → pick the target env.
- Runners: dev uses `["<runner-label>","non-prod"]`; uat/prod use `["<runner-label>","prod"]`.
