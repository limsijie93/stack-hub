# Assertions

Keep a machine-readable twin next to the runner (for example `fixtures/assertions.yaml`).

PII / sensitive data: **aggregates only** (`COUNT`, `MAX(<snapshot_col>)`, grouped counts). Never pull
row-level prediction records to local disk.

## Catalogs by lane

| Lane | Catalog |
|------|---------|
| Pseudo-dev | `<dev_catalog>` |
| True-UAT | `<uat_catalog>` |
| Prod | `<prod_project_catalog>` |

## Per-project checks (template)

| Check | Object | Pass |
|-------|--------|------|
| Upstream prerequisite (if any) | `<upstream_table>` | `COUNT(*) >= 1` before trusting project gold |
| Gold non-empty | `{catalog}.<schema>.<gold_table>` | `COUNT(*) >= 1` |
| Gold freshness | same | `MAX(<snapshot_col>) >= current_date() - 3` (widen only with waiver) |
| Predictions | `{catalog}.<schema>.<pred_table>` | `COUNT(*) >= 1` after inference / T2 |
| Registry (optional) | project model-registry table, if present | ≥1 row for expected model keys when the register job ran |

## Job success

Poll `jobs get-run` until terminal. Pass only on `result_state = SUCCESS`.
`SUCCESS_WITH_FAILURES` passes only if the suite explicitly allows it (default **reject**).
Any `FAILED` / `TIMED_OUT` / `CANCELED` → suite exit 1.

## Example SQL (Pseudo-dev)

```sql
SELECT COUNT(*) AS n, MAX(<snapshot_col>) AS max_dt
FROM <dev_catalog>.<schema>.<gold_table>;

SELECT COUNT(*) AS n
FROM <dev_catalog>.<schema>.<pred_table>;
```
