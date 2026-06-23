resource "aws_apigatewayv2_api" "cloudvault" {
  name          = "${local.name_prefix}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_headers = var.cors_allowed_headers
    allow_methods = var.cors_allowed_methods
    allow_origins = var.cors_allowed_origins
    max_age       = 300
  }

  tags = local.common_tags
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.cloudvault.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId        = "$context.requestId"
      requestTime      = "$context.requestTime"
      httpMethod       = "$context.httpMethod"
      routeKey         = "$context.routeKey"
      status           = "$context.status"
      protocol         = "$context.protocol"
      responseLength   = "$context.responseLength"
      integrationError = "$context.integrationErrorMessage"
    })
  }

  tags = local.common_tags
}

resource "aws_apigatewayv2_integration" "upload_file" {
  api_id                 = aws_apigatewayv2_api.cloudvault.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.upload_file.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "list_files" {
  api_id                 = aws_apigatewayv2_api.cloudvault.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.list_files.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "download_file" {
  api_id                 = aws_apigatewayv2_api.cloudvault.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.download_file.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "delete_file" {
  api_id                 = aws_apigatewayv2_api.cloudvault.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.delete_file.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "upload_file" {
  api_id    = aws_apigatewayv2_api.cloudvault.id
  route_key = "POST /files/upload"
  target    = "integrations/${aws_apigatewayv2_integration.upload_file.id}"
}

resource "aws_apigatewayv2_route" "list_files" {
  api_id    = aws_apigatewayv2_api.cloudvault.id
  route_key = "GET /files"
  target    = "integrations/${aws_apigatewayv2_integration.list_files.id}"
}

resource "aws_apigatewayv2_route" "download_file" {
  api_id    = aws_apigatewayv2_api.cloudvault.id
  route_key = "GET /files/{id}/download"
  target    = "integrations/${aws_apigatewayv2_integration.download_file.id}"
}

resource "aws_apigatewayv2_route" "delete_file" {
  api_id    = aws_apigatewayv2_api.cloudvault.id
  route_key = "DELETE /files/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.delete_file.id}"
}

resource "aws_lambda_permission" "upload_file" {
  statement_id  = "AllowApiGatewayUploadInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.upload_file.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.cloudvault.execution_arn}/*/*"
}

resource "aws_lambda_permission" "list_files" {
  statement_id  = "AllowApiGatewayListInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.list_files.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.cloudvault.execution_arn}/*/*"
}

resource "aws_lambda_permission" "download_file" {
  statement_id  = "AllowApiGatewayDownloadInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.download_file.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.cloudvault.execution_arn}/*/*"
}

resource "aws_lambda_permission" "delete_file" {
  statement_id  = "AllowApiGatewayDeleteInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_file.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.cloudvault.execution_arn}/*/*"
}

output "api_endpoint" {
  description = "CloudVault API Gateway endpoint."
  value       = aws_apigatewayv2_api.cloudvault.api_endpoint
}

output "files_bucket_name" {
  description = "S3 bucket storing CloudVault files."
  value       = aws_s3_bucket.files.id
}

output "metadata_table_name" {
  description = "DynamoDB table storing CloudVault metadata."
  value       = aws_dynamodb_table.files.name
}
