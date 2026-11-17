terraform {
  backend "s3" {
    bucket       = "cloudvault-tfstate-20261117-a47dff375a2a"
    key          = "cloudvault/dev/terraform.tfstate"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true
  }
}
