# CloudVault

CloudVault is a serverless file-storage application built on AWS. It
provides user authentication, private file storage, and user-scoped file
operations through an API.

## Features

-   User registration and login with Amazon Cognito.
-   Email confirmation during sign-up.
-   Protected frontend routes for authenticated users.
-   Upload, list, download, and delete files.
-   JWT authorization on API Gateway file-management routes.
-   Per-user file ownership checks in the backend.
-   Private Amazon S3 storage with public access blocked.
-   DynamoDB metadata storage.
-   React frontend hosted on Amazon S3 and delivered through CloudFront.
-   Infrastructure managed with Terraform.

## Architecture

``` text
                         ┌─────────────────────────────┐
                         │          Browser            │
                         │       React + Vite          │
                         └──────────────┬──────────────┘
                                        │
                           Sign in / Sign up
                                        │
                         ┌──────────────▼──────────────┐
                         │       Amazon Cognito        │
                         │       User Pool / JWT       │
                         └──────────────┬──────────────┘
                                        │ JWT
                                        ▼
┌─────────────────┐          ┌─────────────────────────┐
│ CloudFront      │───────── │     API Gateway         │
│ + S3 Frontend   │          │      HTTP API           │
└─────────────────┘          │      JWT Authorizer     │
                             └────────────┬────────────┘
                                          │
                                  Authorized requests
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    ▼                     ▼                     ▼
             ┌────────────┐       ┌────────────┐        ┌────────────┐
             │ List Files │       │ Upload File│        │ Download / │
             │  Lambda    │       │  Lambda    │        │ Delete     │
             └─────┬──────┘       └─────┬──────┘        │  Lambdas   │
                   │                    │               └─────┬──────┘
                   └────────────────────┼─────────────────────┘
                                        │
                           ┌────────────┴────────────┐
                           ▼                         ▼
                    ┌────────────┐            ┌────────────┐
                    │ DynamoDB   │            │ S3 File    │
                    │ Metadata   │            │ Bucket     │
                    └────────────┘            └────────────┘
```

## Technology Stack

  Area                         Technology
  ---------------------------- -----------------------------
  Frontend                     React, Vite, JavaScript
  Authentication               Amazon Cognito
  API                          Amazon API Gateway HTTP API
  Backend                      AWS Lambda, Python
  File storage                 Amazon S3
  Metadata                     Amazon DynamoDB
  CDN / frontend delivery      Amazon CloudFront
  Infrastructure as Code       Terraform
  Region used for deployment   `ap-south-1` (Mumbai)

## Repository Structure

``` text
CloudVault-AWS-Serverless/
├── backend/
│   ├── lambda/
│   │   ├── delete_file/
│   │   ├── download_file/
│   │   ├── list_files/
│   │   ├── upload_file/
│   │   └── layer/
│   ├── terraform/
│   └── tests/
└── frontend/
    ├── scripts/
    └── src/
        ├── components/
        ├── config/
        ├── context/
        ├── hooks/
        ├── pages/
        ├── routes/
        └── services/
```

## API Routes

The API uses a Cognito JWT authorizer for these file operations.

  Method     Route                    Purpose
  ---------- ------------------------ -------------------------------------
  `GET`      `/files`                 List the authenticated user's files
  `POST`     `/files/upload`          Upload a file
  `GET`      `/files/{id}/download`   Request a download for a file
  `DELETE`   `/files/{id}`            Delete a file

Requests must include a valid Cognito JWT:

``` http
Authorization: Bearer <COGNITO_JWT>
```

The backend must derive the caller's identity from the verified token
and enforce ownership for each file operation. A client-supplied user ID
must not be treated as proof of ownership.

## Prerequisites

-   Node.js and npm
-   Python 3
-   AWS CLI
-   Terraform
-   An AWS account with permissions to provision the required services
-   An Amazon Cognito User Pool and app client (created by the Terraform
    configuration)
-   An AWS CLI profile configured for deployment

Use the AWS region configured for this project: `ap-south-1`.

## Frontend Setup

1.  Open the frontend directory:

    ``` bash
    cd frontend
    ```

2.  Install dependencies:

    ``` bash
    npm ci
    ```

3.  Create a local environment file based on the example:

    ``` bash
    cp .env.example .env.local
    ```

4.  Set the required frontend configuration values in `.env.local`. Use
    the exact variable names documented in `frontend/.env.example`.
    These values should identify the Cognito User Pool, Cognito app
    client, AWS region, and API endpoint as required by the application.

    Do not commit `.env.local` or put credentials and secrets in
    frontend variables. Values embedded in a browser application are
    public.

5.  Start the development server:

    ``` bash
    npm run dev
    ```

6.  Create a production build:

    ``` bash
    npm run build
    ```

## Backend Tests

The backend test suite is located in `backend/tests`.

If the project virtual environment is available:

``` bash
cd backend
source .venv/bin/activate
pytest -q
```

Install the backend test dependencies from the dependency file in
`backend/` if setting up a fresh environment.

## Terraform

Terraform configuration is in `backend/terraform`.

Initialize and inspect the configuration:

``` bash
terraform -chdir=backend/terraform init
terraform -chdir=backend/terraform fmt -check -recursive
terraform -chdir=backend/terraform validate
terraform -chdir=backend/terraform plan
```

Review the plan carefully before applying it:

``` bash
terraform -chdir=backend/terraform apply
```

**Important:** This project uses an S3 remote Terraform state backend.
Use the existing backend configuration and the correct AWS
account/profile. Do not change, delete, or recreate the state bucket or
state file as part of routine deployment. Never run `terraform destroy`
against a deployed environment unless you intentionally mean to remove
its infrastructure and have reviewed the impact.

Environment-specific Terraform variable values belong in an untracked
`terraform.tfvars` file or another approved secure configuration
mechanism. Do not commit that file.

## Security Notes

-   API Gateway routes are protected by a Cognito JWT authorizer.
-   S3 Block Public Access is enabled for the file bucket.
-   S3 default server-side encryption is configured.
-   S3 bucket ownership controls are set to `BucketOwnerEnforced`.
-   File operations must verify that the authenticated user owns the
    requested file.
-   Keep `.env.local`, `terraform.tfvars`, Terraform state, plan files,
    credentials, and private keys out of Git.
-   Never paste JWTs, refresh tokens, AWS credentials, or presigned
    download URLs into issue trackers or public repositories.
-   Review IAM policies for least-privilege access before deploying
    changes.

## Validation Performed

The project validation recorded during development includes:

-   Backend test suite: 18 tests passed.
-   Frontend production build completed successfully.
-   Terraform formatting check completed successfully.
-   Unauthenticated API access was rejected.
-   S3 public-access and encryption settings were inspected.
-   Cross-user download and deletion checks were reported as passed
    during manual testing.

Run the tests again against the exact revision and target AWS
environment before relying on these results for a production release.

## Deployment Notes

The deployed application has used AWS Mumbai (`ap-south-1`). Frontend
hosting uses S3 and CloudFront; the API is exposed through API Gateway.
Cognito configuration and frontend environment settings must match the
deployed resources.

Do not copy resource IDs, account-specific values, or secrets from
another environment. Obtain them from the current Terraform outputs and
AWS configuration.

## License

No license has been specified yet. Add a `LICENSE` file before
presenting this repository as open source.
