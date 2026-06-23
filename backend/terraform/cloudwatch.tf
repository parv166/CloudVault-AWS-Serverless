resource "aws_cloudwatch_log_group" "upload_file" {
  name              = "/aws/lambda/${local.name_prefix}-upload-file"
  retention_in_days = var.log_retention_days

  tags = local.common_tags
}

resource "aws_cloudwatch_log_group" "list_files" {
  name              = "/aws/lambda/${local.name_prefix}-list-files"
  retention_in_days = var.log_retention_days

  tags = local.common_tags
}

resource "aws_cloudwatch_log_group" "download_file" {
  name              = "/aws/lambda/${local.name_prefix}-download-file"
  retention_in_days = var.log_retention_days

  tags = local.common_tags
}

resource "aws_cloudwatch_log_group" "delete_file" {
  name              = "/aws/lambda/${local.name_prefix}-delete-file"
  retention_in_days = var.log_retention_days

  tags = local.common_tags
}

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${local.name_prefix}"
  retention_in_days = var.log_retention_days

  tags = local.common_tags
}
