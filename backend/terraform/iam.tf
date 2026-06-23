data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "lambda_exec" {
  name               = "${local.name_prefix}-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  tags = local.common_tags
}

data "aws_iam_policy_document" "lambda_permissions" {
  statement {
    sid    = "WriteCloudWatchLogs"
    effect = "Allow"

    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = [
      "${aws_cloudwatch_log_group.upload_file.arn}:*",
      "${aws_cloudwatch_log_group.list_files.arn}:*",
      "${aws_cloudwatch_log_group.download_file.arn}:*",
      "${aws_cloudwatch_log_group.delete_file.arn}:*",
    ]
  }

  statement {
    sid    = "AccessCloudVaultBucketObjects"
    effect = "Allow"

    actions = [
      "s3:DeleteObject",
      "s3:GetObject",
      "s3:PutObject",
    ]

    resources = ["${aws_s3_bucket.files.arn}/*"]
  }

  statement {
    sid       = "ReadCloudVaultBucketLocation"
    effect    = "Allow"
    actions   = ["s3:GetBucketLocation"]
    resources = [aws_s3_bucket.files.arn]
  }

  statement {
    sid    = "AccessCloudVaultMetadata"
    effect = "Allow"

    actions = [
      "dynamodb:DeleteItem",
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:Scan",
    ]

    resources = [aws_dynamodb_table.files.arn]
  }
}

resource "aws_iam_policy" "lambda_permissions" {
  name        = "${local.name_prefix}-lambda-policy"
  description = "Least privilege CloudVault Lambda access to S3, DynamoDB, and CloudWatch Logs."
  policy      = data.aws_iam_policy_document.lambda_permissions.json

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "lambda_permissions" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_permissions.arn
}
