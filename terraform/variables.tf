# variables.tf - Definicje zmiennych

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "radio-app"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "ami_id" {
  description = "AMI ID for Ubuntu 24.04 LTS"
  type        = string
  # Ubuntu 24.04 LTS in us-east-1
  default = "ami-0e2c8caa4b6378d8c"
}

variable "github_repo" {
  description = "GitHub repository URL"
  type        = string
  default     = "https://github.com/mikolaj-olesinski/chmury.git"
}

variable "public_key" {
  description = "Public key for EC2 access"
  type        = string
  # You'll need to provide this - generate with: ssh-keygen -t rsa -b 4096
  default = ""
}

variable "key_name" {
  description = "Name of the AWS key pair"
  type        = string
  default     = "radio-app-key"
}