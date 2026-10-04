# README template — IaC monorepo project

Use this template when creating or updating `projects/<project_name>/README.md`.
Fill every `<placeholder>` with project-specific values. Remove optional sections
that do not apply yet (e.g. `cicd-jobs.tfvars` entries before CI/CD is deployed).

---

# <project_name>

<One-line description of what the project does.>

## Overview

<2–3 sentence elaboration: what data it processes, what it produces, what
business problem it solves.> Infrastructure is provisioned via the Terraform CI/CD framework using `.tfvars` files.

## Project Members

- member1@example.com
- member2@example.com

## Project Structure

    projects/<project_name>/
    ├── env-tf/
    │   ├── dev/
    │   │   ├── project.tfvars
    │   │   └── cicd-jobs.tfvars      # add when CI/CD is deployed
    │   ├── uat/
    │   │   ├── project.tfvars
    │   │   └── cicd-jobs.tfvars      # add when CI/CD is deployed
    │   └── prod/
    │       ├── project.tfvars
    │       └── cicd-jobs.tfvars      # add when CI/CD is deployed
    ├── src/
    │   ├── notebooks/                # add when notebooks exist
    │   ├── pipelines/                # add when pipelines exist
    │   └── requirements.txt          # add when dependencies exist
    ├── README.md
    └── RELEASELOG.md

## Deployment

- **Dev/UAT**: Trigger the `<non_prod_apply_workflow>` GitHub Actions workflow manually.
- **Prod**: Triggered automatically on merge to `main`.

For full CI/CD configuration details, see `projects/<example_project>/README.md`.
