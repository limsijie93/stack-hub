# RELEASELOG template — environment foundation

Use this template when creating or updating `terraform/environments/RELEASELOG.md`. Fill every
`<placeholder>`. For each foundation PR, add a row to the Summary table AND a full entry below the
`---` divider, and update the **Deployment Status** table for the env(s) applied.

Entry types: `Foundation Inception` · `Catalog Change` · `Grant Update` · `Policy Update` ·
`Snowflake / Foreign Catalog` · `Config Update` · `Hotfix`

---

# Release Log — environment foundation

<One-line description of the foundation layer.>

## Summary

| Date | Title | Type | Envs applied |
|---|---|---|---|
| YYYY-MM-DD | [<Title>](#anchor-slug) | <Type> | dev / uat / prod / pending |

## Deployment Status

| Env | Foundation | Last applied | Notes |
|---|---|---|---|
| dev | ✅ Live / — | YYYY-MM-DD / baseline | — |
| uat | ✅ Live / — | YYYY-MM-DD / baseline | — |
| prod | ✅ Live / — | YYYY-MM-DD / baseline | — |

---

## [YYYY-MM-DD] — <Title>

**Type:** <Foundation Inception | Catalog Change | Grant Update | Policy Update | Snowflake / Foreign Catalog | Config Update | Hotfix>
**PR:** #<number> | **Owner:** @<handle>

### What changed
- <files / blocks changed, e.g. `terraform/environments/uat/uat.tfvars`: added `catalog_configurations.<key>`>

### Impact
- <blast radius: which catalogs / grants / groups / policies; which projects affected>

### Environments
| Env | Applied |
|---|---|
| dev | ✅ YYYY-MM-DD / — |
| uat | ✅ YYYY-MM-DD / — |
| prod | ✅ YYYY-MM-DD / — |
