locals {
  effective_cors_allowed_origins = length(var.cors_allowed_origins) > 0 ? var.cors_allowed_origins : distinct(concat(
    ["https://${aws_cloudfront_distribution.frontend.domain_name}"],
    [for domain in var.frontend_domain_aliases : "https://${domain}"]
  ))
}
