# CloudVault Frontend

React dashboard for the CloudVault AWS serverless file management backend.

## Stack

- React.js
- Vite
- Tailwind CSS
- Axios
- React Router

## Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Set your API Gateway base URL in `.env`:

```bash
VITE_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
```

Do not include a trailing slash.

## Local Development

```bash
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

The production build is generated in `dist/`.

## Smoke Tests

After the backend is deployed:

```bash
API_URL="https://your-api-id.execute-api.us-east-1.amazonaws.com" npm run smoke:cors
API_URL="https://your-api-id.execute-api.us-east-1.amazonaws.com" npm run smoke:api
```

The API smoke test uploads a temporary text file, lists it, downloads it through a pre-signed URL, and deletes it.

## API Contract

The frontend calls these CloudVault backend endpoints:

- `POST /files/upload`
- `GET /files`
- `GET /files/{id}/download`
- `DELETE /files/{id}`

Uploads are sent as JSON:

```json
{
  "file_name": "report.pdf",
  "file_type": "application/pdf",
  "content_base64": "..."
}
```

## Deployment

Production deployment is designed for a private Amazon S3 bucket behind CloudFront.

For S3 + CloudFront:

```bash
npm run build
aws s3 sync dist/ s3://your-frontend-bucket --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

Configure `VITE_API_URL` before building because Vite embeds environment variables at build time.

Full architecture and deployment documentation is in `../docs/cloudvault-architecture.md`.
