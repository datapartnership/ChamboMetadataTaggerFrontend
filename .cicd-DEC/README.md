# Node WebApp platform manual

This manual covers the Node WebApp path only. It explains how the pipeline is built, what each step does, and how to configure the variable group so the pipeline can build and deploy.

## Scope

Use this manual when provisioning with:
- `deployment_platform=webapp`
- `application_type=node`

What provisioning creates:
- Repo containing the Node sample app under `applications/webapp/node`.
- A stitched pipeline at `.cicd-<project>/azure-pipeline.yaml`.
- Variable group `<repo>-CICD-Configuration` with defaults and placeholders.

## How the stitched pipeline is built

Provisioning creates one pipeline file by assembling templates:

Wrapper pipeline:
- `applications/webapp/node/.cicd/azure-pipeline.yaml`

Injected fragments:
- `applications/.cicd/header.yaml` -> branch triggers, environment list, variable group reference.
- `applications/.cicd/scan.yaml` -> Prisma, Veracode, BlackDuck scans.
- `applications/webapp/.cicd/deploy.yaml` -> Web App deploy logic.
- `applications/.cicd/postdeployscan.yaml` -> Rapid7 post-deploy scan.

The final pipeline is a single file in `.cicd-<project>/azure-pipeline.yaml`.

## Build job (Node)

BuildJob is defined in `applications/webapp/node/.cicd/azure-pipeline.yaml` and runs once per environment.

### What happens during the build

1. The pipeline checks out the repo.
2. It installs the requested Node.js version (unless `BuiltIn`).
3. It writes a temporary `.npmrc` pointing to Artifactory.
4. It runs `npm install`.
5. It runs an environment build script if present, such as `build:dev` or `build:prod`.
6. It runs `npm prune --omit=dev` to keep only production dependencies.
7. It deletes the `.npmrc` file.
8. It archives the repo as `<BuildId>_<ENV>.zip`.
9. It publishes the artifact as `application_<ENV>`.

### NPM credentials

The `.npmrc` file is generated using:

- `BUILD_ARTIFACTORY_REGISTRY`
- `BUILD_ARTIFACTORY_USERNAME`
- `BUILD_ARTIFACTORY_PASSWORD`

The password is stored as base64 in the variable group and passed directly to npm.

### Environment build script

The pipeline tries to run `npm run build:<env>` where `<env>` is `dev`, `qa`, `stage`, or `prod`.

If your `package.json` does not define these scripts, the step does nothing (`--if-present`).

### Artifact layout

- Artifact name: `application_<ENV>`
- Artifact file: `<BuildId>_<ENV>.zip`

## Deploy job (Web App)

DeployJob is defined in `applications/webapp/.cicd/deploy.yaml` and runs only if:

- BuildJob succeeded.
- Enabled scans succeeded.
- Both required deploy variables are set for the environment:
  - `DEPLOY_WEBAPP_SERVICE_CONNECTION_<ENV>`
  - `DEPLOY_WEBAPP_APP_NAME_<ENV>`

### Linux vs Windows App Service

You must set the correct app type:

- `DEPLOY_WEBAPP_APP_TYPE=webAppLinux` for Linux App Service
- `DEPLOY_WEBAPP_APP_TYPE=webApp` for Windows App Service

If Linux:
- `DEPLOY_WEBAPP_RUNTIME_STACK` is required (example `NODE|20`).

## Security scans (optional)

Scan jobs exist but run only when toggles are enabled.

### Prisma (Checkov)

- Toggle: `SECURITY_PRISMACLOUD_SCAN`
- Requires:
  - `SECURITY_PRISMACLOUD_API_URL`
  - `SECURITY_PRISMACLOUD_BC_API_KEY`

### Veracode

- Toggle: `SECURITY_VERACODE_SCAN`
- Requires:
  - `SECURITY_VERACODE_API_ID`
  - `SECURITY_VERACODE_API_KEY`
  - `SECURITY_VERACODE_JFROG_API_KEY`
  - `SECURITY_VERACODE_TEAMNAME`
  - `SECURITY_BLACKDUCK_ACN_NUMBER`
  - Optional: `SECURITY_VERACODE_HOOK_USER`, `SECURITY_VERACODE_HOOK_PASSWORD`

### BlackDuck

- Toggle: `SECURITY_BLACKDUCK_SCAN`
- Requires:
  - `SECURITY_BLACKDUCK_AWS_REGION`
  - `SECURITY_BLACKDUCK_OIS_S3_BUCKET_NAME`
  - `SECURITY_BLACKDUCK_USERNAME`
  - `SECURITY_BLACKDUCK_PASSWD`
  - `SECURITY_BLACKDUCK_ACN_NUMBER`

### Rapid7 (post‑deploy)

- Toggle: `SECURITY_RAPID7_SCAN`
- Requires:
  - `RAPID7_API_URL`
  - `RAPID7_API_KEY`

### DEV scan override

- `SECURITY_OVERRIDE_DEV_SCAN=Enabled` skips scans in DEV.

## Variable group: what is provisioned for Node WebApp

Provisioning creates `<repo>-CICD-Configuration` and populates defaults from:

- `deployment.yaml` (general and scan defaults)
- `applications/webapp/.cicd/variables.yaml` (webapp deploy defaults)
- `applications/webapp/node/.cicd/variables.yaml` (Node build defaults)

