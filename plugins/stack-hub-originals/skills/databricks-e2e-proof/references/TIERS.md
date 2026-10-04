# Tiers

## Matrix

| Tier | When | Jobs (Pseudo-dev keys; drop the prefix on True-UAT/Prod) | Pass |
|------|------|----------------------------------------------------------|------|
| **T0** | Every change | Local unit / contract tests | Exit 0 |
| **T1** | Default after Pseudo-dev apply | Inference job, register job, drift job; + pipeline path when features/pipeline touched | Jobs SUCCESS + UC aggregates |
| **T2** | Before True-UAT; or pipeline/inference/job-IaC wiring change | Full chain job (pipeline → sync → inference) **plus** T1 registry + drift | All chain tasks SUCCESS; gold + predictions fresh; T1 asserts |

CLI: `--tier t0|t1|t2`. True-UAT/Prod is a **lane**, not a tier number — there is no T3.
Re-run the same tiers with `--lane true-uat|prod --tier t1|t2` only after explicit user go-ahead;
the asserts are the same, run against that lane's catalogs.

## Change-impact routing

| Change surface | Minimum Pseudo-dev proof | Before True-UAT |
|----------------|--------------------------|-----------------|
| Config-only inference / registry / drift | T0 + T1 (no pipeline) | T2 recommended if pins change scoring |
| Pipeline source, pipeline meta config, sync notebooks | T0 + T1 with `--include-ldp` | **T2 required** |
| Job IaC task graph / `deployed` / catalog | T0 + **T2** | T2 on True-UAT after go-ahead |
| Training / new model pin | T0 + T1 (register + inference) | T2 if the daily chain must pick up the pin |
| Docs-only | T0 | — |

The agent may pass `--tier` explicitly. When unsure, prefer the higher tier.

## Pipeline-inclusive T1 (`--include-ldp`)

| Project shape | Job used for the pipeline path |
|---------------|-------------------------------|
| Has a pipeline-only adhoc job (pipeline → sync, no inference) | Run it, then T1 inference |
| No pipeline-only job | Run the full chain job, and **skip** standalone inference when the chain already scored |

## Bootstrap

First apply or pipeline rename: run the bootstrap job once **before** T1/T2.
It is not included in every suite run.
