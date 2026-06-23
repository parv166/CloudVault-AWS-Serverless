terraform {
  backend "s3" {
    bucket = "cloudvault-parv-terraform-state"
    key    = "cloudvault/dev/terraform.tfstate"
    region = "ap-south-1"

    encrypt = true
  }
}
