terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }

    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region where CloudVault resources are deployed."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming."
  type        = string
  default     = "cloudvault"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "dev"
}

variable "allowed_file_types" {
  description = "MIME types accepted by the upload Lambda."
  type        = list(string)
  default     = ["application/pdf", "image/jpeg", "image/png", "text/plain"]
}

variable "max_file_size_bytes" {
  description = "Maximum upload size accepted by the upload Lambda."
  type        = number
  default     = 10485760
}

variable "presigned_url_ttl_seconds" {
  description = "Lifetime for generated S3 pre-signed download URLs."
  type        = number
  default     = 900
}

variable "log_retention_days" {
  description = "CloudWatch Logs retention in days."
  type        = number
  default     = 30
}

variable "force_destroy_bucket" {
  description = "Whether Terraform may destroy a non-empty S3 bucket. Keep false in production."
  type        = bool
  default     = false
}

variable "log_level" {
  description = "Lambda log level."
  type        = string
  default     = "INFO"
}

variable "cors_allowed_origins" {
  description = "Allowed browser origins for API Gateway CORS. Use exact CloudFront/custom-domain origins in production."
  type        = list(string)
  default     = ["*"]
}

variable "cors_allowed_headers" {
  description = "Allowed request headers for API Gateway and Lambda CORS responses."
  type        = list(string)
  default     = ["content-type", "authorization"]
}

variable "cors_allowed_methods" {
  description = "Allowed request methods for API Gateway and Lambda CORS responses."
  type        = list(string)
  default     = ["GET", "POST", "DELETE", "OPTIONS"]
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"

  common_tags = {
    Project     = "CloudVault"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
