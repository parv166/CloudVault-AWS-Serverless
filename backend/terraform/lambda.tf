data "archive_file" "common_layer" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/layer"
  output_path = "${path.module}/cloudvault-common-layer.zip"
}

data "archive_file" "upload_file" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/upload_file"
  output_path = "${path.module}/upload-file.zip"
}

data "archive_file" "list_files" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/list_files"
  output_path = "${path.module}/list-files.zip"
}

data "archive_file" "download_file" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/download_file"
  output_path = "${path.module}/download-file.zip"
}

data "archive_file" "delete_file" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/delete_file"
  output_path = "${path.module}/delete-file.zip"
}

resource "aws_lambda_layer_version" "common" {
  layer_name          = "${local.name_prefix}-common"
  filename            = data.archive_file.common_layer.output_path
  source_code_hash    = data.archive_file.common_layer.output_base64sha256
  compatible_runtimes = ["python3.12"]
  description         = "Shared CloudVault Python utilities."
}

locals {
  lambda_environment = {
    CLOUDVAULT_BUCKET         = aws_s3_bucket.files.id
    CLOUDVAULT_TABLE          = aws_dynamodb_table.files.name
    ALLOWED_FILE_TYPES        = join(",", var.allowed_file_types)
    MAX_FILE_SIZE_BYTES       = tostring(var.max_file_size_bytes)
    PRESIGNED_URL_TTL_SECONDS = tostring(var.presigned_url_ttl_seconds)
    LOG_LEVEL                 = var.log_level
    S3_SSE_ALGORITHM          = "AES256"
    CORS_ALLOWED_ORIGINS      = join(",", var.cors_allowed_origins)
    CORS_ALLOWED_HEADERS      = join(",", var.cors_allowed_headers)
    CORS_ALLOWED_METHODS      = join(",", var.cors_allowed_methods)
  }
}

resource "aws_lambda_function" "upload_file" {
  function_name    = "${local.name_prefix}-upload-file"
  description      = "Validates uploads, stores objects in S3, and writes file metadata."
  role             = aws_iam_role.lambda_exec.arn
  runtime          = "python3.12"
  handler          = "app.handler"
  filename         = data.archive_file.upload_file.output_path
  source_code_hash = data.archive_file.upload_file.output_base64sha256
  memory_size      = 256
  timeout          = 30
  publish          = true
  layers           = [aws_lambda_layer_version.common.arn]

  environment {
    variables = local.lambda_environment
  }

  depends_on = [
    aws_cloudwatch_log_group.upload_file,
    aws_iam_role_policy_attachment.lambda_permissions,
  ]

  tags = local.common_tags
}

resource "aws_lambda_function" "list_files" {
  function_name    = "${local.name_prefix}-list-files"
  description      = "Lists uploaded file metadata from DynamoDB."
  role             = aws_iam_role.lambda_exec.arn
  runtime          = "python3.12"
  handler          = "app.handler"
  filename         = data.archive_file.list_files.output_path
  source_code_hash = data.archive_file.list_files.output_base64sha256
  memory_size      = 256
  timeout          = 30
  publish          = true
  layers           = [aws_lambda_layer_version.common.arn]

  environment {
    variables = local.lambda_environment
  }

  depends_on = [
    aws_cloudwatch_log_group.list_files,
    aws_iam_role_policy_attachment.lambda_permissions,
  ]

  tags = local.common_tags
}

resource "aws_lambda_function" "download_file" {
  function_name    = "${local.name_prefix}-download-file"
  description      = "Generates temporary S3 pre-signed URLs for file downloads."
  role             = aws_iam_role.lambda_exec.arn
  runtime          = "python3.12"
  handler          = "app.handler"
  filename         = data.archive_file.download_file.output_path
  source_code_hash = data.archive_file.download_file.output_base64sha256
  memory_size      = 256
  timeout          = 30
  publish          = true
  layers           = [aws_lambda_layer_version.common.arn]

  environment {
    variables = local.lambda_environment
  }

  depends_on = [
    aws_cloudwatch_log_group.download_file,
    aws_iam_role_policy_attachment.lambda_permissions,
  ]

  tags = local.common_tags
}

resource "aws_lambda_function" "delete_file" {
  function_name    = "${local.name_prefix}-delete-file"
  description      = "Deletes files from S3 and removes DynamoDB metadata."
  role             = aws_iam_role.lambda_exec.arn
  runtime          = "python3.12"
  handler          = "app.handler"
  filename         = data.archive_file.delete_file.output_path
  source_code_hash = data.archive_file.delete_file.output_base64sha256
  memory_size      = 256
  timeout          = 30
  publish          = true
  layers           = [aws_lambda_layer_version.common.arn]

  environment {
    variables = local.lambda_environment
  }

  depends_on = [
    aws_cloudwatch_log_group.delete_file,
    aws_iam_role_policy_attachment.lambda_permissions,
  ]

  tags = local.common_tags
}
