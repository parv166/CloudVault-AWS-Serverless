resource "aws_dynamodb_table" "files" {
  name         = "${local.name_prefix}-files"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "user_id"
  range_key    = "file_id"

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "file_id"
    type = "S"
  }

  point_in_time_recovery {
    enabled = false
  }

  server_side_encryption {
    enabled = true
  }

  tags = local.common_tags
}