### Required build variables

- `BUILD_NODEJS_VERSION`
  - Default: `BuiltIn`.
  - Set to `20.x` or another version if you need a specific Node.

- `BUILD_ARTIFACTORY_REGISTRY`
  - Default: `npm-remote`.

- `BUILD_ARTIFACTORY_USERNAME`
  - Secret value from Key Vault.

- `BUILD_ARTIFACTORY_PASSWORD`
  - Secret value from Key Vault (base64).

### Required deploy variables (per environment)

DeployJob is skipped if these are empty:

- `DEPLOY_WEBAPP_SERVICE_CONNECTION_<ENV>`
- `DEPLOY_WEBAPP_APP_NAME_<ENV>`

Minimum for DEV:
- `DEPLOY_WEBAPP_SERVICE_CONNECTION_DEV`
- `DEPLOY_WEBAPP_APP_NAME_DEV`

### Required platform type

- `DEPLOY_WEBAPP_APP_TYPE`
  - Must be `webAppLinux` or `webApp`.
  - Provisioned as `REPLACE_ME` and must be set.

### Linux requirement

If `DEPLOY_WEBAPP_APP_TYPE=webAppLinux`:
- `DEPLOY_WEBAPP_RUNTIME_STACK` must be set (example `NODE|20`).

### Optional deployment settings

- `DEPLOY_WEBAPP_STARTUP_COMMAND`
  - Default for Node is empty in webapp defaults.

- `DEPLOY_WEBAPP_APP_SETTINGS`
  - App settings in key=value format.

- `DEPLOY_WEBAPP_CONFIGURATION_STRINGS`
  - Connection strings.

### Scan defaults provisioned by deployment.yaml

- `SECURITY_OVERRIDE_DEV_SCAN=Disabled`
- `SECURITY_VERACODE_APPNAME=ITSPL Entra ID AMS - <Pipeline Name>`
- `SECURITY_VERACODE_TEAMNAME=ITSPL Entra ID AMS`
- `SECURITY_BLACKDUCK_ACN_NUMBER=ACN-3000-00007`
- `SECURITY_BLACKDUCK_USERNAME=ACN300000007atcjo`
- `SECURITY_BLACKDUCK_AWS_REGION=us-east-1`
- `SECURITY_BLACKDUCK_OIS_S3_BUCKET_NAME=eaoistestbucket122217`
- `SECURITY_VERACODE_SCAN=Disabled`
- `SECURITY_BLACKDUCK_SCAN=Disabled`
- `SECURITY_RAPID7_SCAN=Disabled`
- `SECURITY_PRISMACLOUD_SCAN=Disabled`
- `SECURITY_PRISMACLOUD_API_URL=https://api2.prismacloud.io`

Provisioned scan secrets:
- `SECURITY_PRISMACLOUD_BC_API_KEY`
- `SECURITY_VERACODE_API_ID`
- `SECURITY_VERACODE_API_KEY`
- `SECURITY_VERACODE_JFROG_API_KEY`
- `SECURITY_BLACKDUCK_PASSWORD`

Important note for BlackDuck:
- The scan job expects `SECURITY_BLACKDUCK_PASSWD`.
- The variable group uses `SECURITY_BLACKDUCK_PASSWORD`.
- Add `SECURITY_BLACKDUCK_PASSWD` with the same secret if enabling BlackDuck.

## How to locate required values

### Service connection name

1. Azure DevOps -> Project Settings -> Service connections.
2. Copy the exact display name.
3. Paste into `DEPLOY_WEBAPP_SERVICE_CONNECTION_<ENV>`.

### App Service name

1. Azure Portal -> App Services.
2. Open your App Service.
3. Copy the App Service name (not the URL).
4. Paste into `DEPLOY_WEBAPP_APP_NAME_<ENV>`.

### Runtime stack (Linux)

1. Azure Portal -> App Service.
2. Configuration -> General settings.
3. Note the runtime (example: Node 20).
4. Set `DEPLOY_WEBAPP_RUNTIME_STACK=NODE|20`.

## Minimum checklist for first successful run

1. Set `PIPELINE_AGENTPOOL`.
2. Set `DEPLOY_WEBAPP_APP_TYPE`.
3. Set `DEPLOY_WEBAPP_SERVICE_CONNECTION_DEV`.
4. Set `DEPLOY_WEBAPP_APP_NAME_DEV`.
5. If Linux, set `DEPLOY_WEBAPP_RUNTIME_STACK`.
6. Run the pipeline.
7. Confirm DeployJob ran.

## Validation after a run

- Build artifact `application_DEV` contains `<BuildId>_DEV.zip`.
- DeployJob executed (not skipped).
- Azure App Service shows a new deployment.
- App URL responds.

## Common failure reasons

- `DEPLOY_WEBAPP_APP_TYPE` left as `REPLACE_ME`.
- Missing npm credentials.
- Missing runtime stack for Linux.
- Scan toggles enabled but secrets missing.

## Where to modify behavior

- Build job: `applications/webapp/node/.cicd/azure-pipeline.yaml`
- Deploy job: `applications/webapp/.cicd/deploy.yaml`
- WebApp defaults: `applications/webapp/.cicd/variables.yaml`
- Node build defaults: `applications/webapp/node/.cicd/variables.yaml`
