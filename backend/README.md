# CloudVault - Serverless File Management Platform

CloudVault is a production-ready serverless backend for uploading, listing, downloading, and deleting files using AWS Lambda, API Gateway, S3, DynamoDB, IAM, CloudWatch, Terraform, and GitHub Actions.

## Architecture

- API Gateway HTTP API exposes REST endpoints.
- Lambda functions run the file workflows.
- S3 stores encrypted file objects with public access blocked.
- DynamoDB stores file metadata.
- IAM policies limit Lambda access to the CloudVault bucket and metadata table.
- CloudWatch log groups retain API and Lambda logs.

## API

### Upload a file

`POST /files/upload`

Request body:

```json
{
  "file_name": "invoice.txt",
  "file_type": "text/plain",
  "content_base64": "SGVsbG8gQ2xvdWRWYXVsdA=="
}
```

Response:

```json
{
  "file": {
    "file_id": "uuid",
    "file_name": "invoice.txt",
    "file_size": 16,
    "file_type": "text/plain",
    "upload_time": "2026-06-23T12:00:00Z",
    "s3_key": "uploads/uuid/invoice.txt",
    "status": "uploaded"
  }
}
```

### List files

`GET /files`

### Download a file

`GET /files/{id}/download`

Returns a temporary S3 pre-signed URL.

### Delete a file

`DELETE /files/{id}`

Deletes the S3 object and removes its DynamoDB metadata.

## Local Development

Use Python 3.12.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt -r requirements-dev.txt
pytest
```

On Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt -r requirements-dev.txt
pytest
```

## Deployment

Prerequisites:

- AWS account and credentials.
- Terraform 1.6 or newer.
- Python 3.12.

Configure AWS credentials locally with an AWS profile or environment variables. No credentials are stored in the project.

```bash
cd backend/terraform
terraform init
terraform fmt
terraform validate
terraform plan -out cloudvault.tfplan
terraform apply cloudvault.tfplan
```

After deployment, Terraform prints the API endpoint.

Terraform also creates the frontend hosting layer:

- Private S3 bucket for React build assets
- CloudFront distribution with Origin Access Control
- SPA fallback to `index.html`
- Security response headers

## Terraform Variables

Common variables are defined in `terraform/provider.tf`:

- `aws_region`
- `project_name`
- `environment`
- `allowed_file_types`
- `max_file_size_bytes`
- `presigned_url_ttl_seconds`
- `log_retention_days`
- `force_destroy_bucket`
- `cors_allowed_origins`
- `frontend_domain_aliases`
- `frontend_acm_certificate_arn`

Example:

```bash
terraform apply \
  -var="aws_region=us-east-1" \
  -var="environment=prod" \
  -var='cors_allowed_origins=["https://cloudvault.example.com"]' \
  -var="force_destroy_bucket=false"
```

Full cloud architecture documentation is available in `../docs/cloudvault-architecture.md`.

## GitHub Actions CI/CD

The workflow at `.github/workflows/cloudvault-ci-cd.yml` runs on push:

1. Installs Python dependencies.
2. Runs unit tests.
3. Validates Terraform.
4. Packages Lambda source artifacts.
5. Applies Terraform on pushes to `main`.

For deployment, configure these repository secrets:

- `AWS_ROLE_TO_ASSUME`: IAM role ARN trusted by GitHub OIDC.
- `AWS_REGION`: target AWS region, for example `us-east-1`.

The deployment job uses OIDC instead of long-lived AWS access keys.

## Security Notes

- S3 bucket public access is blocked.
- S3 server-side encryption is enabled.
- DynamoDB server-side encryption and point-in-time recovery are enabled.
- Lambda IAM access is scoped to the CloudVault bucket and table.
- Configuration is injected through environment variables.
- Lambda code does not contain hardcoded AWS credentials.
